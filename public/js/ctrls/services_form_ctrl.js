var R = require('ramda'),
  _ = require('lodash')
  $ = require('jquery'),
  Utils = require('../utils'),
  schema = require('../schema/service_form');

var _interaction_to_json_editor_value = function(i){
  var kv = {
    _id: i._id, 
    display_name: i.defaults.display_name, 
    name: i.defaults.display_name, 
    description: i.defaults.description,
    compatibility: i.compatibility,
    max: -1,
    role: 'Role', 

  };

  kv.remappings = R.map(function(if0){
    return {
      remap_to: if0.name,
      remap_from: "/"+if0.name
    };
  })(i.interface);

  console.log(kv.remappings);


  kv.parameters = R.map(function(p){
    return {
      key: p.name, 
      value: (p.default || '')
    };
  })(i.parameters);
  return kv;

};



module.exports = function($scope, blocksStore, $http, serviceAuthoring, $stateParams, $state) {
   $scope.select2Options = {
     allowClear:true
   };



   // $scope.blockConfigs = {};
   // $scope.currentBlockConfig = '';
   $scope.value = {};
   $scope.destPackage = null;
   blocksStore.getParam(ITEMS_PARAM_KEY).then(function(rows){
     blocksStore.loadInteractions().then(function(interactions){
       interactions = interactions.data;


       var titles = R.pluck('title')(rows);
       console.log(titles);
       schema.properties.workflows.items.enum = titles;

       var editor = window.editor =$scope.editor = new JSONEditor($('#service-editor').get(0), {
         disable_array_reorder: true,
         disable_collapse: true,
         disable_edit_json: true,
         disable_properties: true,
         schema: schema,
         ajax: true

       });

       editor.on('ready', function(){
         console.log('ready');


       });


       var form_v = editor.getValue();
       if($stateParams.service_id){
         var vv = R.find(R.propEq('id', $stateParams.service_id))($scope.services);
         form_v = vv;

         console.log("FORM V", form_v);


       }
       if($stateParams.new_name){
         form_v.name = $stateParams.new_name;
       }
       editor.setValue(form_v);
       var e0 = editor.getEditor('root.parameters');



       var selected_workflows = 0;


       editor.on('change', function(){
         var propIn = R.useWith(R.compose, R.flip(R.contains), R.prop);
         console.log('editor changed');

         var cur = editor.getValue();
         console.log('current value', cur);
         var curlen = cur.workflows.length;
         if(selected_workflows !== curlen){

           var rows_selected = R.filter(propIn(cur.workflows, 'title'))(rows);



           if(rows_selected.length == 0){
             var v = editor.getValue();
             v.interactions = [];
             editor.setValue(v);
           }


           R.map(function(rs){
             var xml = rs.xml;
             var extras = $(xml).find('mutation[extra]').map(function(){
               var extra = $(this).attr('extra');  
               return JSON.parse(extra);
             }).toArray();

             client_app_names = R.uniq(R.pluck('client_app_name', extras));

             var v = editor.getValue();
             console.log(v.interactions);

             var used_interactions = R.compose(
               R.reject(propIn(R.pluck('_id')(v.interactions), '_id')),
               R.filter(propIn(client_app_names, 'name'))
             )(interactions);
             console.log("used interactions :", used_interactions);


             v.interactions = v.interactions.concat( R.map(_interaction_to_json_editor_value)(used_interactions) );
             editor.setValue(v);





           })(rows_selected);




           selected_workflows = curlen;
         };
       });

     });



   });





  serviceAuthoring.getPackages().then(function(packs){
    $scope.packageList = packs;
  });

  $scope.exportOk = function(){
    var destPackage = $scope.value.destPackage;


    var v = editor.getValue();


    serviceAuthoring.saveService(v, destPackage).then(function(){
      alert('saved');
      $('#modal-package-select').modal('hide');
      
    });

  };
  $scope.export = function(){
    serviceAuthoring.getPackages().then(function(packs){
      // $scope.packageList = packs;

      // var v = editor.getValue();
      // serviceAuthoring.saveService(v);

      $('#modal-package-select').modal();

    });


  };
  $scope.save = function(){
    console.log('save');

    var v = editor.getValue();

    console.log("save data : ", v);

    if(v.id){
      console.log($scope.services);

      var idx = -1;
      for(var i = 0; i<$scope.services.length; i++){
        if($scope.services[i].id == v.id){
          idx = i;
          break;
        }

      }
      if(idx >= 0){
        console.log('x');

         $scope.services[idx] = v;

      }



    }else{
      v.id = Utils.uuid();
      v.created_at = new Date().getTime();
      $scope.services.push(v);
      $state.go('services_edit', {service_id: v.id});

      
    }
    


    // serviceAuthoring.saveService(v, $scope.destPackage[0].name).then(function(){
      // alert('saved');
      
    // });
    $('#modal-package-select').modal('hide');


  };


};
