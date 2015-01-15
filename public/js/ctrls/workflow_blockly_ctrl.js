
angular.module('centoAuthoring')
  .controller('WorkflowBlocklyCtrl', WorkflowBlocklyCtrl);
              
              
function WorkflowBlocklyCtrl($scope, blocksStore, $http, $rootScope, $stateParams, $modal, $q) {

  $rootScope.$on('$stateChangeStart', function(e, to) {
    var dirty = checkDirty()
    if(dirty){
      if(dirty == 'not exists'){
        var msg =  'unsaved - want leave?';
      }else if(dirty == 'changed'){
        var msg =  'changed - want leave?';
      }
      if(!confirm(msg)){
        e.preventDefault();
      }
      window.onbeforeunload = null;

    }

  });


  $scope.modalBlockConfig = function(){
    var modalInstance = $modal.open({
      templateUrl: '/js/tpl/block_config.html',
      controller: 'ConfigCtrl',
      controllerAs: 'ctrl'
    });
    

  };




  window.onbeforeunload = function(e){
    var dirty = checkDirty()
    if(dirty){
      if(dirty == 'not exists'){
        return 'unsaved';
      }else if(dirty == 'changed'){
        return 'changed';
      }
    }
    window.onbeforeunload = null;
    return null;
  };

  var checkDirty = function(){
    var exists = R.find(R.propEq('id', $scope.current.id))($scope.items);
    if(!exists){
      return 'not exists';
    }

    if(exists.xml != _xml()){
      return 'changed';
    }

    return false;
  };

  $scope.foo = 'bar';

  $scope.itemSelection = [];
  $scope.rapp_url = "http://files.yujinrobot.com/rocon/rapp_repository/office_rapp.tar.gz";
  $scope.robot_brain = {};



  $rootScope.$on('items:loaded', function(){
    reload_udf_blocks($scope.items);
    if($stateParams.id){ // load
      $scope.load($stateParams.id);
    }
  });
  $rootScope.$on('items:saved', function(){
    reload_udf_blocks($scope.items);

    $('#alert .alert').html('Saved');
    $('#alert').show().delay(500).fadeOut('fast');

  });

  var resetCurrent = function(){
    $scope.current = {id: new Date().getTime() + "", title: 'Untitled', description: 'Service Description'};
  };
  resetCurrent();
  if($stateParams.new_name){
    $scope.current.title = $stateParams.new_name;
  }


  var setupEditable = function(re){
    $('#description, #title').editable('destroy');

    $('#title').editable({
      display: function(){
        $(this).html($scope.current.title);
      },
      value: $scope.current.title,
      success: function(res, newv){
        $scope.current.title = newv;
      }
    });
    $('#description').editable({
      display: function(){
        $(this).html($scope.current.description);
      },
      value: $scope.current.description,
      success: function(res, newv){
        $scope.current.description = newv;
      }
    });

  };

  $rootScope.$on('$viewContentLoaded', function() {
    setupEditable();
  });

  $scope.save = function() {


    var id = $scope.current.id;
    var title = $scope.current.title;
    var description = $scope.current.description;
    try {
      var js = _js();
      var xml = _xml();
    }catch(e){
      alert('failed to save : ' + e.message);

      return null;

    }


    var idx = _.findIndex($scope.items, {id: id});
    if(idx >= 0){
      $scope.items[idx] = {id: id, js: js, xml: xml, title: $scope.current.title, description: description};
      console.log(1);


    }
    else {
      
      $scope.items.push({id: id, title: title, js: js, xml: xml, description: description});
      console.log(2);

    }
    
  };
  Mousetrap.bind('ctrl+s', function(){
    console.log('save triggered');
    $scope.$apply(function(){
      $scope.save();
    });

  });




  var loadBlocks = function(url){
    var $tb = $('#toolbox');
    var generator = new BlockGenerator();
    

    $q.all([blocksStore.loadRapp(), blocksStore.loadInteractions()]).then(function(data){
      var x = data[0];
      var interactions = data[1];

      // 
      // Rapps
      // 
      console.groupCollapsed("Rapp Blocks");

      generator.generate_message_blocks(x.types);

      R.mapObj.idx(function(subTypes, k){
        var $el = generator.message_block_dom(k, subTypes);
      })(x.types);

      /*
       * Rapp blocks
       */
      _.each(x.rapps, function(rapp){
        _.each(rapp.rocon_apps, function(rocon_app, key){
          var meta = rocon_app.public_interface;
          var rapp_name = [rapp.name, key].join("/");
          var compat = 'rocon:/pc';
          var $ros = $tb.find('category[name=ROS]');

          R.forEach(function(pair){
            R.forEach(function(sub){
              var $b = pair[1](
                rapp_name, compat,
                sub.name,
                sub.type);
              $ros.append($b);

            })(pair[0]);

          })([
            [meta.action_servers, generator.scheduled_action_block_dom.bind(generator)],
            [meta.publishers, generator.scheduled_subscribe_block_dom.bind(generator)],
            [meta.subscribers, generator.scheduled_publish_block_dom.bind(generator)]
          ]);

        });

      });
      console.groupEnd();

      //
      // interactions
      //
      console.groupCollapsed('Load interactions');
      console.log(interactions);

      generator.generate_message_blocks(interactions.types);
      R.mapObj.idx(function(subTypes, k){
        var $el = generator.message_block_dom(k, subTypes);
      })(interactions.types);


      var sub_topics_el = R.compose(
        R.map(function($el){ $tb.find('category[name=ROS]').append($el); }),
        R.map(R.bind(generator.generate_client_app_blocks, generator)),
        R.reject(R.isEmpty),
        R.flatten,
        R.map(function(i){ return {interface: i.interface, client_app_id: i._id}; })
        // R.mapProp('interface'),
        // R.map(function(i){ i.interface = R.map(R.assoc('client_app_id', i._id))(i.interface); return i;})
      )(interactions.data);
      


      console.groupEnd();

      // IMPORTANT
      ros_block_override();


      Blockly.updateToolbox($('#toolbox').get(0));
      reload_udf_blocks($scope.items);

    })
    .catch(function(e){
      console.log('cannot load blocks - msg database error');

      
    })
      

  };
  _.defer(loadBlocks);


  $scope.engineLoadChecked = function(){
    var items = $scope.itemSelection;
    console.log(items);

    if(items.length < 1){
      alert('select items to load.');
    }else{
      $http.post('/api/engine/load', {blocks: $scope.itemSelection}).then(function(){
        alert('ok');
      });
    }

  };
  $scope.engineReset = function(){
    $http.post('/api/engine/reset').then(function(){
      alert('ok');
    });

  };

  /**
   * workspace
   *
   */
  $scope.clearWorkspace = function() {
    Blockly.mainWorkspace.clear();
  };

  // $scope.runCurrent = function() {
    // var code;
    // code = Blockly.JavaScript.workspaceToCode();
    // console.log(code);
    // blocksStore.eval(code);

  // };

  $scope.deleteItem = function(id) {
    console.log($scope.items);

    var idx = R.findIndex(R.propEq('id', id))($scope.items);
    if(idx >= 0){
      $scope.items.splice(idx, 1);
      console.log('deleted');
    }
    $scope.current = null;
  };

  $scope.newData = function() {
    Blockly.mainWorkspace.clear();
    resetCurrent();
    setupEditable();

  };
  $scope.load = function(id) {

    var data = R.find(R.propEq('id', id))($scope.items);
    $scope.current = data;
    setupEditable(true);
    console.log(data);


    dom = Blockly.Xml.textToDom(data.xml);
    Blockly.mainWorkspace.clear();

    try{
      Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, dom);
    }catch(e){
      alert('failed to load blocks - '+e.toString());

    }
  };





  /**
   * items checkbox
   */
  $scope.toggleItemSelection = function(id){

    _.include($scope.itemSelection, id) ?
      _.pull($scope.itemSelection, id) :
      $scope.itemSelection.push(id)

  };


  $scope.exportItems = function(){
    var pom = document.createElement('a');
    R.map(function(id){
      var item = R.find(R.propEq('id', id))($scope.items);


      console.log('data:application/json;charset=utf-8,' + JSON.stringify(item));
      pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + JSON.stringify(item))
      pom.setAttribute('download', item.title + ".json");
      pom.click();

    })($scope.itemSelection);

    _.times(2, function(){
    });

  };
  $scope.importItems = function(){
    $('#itemsFile').click()
  };
  $scope.itemsFileNameChanged = function(e){
    var files = e.files;
    var f = files[0];

    var r = new FileReader();
    r.onload = function(e) { 
      var json = e.target.result;
      var item = JSON.parse(json);

      $scope.$apply(function(){
        item.id = new Date().getTime().toString();
        $scope.items.push(item);

      });

      console.log($scope.items);




    }
    r.readAsText(f);




  };

  var onBlocksChange = function(){
    var ws = Blockly.mainWorkspace;
    var m0 = ws.getMetrics();
    // Blockly.svgResize();
    // var scroll = {x: ws.scrollX, y: ws.scrollY};
    var dx = Math.abs(m0.contentLeft - m0.viewLeft);
    var dy = Math.abs(m0.contentTop - m0.viewTop);

    var scroll = {x: dx, y: dy};
    var myId = new Date().getTime();
    console.log('.');


    setTimeout(function(){
      window.socket.emit('blockly:workspace:changed', {id: myId, metrics: ws.getMetrics(), scroll: scroll, xml: _xml()});
    });

  }



  var _updateWorkspace = function(e){
    console.log('UPDATE', e);

    var ws = Blockly.mainWorkspace;
    var m = e.metrics;
    var m0 = ws.getMetrics();
    var xml = e.xml;
    dom = Blockly.Xml.textToDom(xml);


    Blockly.mainWorkspace.clear();
    $(xml).find('block[x]').each(function(){
      var x = $(this).attr('x');
      var y = $(this).attr('y');
      // $(this).removeAttr('x');
      // $(this).removeAttr('y');
      $(this).attr('x', 0);
      $(this).attr('y', 0);
      var blockDom = this;
      var dom = Blockly.Xml.domToBlock(ws, blockDom);
      console.log('will move', x, y);

      dom.moveBy(x, y);
    });;
    // Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, dom);
    // return;






    // var x = (-m.contentLeft) - e.scroll.x;
    // var y = (-m.contentTop) - e.scroll.y;



    // ws.scrollbar.set(x, y);






    var dx = Math.abs((-m.viewLeft) - 15);
    var dy = Math.abs((-m.viewTop) - 15);
    console.log('s', ws.scrollX - dx, ws.scrollY - dy);

    // var dx = Math.abs(m0.contentLeft - m.viewLeft);
    // var dy = Math.abs(m0.contentTop - m.viewTop);
    // ws.scrollbar.set(ws.scrollX - dx, ws.scrollY - dy);
    // ws.scrollbar.set(dx, dy);

      // Blockly.svgResize();
      // var dx = Math.abs(m0.contentLeft - m.viewLeft);
      // var dy = Math.abs(m0.contentTop - m.viewTop);

      // // ratio
    var rx = dx / (m0.contentWidth - m.viewWidth);
    var ry = dy / (m0.contentHeight - m.viewHeight);


      // // scroll value
      // // var sx = e.scroll.x * rx;
      // // var sy = e.scroll.y * ry;
    var sx = ws.scrollX * rx;
    var sy = ws.scrollY * ry;



      

      // console.log('s', m0, m, dx, dy);

        // ws.scrollbar.set(e.scroll.x, e.scroll.y);
        // console.log('s');

      

    // setTimeout(function(){
    // }, 1000);



  };


  var _joinChannel = function(name){
    socket.emit('blockly:channel:join', {name: name}, function(data){
      console.log('1');

      if(data){
      console.log('2');

        _updateWorkspace(data);
      }
      console.log('joined', data);

    });
    blockly_remove_scrollbar();
  };

  $scope.selectChannel = function(){
    var modalInstance = $modal.open({
      templateUrl: '/js/tpl/modal/select_channel.html',
      controller: 'SelectChannelCtrl',
      controllerAs: 'ctrl'
    });
    modalInstance.result.then(function(selectedChannel){
      _joinChannel(selectedChannel);

    });

  };


  var socket = window.socket;
  $('body').on('click', '.sync_lock', function(){
    window.socket.emit('blockly:workspace:lock');
  });


  $('body').on('click', '.sync_join_channel', function(){
    bootbox.prompt('Channel name?', function(n){
      socket.emit('blockly:channel:join', {name: n}, function(data){
        console.log('1');

        if(data){
        console.log('2');

          _updateWorkspace(data);
        }
        console.log('joined', data);

      });
      blockly_remove_scrollbar();
    });

  });
  $('body').on('click', '.sync_new_channel', function(){
    bootbox.prompt('Channel name?', function(n){
      socket.emit('blockly:channel:create', {name: n}, function(x){
        console.log('create callback', arguments);
        Blockly.mainWorkspace.clear();
        blockly_remove_scrollbar();
      });
    });

  });

  window.socket.on('blockly:workspace:changed', function(e){
    _updateWorkspace(e);


  });
  Blockly.mainWorkspace.getCanvas().addEventListener('blocklyWorkspaceChange', onBlocksChange);





};

