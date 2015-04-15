(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
var angular = (typeof window !== "undefined" ? window.angular : typeof global !== "undefined" ? global.angular : null),
  Mousetrap = (typeof window !== "undefined" ? window.Mousetrap : typeof global !== "undefined" ? global.Mousetrap : null),
  Blockly = (typeof window !== "undefined" ? window.Blockly : typeof global !== "undefined" ? global.Blockly : null),
  JSONEditor = (typeof window !== "undefined" ? window.JSONEditor : typeof global !== "undefined" ? global.JSONEditor : null),
  Utils = require('./utils'),
  $ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);

require('./blocks/index');

ITEMS_PARAM_KEY = 'cento_authoring_items';
SERVICES_PARAM_KEY = 'cento_authoring_services';

JSONEditor.defaults.options.theme = 'bootstrap3';


$.fn.editable.defaults.mode = 'inline';
$.fn.editableform.buttons = '<button type="submit" class="btn btn-primary btn-sm editable-submit"><i class="fa fa-check"></i></button><button type="button" class="btn btn-default btn-sm editable-cancel"><i class="fa fa-remove"></i></button>'


var toggle_header_menu = function(){
  $('#header').toggle();
  if($('#header').is(':visible')){
    $('#header_toggler').hide();
    $('.container0').addClass('down');
  }else{
    $('#header_toggler').show();
    $('.container0').removeClass('down');
  }
  Blockly.fireUiEvent(window, 'resize');
  return false;

};
$(function(){
  $(document.body).on('click', '.toggle_header', toggle_header_menu);
  $(document.body).on('click', '.toggle_right', function(){ $('.container0 .right').toggle(); });
  $(document.body).on('click', '.undo', function(){ window.undo_manager.undo(); });
});
Mousetrap.bind('ctrl+alt+t', function(){
  toggle_header_menu();
  return false;

});
Mousetrap.bind('ctrl+alt+y', function(){
  $('.container0 .right').toggle();
  return false;

});


Mousetrap.bind('ctrl+alt+d', function() { 
  var sel = Blockly.selected;
  Blockly.copy_(sel);
  if (Blockly.clipboard_) {
    Blockly.mainWorkspace.paste(Blockly.clipboard_);
  }
});
Mousetrap.bind('ctrl+alt+c', function() { 
  var sel = Blockly.selected;
  if(sel){
    sel.setCollapsed(!sel.collapsed_);

  }
});

window.searching_keyword = null;


findNext = function(keyword){
  var blks = $(_xml()).find('block[type=text]');
  blks.each(function(){
    var txt = $(this).text().trim().toLowerCase();
    var id = $(this).attr('id');
    var b = Blockly.mainWorkspace.getBlockById(id);

    if( $(this).text().indexOf(keyword) >= 0 && b != Blockly.selected ){
      console.log(id);

      b.select();
      return false;
    }

  });

};

Mousetrap.bind('esc', function() { 
  if(Blockly.selected){
    Blockly.selected.unselect();
    window.searching_keyword = null;
  }

});
Mousetrap.bind('ctrl+alt+r', function() { 
  if(window.searching_keyword){
    findNext(window.searching_keyword);
  };

});

Mousetrap.bind('ctrl+alt+f', function() { 
  var keyword = prompt("search block").toLowerCase();
  window.searching_keyword = keyword;
  findNext(keyword);

  
});


Mousetrap.bind('?', function(){
  $('.shortcut-modal').modal();

});

Mousetrap.bind('ctrl+alt+z', function() { 
  window.undo_manager.undo();
});
Mousetrap.bind('ctrl+alt+j', function() { 
  $('.code-modal .modal-title').text('Javascript');
  var $code = $('.code-modal code');
  $code.text(Utils.js(true));
  $code.attr('class', 'javascript');
  hljs.highlightBlock($('.code-modal code').get(0));
  jQuery('.code-modal').modal({});

});
Mousetrap.bind('ctrl+alt+l', function() { 
  $('.code-modal .modal-title').text('XML');

  var $code = $('.code-modal code');
  $code.text(Utils.xml(true));
  $code.attr('class', 'xml');
  hljs.highlightBlock($('.code-modal code').get(0));
  jQuery('.code-modal').modal({});

});



var app = angular.module('centoAuthoring', [
  'ngSanitize',
  'ui.router',
  'ui.bootstrap',
  'ui.select'
]);


app.service('blocksStore', require('./services/blocks'));
app.service('serviceAuthoring', require('./services/services'));
app.controller('RootCtrl', require('./ctrls/root_ctrl'));

app.provider('caJsonEditor', require('./directives/json-editor').provider)
app.directive('caJsonEditor', require('./directives/json-editor').directive)

app.config(function(uiSelectConfig, $stateProvider, $interpolateProvider) {
  uiSelectConfig.theme = 'select2';

  $interpolateProvider.startSymbol('[[');
  $interpolateProvider.endSymbol(']]');


  $stateProvider
    .state('services_index', {
      url: '/services_index',
      controller: require('./ctrls/services_index_ctrl'),
      templateUrl: '/js/tpl/services_index.html'
    })
    .state('services', {
      url: '/services?new_name',
      controller: require('./ctrls/services_form_ctrl'),
      templateUrl: '/js/tpl/services.html'
    })
    .state('services_edit', {
      url: '/services/:service_id',
      controller: require('./ctrls/services_form_ctrl'),
      templateUrl: '/js/tpl/services.html'
    })
    .state('workflow_index', {
      url: '',
      controller: require('./ctrls/workflow_index_ctrl'),
      templateUrl: '/js/tpl/workflow_index.html'

    })
    .state('workflow_edit', {
      url: '/blockly/:id',
      controller: require('./ctrls/workflow_blockly_ctrl'),
      templateUrl: '/js/tpl/blockly.html'

    })
    .state('workflow_blockly', {
      url: '/blockly?new_name',
      controller: require('./ctrls/workflow_blockly_ctrl'),
      templateUrl: '/js/tpl/blockly.html'

    });
});
app.directive("roconSelect2", ["$interval", function($interval) {
    return {
        restrict: "A",
        link: function(scope, elem, attrs) {
            //On click
            $(elem).select2()
            $(elem).on('change', function(){
              console.log('hh');
              var v = $(elem).select2('val');
              console.log("v", v);


              scope.destPackage = $(elem).select2('val');

            });

        }
    }
}]);


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./blocks/index":4,"./ctrls/root_ctrl":17,"./ctrls/services_form_ctrl":18,"./ctrls/services_index_ctrl":19,"./ctrls/workflow_blockly_ctrl":20,"./ctrls/workflow_index_ctrl":21,"./directives/json-editor":22,"./services/blocks":24,"./services/services":25,"./utils":28}],2:[function(require,module,exports){
(function (global){
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null),
  $ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null),
  R = (typeof window !== "undefined" ? window.R : typeof global !== "undefined" ? global.R : null);

var BlockGenerator = function(){

  this.message_blocks = [];
  this.type_blocks = {};
  this.subscribe_blocks = [];
  this.publish_blocks = [];

};

BlockGenerator.prototype._singleBlock = function(fieldtype){
    if(fieldtype.match(/string/)){
      return $('<block type="text"><field name="TEXT"></field></block>');
    }else if(fieldtype.match(/float|uint|int|time/)){
      return $('<block type="math_number"><field name="NUM">0</field></block>');
    }
};

BlockGenerator.prototype._buildBlockTree = function(lst, meta, parent){
  console.log('build block tree', meta);
  var that = this;

  console.log('_buildBlockTree', lst, meta, parent);

  if(!parent)
    var p = $('<block />').attr('type', 'ros_msg_'+meta.type.replace('/', '-'));
  else
    p = parent;

  
  
  _.each(meta.fieldtypes, function(fieldtype, idx){
    var arrlen = meta.fieldarraylen[idx];
    var fn = meta.fieldnames[idx];
    if(meta.type.match(/.+Action$/) && fn != 'action_goal'){ // if action block
      return;
    }

    if(_.include(['action_feedback'], fn)){
      return;
    }
    var $val = null;
    var $child = null;


    if(arrlen == -1){
      $child = $val = $('<value name="'+fn.toUpperCase()+'" />');
    }else if(arrlen >= 0){
      $child = $('<value name="'+fn.toUpperCase()+'"></value>');
      var $list = $('<block type="lists_create_with"><mutation items="1"></mutation><value name="ADD0"></value></block>');
      $val = $list.find('value[name=ADD0]');
      $child.append($list);

    }



    if(fieldtype.match(/.+\/.+/)){
      var subtype = _.detect(lst, function(e, k){ console.log(k, meta.fieldtypes[idx]); return meta.fieldtypes[idx] == k })
      var $subDom = that._buildBlockTree(lst, subtype);
      $val.append($subDom);
    }else{
      $val.append(that._singleBlock(fieldtype));

    }
    p.append($child);


  });


  console.info("built", meta.type, p.get(0));

  return p;
};
// var $el = buildBlockTree(x.types['nav_msgs/MapMetaData'], x.types['nav_msgs/MapMetaData']['nav_msgs/MapMetaData']);
// console.log($el.get(0));
// $tb.find('category[name=ROS]').append($el.get(0));

// var $el = buildBlockTree(x.types['std_msgs/String'], x.types['std_msgs/String']['std_msgs/String']);
// console.log($el.get(0));
// $tb.find('category[name=ROS]').append($el.get(0));


BlockGenerator.prototype.generate_message_blocks = function(types){
  var that = this;
  _.each(types, function(topType){
    _.each(topType, function(tt){
      if(R.contains(tt.type, that.message_blocks)){
        return;
      }
      that.message_blocks.push(tt.type);

      Blockly.register_message_block(tt.type, tt, tt.text);
      var blockKey = tt.type.replace('/', '-');
      console.log('register msg block', tt.type);

    });
  });

};
BlockGenerator.prototype.generate_subscribe_block = function(){

// _.each(meta.subscribers, function(sub){
  // Blockly.register_publish_block(sub.name, sub.type);
  // var typeBlock = typesBlocks[sub.type];
  // var $tb = $('#toolbox');
  // var $pubBlock = $('<block type="ros_publish_'+sub.name+'"></block>');
  // var $valueBlock = $('<value name="VALUE"></value>');
  // $valueBlock.append(typeBlock);
  // $pubBlock.append($valueBlock);
  // $tb.find('category[name=ROS]').append($pubBlock);
  // console.log("register publish block", sub);


// });
};

BlockGenerator.prototype.message_block_dom = function(k, subTypes){

  if(k.match(/.+Action$/)){
    var t = subTypes[k];
    var x = R.fromPairs(R.zip(t.fieldnames, t.fieldtypes));
    var goal_t = R.fromPairs(R.zip(t.fieldnames, t.fieldtypes))['action_goal'];
    t = subTypes[goal_t];
    goal_t = R.fromPairs(R.zip(t.fieldnames, t.fieldtypes))['goal'];
    t = subTypes[goal_t];
    var $el = this._buildBlockTree(subTypes, t);

  }else{
    try {
      var $el = this._buildBlockTree(subTypes, subTypes[k]);
    }catch(e){
      console.error('failed to get message block dom', k);
    }
  }

  if($el){
    $el.attr('collapsed', true);
    this.type_blocks[k] = $el.get(0);
  }
  return $el;

};



BlockGenerator.prototype.scheduled_action_block_dom = function(rapp_name, uri, name, type){
  var typeBlock = this.type_blocks[type];
  var $valueBlock = $('<value name="GOAL"></value>');
  $valueBlock.append($(typeBlock).clone());

  Blockly.register_scheduled_action_block(rapp_name, uri, name, type);
  var $block = $('<block type="ros_scheduled_action_'+name+'"></block>');
  $block.append($valueBlock);
  return $block;


};

BlockGenerator.prototype.scheduled_subscribe_block_dom = function(rapp_name, uri, name, type){
  var typeBlock = this.type_blocks[type];
  Blockly.register_scheduled_subscribe_block(rapp_name, uri, name, type);
  var $block = $('<block type="ros_scheduled_subscribe_'+name+'"></block>');
  return $block;


};
BlockGenerator.prototype.scheduled_publish_block_dom = function(rapp_name, uri, name, type){
  var typeBlock = this.type_blocks[type];
  var $valueBlock = $('<value name="VALUE"></value>');
  $valueBlock.append($(typeBlock).clone());

  Blockly.register_scheduled_publish_block(rapp_name, uri, name, type);
  var $block = $('<block type="ros_scheduled_publish_'+name+'"></block>');
  $block.append($valueBlock);
  return $block;


};
BlockGenerator.prototype.generate_client_app_blocks = function(data){
  var interface = data.interface;
  var client_app_id = data.client_app_id;
  var client_app_name = data.client_app_name;
  console.log("=========", interface, client_app_id);
  var that = this;

  var pubs = R.map(
    R.compose(
      R.bind(that.publish_block_dom, that),
      R.assoc('client_app_name', client_app_name)
    )
  )(interface.subscribers);
  var subs = R.map(
    R.compose(
      R.bind(that.subscribe_block_dom, that),
      R.assoc('client_app_name', client_app_name)
    )
  )(interface.publishers);
  // var subs = R.map(R.bind(that.subscribe_block_dom, that))(interface.publishers);
  // console.log(pubs.concat(subs));

  return pubs.concat(subs);
  // console.log(els);

  // return R.flatten(els);

};

BlockGenerator.prototype.publish_block_dom = function(opts){
  console.log('PUB OPT', opts);

  var name = opts.name;
  if(R.contains(name, this.publish_blocks)){
    return false;
  }
  var type = opts.type;

  var typeBlock = this.type_blocks[type];
  var $valueBlock = $('<value name="VALUE"></value>');
  $valueBlock.append($(typeBlock).clone());




  this.publish_blocks.push(name);
  Blockly.register_publish_block(name, opts.type, {client_app_name: opts.client_app_name});
  var $block = $('<block type="ros_publish_'+name+'"></block>');
  $block.append($valueBlock);
  return $block;


};
BlockGenerator.prototype.subscribe_block_dom = function(opts){
  console.log("X", opts);

  var name = opts.name;
  if(R.contains(name, this.subscribe_blocks)){
    return false;
  }
  this.subscribe_blocks.push(name);
  Blockly.register_subscribe_block(name, opts.type, {client_app_name: opts.client_app_name});
  var $block = $('<block type="ros_subscribe_'+name+'"></block>');
  return $block;


};


module.exports = BlockGenerator;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],3:[function(require,module,exports){
(function (global){
var R = (typeof window !== "undefined" ? window.R : typeof global !== "undefined" ? global.R : null),
  angular = (typeof window !== "undefined" ? window.angular : typeof global !== "undefined" ? global.angular : null);

var ros_block_override = function(){
  var ros_block_keys = R.pipe(
    R.keys,
    R.filter(R.match(/^ros_/))
  )(Blockly.Blocks);


  R.map(function(key){
    var b = Blockly.Blocks[key];
    console.log(key, b.configable);

    if(b.configable){
      b.customContextMenu = function(opts){
        opts.push({text: 'Config', enabled: true, callback: function(){ 
          var $scope = angular.element('#blockly-page').scope();
          $scope.modalBlockConfig();
        }});
        return opts;

      };
    }


    b.mutationToDom = function() {
      var re = null;
      var container = re = document.createElement('mutation');
      ['extra_config', 'extra'].forEach(function(attr){
        if(this[attr]){
          container.setAttribute(attr, angular.toJson(this[attr]));
        }
      }.bind(this));


      if(typeof b._mutationToDom != 'undefined'){
        re = b._mutationToDom(re);
      }
      return re;

    };
    b.domToMutation = function(xmlElement) {
      ['extra_config', 'extra'].forEach(function(attr){

        var attrv = xmlElement.getAttribute(attr);
        console.log("ATTR", attrv);

        try{
          this[attr] = JSON.parse(attrv);
        }catch(e){
        }
      }.bind(this));
      if(typeof b._domToMutation != 'undefined'){
        re = b._domToMutation();
      }
    };

  })(ros_block_keys);



  console.log(ros_block_keys);
}


module.exports = ros_block_override;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],4:[function(require,module,exports){
(function (global){
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);
var DESTINATION_COLOR, declare_event;

var ACTION_COLOR = require('../config').action_color;

DESTINATION_COLOR = 3;

['huey', 'dwlee', 'docking'].forEach(function(dest) {
  Blockly.Blocks["dest_" + dest] = {
    init: function() {
      this.setColour(DESTINATION_COLOR);
      this.appendDummyInput('XX').appendField(dest);
      this.setOutput(true, 'String');
      this.setPreviousStatement(false);
      return this.setNextStatement(false);
    },
    mutationToDom: function() {
      var container = document.createElement('mutation');
      container.setAttribute('config', this.extraConfig);
      return container;
    },
    domToMutation: function(xmlElement) {
      console.log("DOM2MUT", xmlElement);

      var cfg = xmlElement.getAttribute('config');
      this.extraConfig = cfg;
    }
  };
  return Blockly.JavaScript["dest_" + dest] = function(block) {
    return ["'" + dest + "'", Blockly.JavaScript.ORDER_NONE];
  };
});

['phone_start', 'robot_button', 'phone_deliver'].forEach(function(dest) {
  Blockly.Blocks["entity_" + dest] = {
    init: function() {
      this.setColour(DESTINATION_COLOR);
      this.appendDummyInput('XX').appendField(dest);
      this.setOutput(true, 'String');
      this.setPreviousStatement(false);
      return this.setNextStatement(false);
    }
  };
  return Blockly.JavaScript["entity_" + dest] = function(block) {
    return ["'" + dest + "'", Blockly.JavaScript.ORDER_NONE];
  };
});

['message', 'msg', 'dest'].forEach(function(x) {
  Blockly.Blocks["memory_" + x] = {
    init: function() {
      this.setColour(DESTINATION_COLOR);
      this.appendDummyInput('XX').appendField("Memory : " + x);
      this.setOutput(true, 'String');
      this.setPreviousStatement(false);
      return this.setNextStatement(false);
    }
  };
  return Blockly.JavaScript["memory_" + x] = function(block) {
    return ["$engine.memory." + x, Blockly.JavaScript.ORDER_NONE];
  };
});

Blockly.Blocks["cond_no_brain"] = {
  init: function() {
    this.setColour(150);
    this.appendDummyInput('XX').appendField('No destination or No message');
    this.setOutput(true, 'Boolean');
    this.setPreviousStatement(false);
    return this.setNextStatement(false);
  }
};

Blockly.JavaScript['cond_no_brain'] = function(block) {
  return ["(!$engine.memory.dest || !$engine.memory.msg)", Blockly.JavaScript.ORDER_NONE];
};

Blockly.Blocks["action_set"] = {
  init: function() {
    this.setColour(ACTION_COLOR);
    this.appendValueInput('DEST').appendField('Set Destination to ');
    this.appendValueInput('MSG').appendField('with message');
    this.setPreviousStatement(true);
    return this.setNextStatement(true);
  }
};

Blockly.JavaScript['action_set'] = function(block) {
  var dest, msg;
  dest = Blockly.JavaScript.valueToCode(block, 'DEST', Blockly.JavaScript.ORDER_NONE) || "''";
  msg = Blockly.JavaScript.valueToCode(block, 'MSG', Blockly.JavaScript.ORDER_NONE) || "''";
  return "$engine.memory = {dest: " + dest + ", msg: " + msg + "};";
};

declare_event = function(key, name) {
  Blockly.Blocks["event_" + key] = {
    init: function() {
      this.setColour(200);
      this.appendValueInput('PARAM').appendField(name);
      this.setOutput(true, 'TEXT');
      this.setPreviousStatement(false);
      return this.setNextStatement(false);
    }
  };
  return Blockly.JavaScript["event_" + key] = function(block) {
    var data, param;
    data = {
      event_name: key
    };
    param = Blockly.JavaScript.valueToCode(block, 'PARAM', Blockly.JavaScript.ORDER_NONE) || "''";
    if (param != null) {
      data.param = eval(param);
    }
    return [JSON.stringify(data), Blockly.JavaScript.ORDER_ATOMIC];
  };
};

declare_event("arrive", "Arrive");

declare_event("delivery_request", "Delivery Request");

declare_event("confirm", "Confirm");

declare_event("foo", "Foo");




Blockly.Blocks['test_event_handle'] = {
  init: function() {
    this.setColour(10);
    this.appendValueInput('VALUE').appendField('on');
    this.appendStatementInput('DO').appendField(Blockly.Msg.CONTROLS_REPEAT_INPUT_DO);
    this.setPreviousStatement(false);
    return this.setNextStatement(false);
  }
};

Blockly.Blocks['turtle_cmd_vel'] = {
  init: function() {
    this.setColour(10);

    // this.interpolateMsg(
        // // TODO: Combine these messages instead of using concatenation.
        // "x = %1, y = %2, z = %3",
        // ['X1', 'Number', Blockly.ALIGN_RIGHT],
        // ['Y1', 'Number', Blockly.ALIGN_RIGHT],
        // ['Z1', 'Number', Blockly.ALIGN_RIGHT],
        // Blockly.ALIGN_RIGHT);
    // var numberInput = new Blockly.FieldTextInput('0');
    // this.appendValueInput(numberInput, 'xxx');
    this.appendValueInput('l_x').appendField('cmd_vel linear with x').setAlign(Blockly.ALIGN_RIGHT);
    this.appendValueInput('l_y').appendField('y').setAlign(Blockly.ALIGN_RIGHT);
    this.appendValueInput('l_z').appendField('z').setAlign(Blockly.ALIGN_RIGHT);
    this.appendValueInput('a_x').appendField('angular with x').setAlign(Blockly.ALIGN_RIGHT);
    this.appendValueInput('a_y').appendField('y').setAlign(Blockly.ALIGN_RIGHT);
    this.appendValueInput('a_z').appendField('z').setAlign(Blockly.ALIGN_RIGHT);
    this.setPreviousStatement(true);
    return this.setNextStatement(true);
  }
};
Blockly.JavaScript['turtle_cmd_vel'] = function(block) {
  var code, e, event;
  x0 = eval(Blockly.JavaScript.valueToCode(block, 'l_x', Blockly.JavaScript.ORDER_NONE));
  y0 = eval(Blockly.JavaScript.valueToCode(block, 'l_y', Blockly.JavaScript.ORDER_NONE));
  z0 = eval(Blockly.JavaScript.valueToCode(block, 'l_z', Blockly.JavaScript.ORDER_NONE));
  x1 = eval(Blockly.JavaScript.valueToCode(block, 'a_x', Blockly.JavaScript.ORDER_NONE));
  y1 = eval(Blockly.JavaScript.valueToCode(block, 'a_y', Blockly.JavaScript.ORDER_NONE));
  z1 = eval(Blockly.JavaScript.valueToCode(block, 'a_z', Blockly.JavaScript.ORDER_NONE));

  x = {
    linear: {
              x: x0,
              y: y0,
              z: z0
            },
    angular: {
              x: x1,
              y: y1,
              z: z1
            }


  }


  return "$engine.cmdVel("+JSON.stringify(x)+");";
  // e = JSON.parse(event);
  // console.log("event", e);
  // code = Blockly.JavaScript.statementToCode(block, 'DO');
  // var en = e.event_name;
  // var body = code;
  // if(e.param){
    // body = "if(data.param === '"+e.param+"'){ "+code+" }";
  // }
  // return "$engine.ee.on('" + en + "', function(data){ " + body + " })";
};


Blockly.JavaScript['test_event_handle'] = function(block) {
  var code, e, event;
  event = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_NONE) || "''";
  e = JSON.parse(event);
  console.log("event", e);
  code = Blockly.JavaScript.statementToCode(block, 'DO');
  var en = e.event_name;
  var body = code;
  if(e.param){
    body = "if(data.param === '"+e.param+"'){ "+code+" }";
  }
  return "$engine.ee.on('" + en + "', function(data){ " + body + " })";
};

Blockly.Blocks['action_speak'] = {
  init: function() {
    this.setColour(ACTION_COLOR);
    this.appendValueInput('VALUE').appendField('Speak');
    this.setPreviousStatement(true);
    return this.setNextStatement(true);
  }
};

['action_speak'].forEach(function(action_key) {
  return Blockly.JavaScript[action_key] = function(block) {
    var arg0;
    arg0 = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_NONE) || "''";

    return '$engine.print("Rocon Authoring :" + JSON.stringify(' + arg0 + '));';
  };
});

Blockly.Blocks['action_go_to'] = {
  init: function() {
    this.setColour(ACTION_COLOR);
    this.appendValueInput('VALUE').appendField('Go to');
    this.setPreviousStatement(true);
    return this.setNextStatement(true);
  }
};

['action_go_to'].forEach(function(action_key) {
  return Blockly.JavaScript[action_key] = function(block) {
    var arg0 = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_NONE) || "''";
    return '$engine.publish("go_to");';
  };
});

Blockly.Blocks['action_navigate'] = {
  init: function() {
    this.setColour(ACTION_COLOR);
    this.appendValueInput('DEST').appendField('Navigate To');
    this.setPreviousStatement(true);
    return this.setNextStatement(true);
  }
};

['action_navigate'].forEach(function(action_key) {
  return Blockly.JavaScript[action_key] = function(block) {
    var arg0;
    arg0 = Blockly.JavaScript.valueToCode(block, 'DEST', Blockly.JavaScript.ORDER_NONE) || "''";
    return '$engine.print("NAVIGATE TO:"+ ' + arg0 + ');';
  };
});

Blockly.Blocks['delay'] = {
  init: function() {
    this.setColour(10);
    this.appendValueInput('DELAY').setCheck('Number').appendField('Delay');
    this.appendStatementInput('DO').appendField(Blockly.Msg.CONTROLS_REPEAT_INPUT_DO);
    this.setPreviousStatement(true);
    return this.setNextStatement(true);
  }
};

Blockly.JavaScript['delay'] = function(block) {
  var code, delay;
  delay = Blockly.JavaScript.valueToCode(block, 'DELAY', Blockly.JavaScript.ORDER_NONE) || "''";
  code = Blockly.JavaScript.statementToCode(block, 'DO');
  return "setTimeout(function(){" + code + "}, " + delay + "*1000);";
};

















/*
 * Sleep
 */
Blockly.Blocks['action_sleep'] = {
  init: function() {
    this.setColour(ACTION_COLOR);
    this.appendValueInput('VALUE').appendField('sleep');
    this.setPreviousStatement(true);
    return this.setNextStatement(true);
  }
};

Blockly.JavaScript['action_sleep'] = function(block) {
  var arg0 = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_NONE) || "''";
  return _.template('$engine.sleep(<%= ms %>);')({ms: arg0});
};

require('./lodash');
require('./object');
require('./ros_action');
require('./ros_msg');
require('./ros_pubsub');
require('./ros_requester');
require('./ros_service');
require('./utils.js');
require('./prezi.js');
require('./ui');

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../config":15,"./lodash":5,"./object":6,"./prezi.js":7,"./ros_action":8,"./ros_msg":9,"./ros_pubsub":10,"./ros_requester":11,"./ros_service":12,"./ui":13,"./utils.js":14}],5:[function(require,module,exports){
(function (global){
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);
var Blockly = (typeof window !== "undefined" ? window.Blockly : typeof global !== "undefined" ? global.Blockly : null);

Blockly.Blocks['lodash_find'] = {
  /**
   * Mutator bolck for adding items.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(260);
    this.appendDummyInput()
      .appendField('find first item in array')
      .appendField(new Blockly.FieldVariable('item', null), 'VAR')
    this.appendDummyInput().appendField('where').appendField(new Blockly.FieldTextInput('key', null), 'KEY');
    this.appendValueInput('VAL').appendField('is');
    this.setInputsInline(true);
    this.setOutput(true);
    this.contextMenu = false;
  }
};


Blockly.JavaScript['lodash_find'] = function(block){
  // var key = Blockly.JavaScript.valueToCode(block, 'KEY', Blockly.JavaScript.ORDER_NONE) || "''";
  var arr = block.getFieldValue('VAR');
  var key = block.getFieldValue('KEY');
  var val = Blockly.JavaScript.valueToCode(block, 'VAL', Blockly.JavaScript.ORDER_NONE) || "''";

  
  // var value = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_NONE) || "''";
  // var code = key + ":" + value;
  //
  var code = _.template("_.find(<%= arr%>, function(i){ return i['<%= key%>'] === <%= val %>; })", {arr: arr, key: key, val: val})

  return [code, Blockly.JavaScript.ORDER_ATOMIC];

};


// Blockly.JavaScript['object_item'] = function(block){

  // // var key = Blockly.JavaScript.valueToCode(block, 'KEY', Blockly.JavaScript.ORDER_NONE) || "''";
  // var key = block.getFieldValue('KEY');
  // var value = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_NONE) || "''";
  // var code = key + ":" + value;

  // return [code, Blockly.JavaScript.ORDER_ATOMIC];

// }

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],6:[function(require,module,exports){
(function (global){
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);
var Blockly = (typeof window !== "undefined" ? window.Blockly : typeof global !== "undefined" ? global.Blockly : null);

/*
 * object
 */

Blockly.Blocks['object_item'] = {
  /**
   * Mutator bolck for adding items.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(260);
    this.appendDummyInput()
        .appendField(new Blockly.FieldTextInput('key', null), 'KEY')
        .appendField(":")
    this.appendValueInput('VALUE')
    this.setInputsInline(true);
    this.setOutput(true);
    this.contextMenu = false;
  }
};
Blockly.Blocks['object_item_get2'] = {
  /**
   * Mutator bolck for adding items.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(260);
    this.appendDummyInput()
        .appendField(new Blockly.FieldVariable('item', null), 'VAR')
    this.appendValueInput('KEY').appendField('.');
    this.setInputsInline(true);
    this.setOutput(true);
    this.contextMenu = false;
  }
};
Blockly.Blocks['object_item_get'] = {
  /**
   * Mutator bolck for adding items.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(260);
    this.appendDummyInput()
        .appendField(new Blockly.FieldVariable('item', null), 'VAR')
        .appendField(".");
    this.appendDummyInput()
      .appendField(new Blockly.FieldTextInput('key', null), 'KEY');
    this.setInputsInline(true);
    this.setOutput(true);
    this.contextMenu = false;
  }
};
Blockly.Blocks['object_item_set'] = {
  /**
   * Mutator bolck for adding items.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(260);
    this.appendDummyInput()
        .appendField(new Blockly.FieldVariable('item', null), 'VAR')
        .appendField(".");
    this.appendDummyInput()
      .appendField(new Blockly.FieldTextInput('key', null), 'KEY');
    this.appendValueInput('VALUE')
      .appendField("=")
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.contextMenu = false;
  }
};

Blockly.Blocks['object_create_with_item'] = {
  /**
   * Mutator bolck for adding items.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(260);
    this.appendDummyInput()
        .appendField("item");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.contextMenu = false;
  }
};

Blockly.JavaScript['object_item'] = function(block){

  // var key = Blockly.JavaScript.valueToCode(block, 'KEY', Blockly.JavaScript.ORDER_NONE) || "''";
  var key = block.getFieldValue('KEY');
  var value = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_NONE) || "''";
  var code = key + ":" + value;

  return [code, Blockly.JavaScript.ORDER_ATOMIC];

}
Blockly.JavaScript['object_item_get2'] = function(block){

  // var key = Blockly.JavaScript.valueToCode(block, 'KEY', Blockly.JavaScript.ORDER_NONE) || "''";
  var va = block.getFieldValue('VAR');
  var key = Blockly.JavaScript.valueToCode(block, 'KEY', Blockly.JavaScript.ORDER_NONE) || "''";
  var tpl = "<%= va %>[<%= key %>]";
  var code = _.template(tpl)({va: va, key: key});

  return [code, Blockly.JavaScript.ORDER_ATOMIC];

}
Blockly.JavaScript['object_item_get'] = function(block){

  // var key = Blockly.JavaScript.valueToCode(block, 'KEY', Blockly.JavaScript.ORDER_NONE) || "''";
  var va = block.getFieldValue('VAR');
  var key = block.getFieldValue('KEY');
  var tpl = "<%= va %>['<%= key %>']";
  var code = _.template(tpl)({va: va, key: key});

  return [code, Blockly.JavaScript.ORDER_ATOMIC];

}
Blockly.JavaScript['object_item_set'] = function(block){

  // var key = Blockly.JavaScript.valueToCode(block, 'KEY', Blockly.JavaScript.ORDER_NONE) || "''";
  var va = block.getFieldValue('VAR');
  var key = block.getFieldValue('KEY');
  var tpl = "<%= va %>['<%= key %>'] = <%= value %>;";
  var value = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_NONE) || "null";
  var code = _.template(tpl)({va: va, key: key, value: value});

  // return [code, Blockly.JavaScript.ORDER_ATOMIC];
  return code;

}
Blockly.JavaScript['object_create_with'] = function(block){

  // Create a list with any number of elements of any type.
  var code = new Array(block.itemCount_);
  for (var n = 0; n < block.itemCount_; n++) {
    code[n] = Blockly.JavaScript.valueToCode(block, 'ADD' + n,
        Blockly.JavaScript.ORDER_COMMA) || 'null';
  }
  code = '({' + code.join(', ') + '})';
  return [code, Blockly.JavaScript.ORDER_ATOMIC];

}

Blockly.Blocks['object_create_with'] = {
  /**
   * Block for creating a list with any number of elements of any type.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(260);
    this.appendValueInput('ADD0')
        .appendField("create object with");
    this.appendValueInput('ADD1');
    this.appendValueInput('ADD2');
    this.setOutput(true, 'Array');
    this.setMutator(new Blockly.Mutator(['object_create_with_item']));
    this.itemCount_ = 3;
  },
  /**
   * Create XML to represent list inputs.
   * @return {Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function() {
    var container = document.createElement('mutation');
    container.setAttribute('items', this.itemCount_);
    return container;
  },
  /**
   * Parse XML to restore the list inputs.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    for (var x = 0; x < this.itemCount_; x++) {
      this.removeInput('ADD' + x);
    }
    this.itemCount_ = parseInt(xmlElement.getAttribute('items'), 10);
    for (var x = 0; x < this.itemCount_; x++) {
      var input = this.appendValueInput('ADD' + x);
      if (x == 0) {
        input.appendField("create object with");
      }
    }
    if (this.itemCount_ == 0) {
      this.appendDummyInput('EMPTY')
          .appendField("create emtpy object");
    }
  },
  /**
   * Populate the mutator's dialog with this block's components.
   * @param {!Blockly.Workspace} workspace Mutator's workspace.
   * @return {!Blockly.Block} Root block in mutator.
   * @this Blockly.Block
   */
  decompose: function(workspace) {
    var containerBlock =
        Blockly.Block.obtain(workspace, 'object_create_with_container');
    containerBlock.initSvg();
    var connection = containerBlock.getInput('STACK').connection;
    for (var x = 0; x < this.itemCount_; x++) {
      var itemBlock = Blockly.Block.obtain(workspace, 'object_create_with_item');
      itemBlock.initSvg();
      connection.connect(itemBlock.previousConnection);
      connection = itemBlock.nextConnection;
    }
    return containerBlock;
  },
  /**
   * Reconfigure this block based on the mutator dialog's components.
   * @param {!Blockly.Block} containerBlock Root block in mutator.
   * @this Blockly.Block
   */
  compose: function(containerBlock) {
    // Disconnect all input blocks and remove all inputs.
    if (this.itemCount_ == 0) {
      this.removeInput('EMPTY');
    } else {
      for (var x = this.itemCount_ - 1; x >= 0; x--) {
        this.removeInput('ADD' + x);
      }
    }
    this.itemCount_ = 0;
    // Rebuild the block's inputs.
    var itemBlock = containerBlock.getInputTargetBlock('STACK');
    while (itemBlock) {
      var input = this.appendValueInput('ADD' + this.itemCount_);
      if (this.itemCount_ == 0) {
        input.appendField("create object with");
      }
      // Reconnect any child blocks.
      if (itemBlock.valueConnection_) {
        input.connection.connect(itemBlock.valueConnection_);
      }
      this.itemCount_++;
      itemBlock = itemBlock.nextConnection &&
          itemBlock.nextConnection.targetBlock();
    }
    if (this.itemCount_ == 0) {
      this.appendDummyInput('EMPTY')
          .appendField("create empty object");
    }
  },
  /**
   * Store pointers to any connected child blocks.
   * @param {!Blockly.Block} containerBlock Root block in mutator.
   * @this Blockly.Block
   */
  saveConnections: function(containerBlock) {
    var itemBlock = containerBlock.getInputTargetBlock('STACK');
    var x = 0;
    while (itemBlock) {
      var input = this.getInput('ADD' + x);
      itemBlock.valueConnection_ = input && input.connection.targetConnection;
      x++;
      itemBlock = itemBlock.nextConnection &&
          itemBlock.nextConnection.targetBlock();
    }
  }
};

Blockly.Blocks['object_create_with_container'] = {
  /**
   * Mutator block for list container.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(260);
    this.appendDummyInput()
        .appendField("Object");
    this.appendStatementInput('STACK');
    this.contextMenu = false;
  }
};


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],7:[function(require,module,exports){
(function (global){

var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);
var Blockly = (typeof window !== "undefined" ? window.Blockly : typeof global !== "undefined" ? global.Blockly : null);

Blockly.Blocks['prezi_prev'] = {
  /**
   * Mutator bolck for adding items.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(260);
    this.appendDummyInput()
      .appendField('prezi - prev')
    this.setInputsInline(true);
    this.setOutput(false);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
  }
};
Blockly.Blocks['prezi_next'] = {
  /**
   * Mutator bolck for adding items.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(260);
    this.appendDummyInput()
      .appendField('prezi - next')
    this.setInputsInline(true);
    this.setOutput(false);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
  }
};


Blockly.JavaScript['prezi_next'] = function(block){
  // var key = Blockly.JavaScript.valueToCode(block, 'KEY', Blockly.JavaScript.ORDER_NONE) || "''";
  var data = {action: 'prezi-next'};
  var code = _.template("$engine.socketBroadcast('/prezi', 'message', <%= data %>);")({data: JSON.stringify(data)});
  return code;

};
Blockly.JavaScript['prezi_prev'] = function(block){
  // var key = Blockly.JavaScript.valueToCode(block, 'KEY', Blockly.JavaScript.ORDER_NONE) || "''";
  var data = {action: 'prezi-prev'};
  var code = _.template("$engine.socketBroadcast('/prezi', 'message', <%= data %>);")({data: JSON.stringify(data)});
  return code;

};


Blockly.Blocks['prezi_prev_with_channel'] = {
  /**
   * Mutator bolck for adding items.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(260);
    this.appendDummyInput()
      .appendField('prezi - prev')
    this.appendDummyInput().appendField(new Blockly.FieldTextInput('channel', null), 'CHANNEL')
    this.setInputsInline(true);
    this.setOutput(false);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
  }
};
Blockly.Blocks['prezi_next_with_channel'] = {
  /**
   * Mutator bolck for adding items.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(260);
    this.appendDummyInput()
      .appendField('prezi - next')
    this.appendDummyInput().appendField(new Blockly.FieldTextInput('channel', null), 'CHANNEL')
    this.setInputsInline(true);
    this.setOutput(false);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
  }
};
Blockly.Blocks['prezi_move_with_channel'] = {
  /**
   * Mutator bolck for adding items.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(260);
    this.appendDummyInput()
      .appendField('prezi - move')
    this.appendDummyInput().appendField(new Blockly.FieldTextInput('channel', null), 'CHANNEL')
    this.appendDummyInput().appendField('step : ').appendField(new Blockly.FieldTextInput('0', null), 'STEP')
    this.setInputsInline(true);
    this.setOutput(false);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
  }
};


Blockly.JavaScript['prezi_next_with_channel'] = function(block){
  // var key = Blockly.JavaScript.valueToCode(block, 'KEY', Blockly.JavaScript.ORDER_NONE) || "''";
  var chan = this.getFieldValue('CHANNEL');
  var code = _.template("$engine.socketBroadcast('/prezi', 'prezi:<%= channel %>:next');")({channel: chan});
  return code;

};
Blockly.JavaScript['prezi_prev_with_channel'] = function(block){
  // var key = Blockly.JavaScript.valueToCode(block, 'KEY', Blockly.JavaScript.ORDER_NONE) || "''";
  var chan = this.getFieldValue('CHANNEL');
  var code = _.template("$engine.socketBroadcast('/prezi', 'prezi:<%= channel %>:prev');")({channel: chan});
  return code;

};
Blockly.JavaScript['prezi_move_with_channel'] = function(block){
  // var key = Blockly.JavaScript.valueToCode(block, 'KEY', Blockly.JavaScript.ORDER_NONE) || "''";
  var chan = this.getFieldValue('CHANNEL');
  var step = this.getFieldValue('STEP');
  var code = _.template("$engine.socketBroadcast('/prezi', 'prezi:<%= channel %>:move', {step: <%= step%>});")({channel: chan, step: step});
  return code;

};





}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],8:[function(require,module,exports){
(function (global){
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);
var Blockly = (typeof window !== "undefined" ? window.Blockly : typeof global !== "undefined" ? global.Blockly : null);

Blockly.register_scheduled_action_block = function(rapp, uri, name, type){
  Blockly.JavaScript['ros_scheduled_action_' + name] = function(block){
    var extraConfig = block.extra_config;

    // var name = block.getFieldValue('NAME');
    // var type = block.getFieldValue('TYPE');

    var codeOnResult = Blockly.JavaScript.statementToCode(block, 'ON_RESULT');
    var paramNameOnResult = block.getFieldValue('ON_RESULT_PARAM');
    var codeOnFeedback = Blockly.JavaScript.statementToCode(block, 'ON_FEEDBACK');
    var paramNameOnFeedback = block.getFieldValue('ON_FEEDBACK_PARAM');

    var goal = Blockly.JavaScript.valueToCode(block, 'GOAL', Blockly.JavaScript.ORDER_NONE) || "''";
    var ctx = Blockly.JavaScript.valueToCode(block, 'CTX', Blockly.JavaScript.ORDER_NONE) || "''";



    // var remappings = R.pipe(
        // R.map(function(v, k){ return {remap_from: k, remap_to: v}; }),
        // R.values
    // )(extraConfig.remappings);


    var tpl = '$engine.runScheduledAction(<%= ctx %>, "<%= name %>", "<%= type %>", <%= goal %>, ';
    tpl += 'function(<%= param1 %>){ <%=code1%>}, function(<%= param2 %>){ <%=code2%>});';

    var code = _.template(tpl)({
      rapp: rapp,
      uri: uri,
      name: name,
      type: type,
      goal: goal, 
      ctx: ctx, 
      param1: paramNameOnResult,
      param2: paramNameOnFeedback,
      code1: codeOnResult, code2: codeOnFeedback
    });
    return code;


  }

  Blockly.Blocks['ros_scheduled_action_'+name] = {

    init: function() {
      this.setColour(260);
      this.appendDummyInput().appendField('[Action] ' + name);
      this.appendValueInput('CTX').appendField('context :');
      this.appendValueInput('GOAL').appendField('goal :');

      this.setInputsInline(true);

      this.appendStatementInput('ON_RESULT')
        .appendField("Result")
        .appendField(new Blockly.FieldVariable('item'), 'ON_RESULT_PARAM');

      this.appendStatementInput('ON_FEEDBACK')
        .appendField("Feedback")
        .appendField(new Blockly.FieldVariable('item'), 'ON_FEEDBACK_PARAM');
      this.setPreviousStatement(true);
      return this.setNextStatement(true);
    },
    getVars: function(){
      return [this.getFieldValue('ON_RESULT_PARAM'), this.getFieldValue('ON_FEEDBACK_PARAM')];

    },

    // mutationToDom: function() {
      // if(this.extraConfig){
        // var container = document.createElement('mutation');
        // container.setAttribute('config', JSON.stringify(this.extraConfig));
        // return container;
      // }
    // },
    // domToMutation: function(xmlElement) {
      // var cfg = xmlElement.getAttribute('config');
      // console.log("D2M", cfg);

      // try{
        // this.extraConfig = JSON.parse(cfg);
      // }catch(e){
      // }
    // }

  };

};
Blockly.register_action_block = function(name, type){
  Blockly.JavaScript['ros_action_' + name] = function(block){
    // var name = block.getFieldValue('NAME');
    // var type = block.getFieldValue('TYPE');

    var codeOnResult = Blockly.JavaScript.statementToCode(block, 'ON_RESULT');
    var paramNameOnResult = block.getFieldValue('ON_RESULT_PARAM');
    var codeOnFeedback = Blockly.JavaScript.statementToCode(block, 'ON_FEEDBACK');
    var paramNameOnFeedback = block.getFieldValue('ON_FEEDBACK_PARAM');

    var goal = Blockly.JavaScript.valueToCode(block, 'GOAL', Blockly.JavaScript.ORDER_NONE) || "''";

    var tpl = '$engine.runAction("<%= name %>", "<%= type %>", <%= goal %>, ';
    tpl += 'function(<%= param1 %>){ <%=code1%>}, function(<%= param2 %>){ <%=code2%>});';

    var code = _.template(tpl)({name: name, type: type, goal: goal, 
      param1: paramNameOnResult, param2: paramNameOnFeedback,
      code1: codeOnResult, code2: codeOnFeedback
    });
    return code;


  }

  Blockly.Blocks['ros_action_'+name] = {
    /**
     * Block for creating a list with any number of elements of any type.
     * @this Blockly.Block
     */
    init: function() {
      this.setColour(260);
      this.appendValueInput('GOAL').appendField('[Action] ' + name);

      this.setInputsInline(true);

      this.appendStatementInput('ON_RESULT')
        .appendField("Result")
        .appendField(new Blockly.FieldVariable('item'), 'ON_RESULT_PARAM');

      this.appendStatementInput('ON_FEEDBACK')
        .appendField("Feedback")
        .appendField(new Blockly.FieldVariable('item'), 'ON_FEEDBACK_PARAM');
      this.setPreviousStatement(true);
      return this.setNextStatement(true);
    },

    getVars: function(){
      return [this.getFieldValue('ON_RESULT_PARAM'), this.getFieldValue('ON_FEEDBACK_PARAM')];

    }

  };

};
// Blockly.JavaScript['ros_action_item'] = function(block){

  // // var key = Blockly.JavaScript.valueToCode(block, 'KEY', Blockly.JavaScript.ORDER_NONE) || "''";
  // var key = block.getFieldValue('KEY');
  // var value = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_NONE) || "''";
  // var code = key + ":" + value;

  // return [code, Blockly.JavaScript.ORDER_ATOMIC];

// }
// Blockly.JavaScript['object_create_with'] = function(block){

  // // Create a list with any number of elements of any type.
  // var code = new Array(block.itemCount_);
  // for (var n = 0; n < block.itemCount_; n++) {
    // code[n] = Blockly.JavaScript.valueToCode(block, 'ADD' + n,
        // Blockly.JavaScript.ORDER_COMMA) || 'null';
  // }
  // code = '({' + code.join(', ') + '})';
  // return [code, Blockly.JavaScript.ORDER_ATOMIC];

// }

Blockly.JavaScript['ros_action'] = function(block){
  // var name = block.getFieldValue('NAME');
  // var type = block.getFieldValue('TYPE');
  var name = Blockly.JavaScript.valueToCode(block, 'NAME', Blockly.JavaScript.ORDER_NONE) || "''";
  var type = Blockly.JavaScript.valueToCode(block, 'TYPE', Blockly.JavaScript.ORDER_NONE) || "''";
  var codeOnResult = Blockly.JavaScript.statementToCode(block, 'ON_RESULT');
  var paramNameOnResult = block.getFieldValue('ON_RESULT_PARAM');
  var codeOnFeedback = Blockly.JavaScript.statementToCode(block, 'ON_FEEDBACK');
  var paramNameOnFeedback = block.getFieldValue('ON_FEEDBACK_PARAM');

  var goal = Blockly.JavaScript.valueToCode(block, 'GOAL', Blockly.JavaScript.ORDER_NONE) || "''";

  var tpl = '$engine.runAction(<%= name %>, <%= type %>, <%= goal %>, ';
  tpl += 'function(<%= param1 %>){ <%=code1%>}, function(<%= param2 %>){ <%=code2%>});';

  var code = _.template(tpl)({name: name, type: type, goal: goal, 
    param1: paramNameOnResult, param2: paramNameOnFeedback,
    code1: codeOnResult, code2: codeOnFeedback
  });
  return code;


  // return [name, type, codeOnResult, paramNameOnResult, codeOnFeedback, paramNameOnFeedback].join("\n\n");
  //

  // // The ActionClient
  // // ----------------

  // var fibonacciClient = new ROSLIB.ActionClient({
    // ros : ros,
    // serverName : '/fibonacci',
    // actionName : 'actionlib_tutorials/FibonacciAction'
  // });

  // // Create a goal.
  // var goal = new ROSLIB.Goal({
    // actionClient : fibonacciClient,
    // goalMessage : {
      // order : 7
    // }
  // });

  // // Print out their output into the terminal.
  // goal.on('feedback', function(feedback) {
    // console.log('Feedback: ' + feedback.sequence);
  // });
  // goal.on('result', function(result) {
    // console.log('Final Result: ' + result.sequence);
  // });

  // // Send the goal to the action server.
  // goal.send();

}

Blockly.Blocks['ros_action'] = {
  /**
   * Block for creating a list with any number of elements of any type.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(260);
    this.appendValueInput('NAME').appendField('[ROS] action name :');
    this.appendValueInput('TYPE').appendField('type :');
    this.appendValueInput('GOAL').appendField("goal :").setAlign(Blockly.ALIGN_RIGHT)

    this.setInputsInline(true);

    this.appendStatementInput('ON_RESULT')
      .appendField("Result")
      .appendField(new Blockly.FieldVariable('item'), 'ON_RESULT_PARAM');

    this.appendStatementInput('ON_FEEDBACK')
      .appendField("Feedback")
      .appendField(new Blockly.FieldVariable('item'), 'ON_FEEDBACK_PARAM');
    this.setPreviousStatement(true);
    return this.setNextStatement(true);
  },

  getVars: function(){
    return [this.getFieldValue('ON_RESULT_PARAM'), this.getFieldValue('ON_FEEDBACK_PARAM')];

  }

};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],9:[function(require,module,exports){
(function (global){
var Blockly = (typeof window !== "undefined" ? window.Blockly : typeof global !== "undefined" ? global.Blockly : null);
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

var msg_registered = [];
Blockly.register_message_block = function(type, meta, tooltip){
  if(!_.include(msg_registered, type)){
    var blockKey = "ros_msg_" + type.replace("/", "-");
    Blockly.Blocks[blockKey] = {
      init: function() {
        var block = this;
        this.setColour(77);
        //
        this.appendDummyInput().appendField(type);
        _.each(meta.fieldnames, function(fn, idx){
          var fvals = _.filter(meta.field_values, {name: fn});


          input = block.appendValueInput(fn.toUpperCase()).appendField(fn);
          if(fvals.length){
            var drops = _.map(fvals, function(fv){ return [fv.const, fv.value]; });
            drops.unshift(['Select..', '__'])
            var dd = new Blockly.FieldDropdown(drops);
            input.appendField(dd, 'SELECT_'+fn.toUpperCase());


          }

        });
        // this.setTooltip(tooltip);
        this.setHelpUrl(MSG_DATABASE + "/message_detail?type="+type);
        this.setOutput(true);
        this.setHelpUrl(MSG_DATABASE + "/message_detail?type="+type);

        this.setPreviousStatement(false);
        return this.setNextStatement(false);
      }
    };
    Blockly.JavaScript[blockKey] = function(block){
      var msg = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_NONE) || '""';
      var code = '';
      var kv = [];
      _.each(meta.fieldnames, function(fn, idx){
        var sel_val = block.getFieldValue('SELECT_' + fn.toUpperCase());
        var v = Blockly.JavaScript.valueToCode(block, fn.toUpperCase(), Blockly.JavaScript.ORDER_NONE) || "''";
        if(sel_val && sel_val != '__'){
          var value_type = _.zipObject(meta.fieldnames, meta.fieldtypes)[fn];
          v = (value_type == 'string') ? JSON.stringify(sel_val) : sel_val;
        }

        kv.push("\"" + fn + "\":" + v);

      });
      return ["({"+kv.join(",")+"})", Blockly.JavaScript.ORDER_ATOMIC ];

    };


    msg_registered.push(type);

  // Blockly.JavaScript[blockKey] = function(block) {
    // var msg = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_NONE) || "''";
    // var tpl = '$engine.pub("<%= name %>", "<%= type %>", <%= msg %>);';
    // return _.template(tpl)({name: name, type: type, msg: msg});
  // };
  }

};


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],10:[function(require,module,exports){
(function (global){
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);
var Blockly = (typeof window !== "undefined" ? window.Blockly : typeof global !== "undefined" ? global.Blockly : null);
var ACTION_COLOR = require('../config').action_color;

Blockly.register_scheduled_publish_block = function(rapp, uri, name, type){
  Blockly.Blocks['ros_scheduled_publish_'+name] = {

    init: function() {
      this.setColour(ACTION_COLOR);
      this.appendDummyInput().appendField('[Publish] ' + name);
      this.appendValueInput('CTX').appendField('context : ');
      this.appendValueInput('VALUE').appendField('value : ');
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      return this.setNextStatement(true);
    }
  };

  Blockly.JavaScript['ros_scheduled_publish_'+name] = function(block) {
    var msg = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_NONE) || "''";
    var ctx = Blockly.JavaScript.valueToCode(block, 'CTX', Blockly.JavaScript.ORDER_NONE) || "''";
    var tpl = '$engine.scheduledPublish(<%= ctx %>, "<%= name %>", "<%= type %>", <%= msg %>);';
    return _.template(tpl)({name: name, type: type, msg: msg, ctx: ctx});
  };
};


Blockly.register_publish_block = function(name, type, extra){
  
  Blockly.Blocks['ros_publish_'+name] = {
    init: function() {
      this.extra = extra;
      this.setColour(ACTION_COLOR);
      this.appendValueInput('VALUE').appendField('[Publish] ' + name);
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      return this.setNextStatement(true);
    }
  };

  Blockly.JavaScript['ros_publish_'+name] = function(block) {
    var msg = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_NONE) || "''";
    var tpl = '$engine.pub("<%= name %>", "<%= type %>", <%= msg %>);';
    return _.template(tpl)({name: name, type: type, msg: msg});
  };

};


Blockly.register_scheduled_subscribe_block = function(rapp, uri, name, type, extra){

  Blockly.JavaScript['ros_scheduled_subscribe_'+name] = function(block) {
    var param0 = block.getFieldValue('DO_PARAM');
    var code = Blockly.JavaScript.statementToCode(block, 'DO');
    var ctx = Blockly.JavaScript.valueToCode(block, 'CTX', Blockly.JavaScript.ORDER_NONE) || "''";
    var tpl = "$engine.scheduledSubscribe(<%= ctx %>, '<%= name %>', '<%= type %>', function(<%= param0 %>){ <%= code %> });";
    return _.template(tpl)({ctx: ctx, name: name, type: type, code: code, param0: param0});

  };


  Blockly.Blocks['ros_scheduled_subscribe_'+name] = {

    init: function() {
      this.extra = extra;
      this.setColour(10);
      this.appendDummyInput().appendField('[Subscribe] ' + name);
      this.appendValueInput('CTX').appendField('context : ');
      this.setInputsInline(true);

      this.appendStatementInput('DO')
        .appendField('do')
        .appendField(new Blockly.FieldVariable('item'), 'DO_PARAM');

      this.setPreviousStatement(true);
      return this.setNextStatement(true);
    },

    getVars: function(){
      return [this.getFieldValue('DO_PARAM')];
    },
  };
};
Blockly.register_subscribe_block = function(name, type, extra){

  Blockly.JavaScript['ros_subscribe_'+name] = function(block) {
    var param0 = block.getFieldValue('DO_PARAM');
    var code = Blockly.JavaScript.statementToCode(block, 'DO');
    var tpl = "$engine.subscribe('<%= name %>', '<%= type %>', function(<%= param0 %>){ <%= code %> });";

    return _.template(tpl)({name: name, code: code, param0: param0, type: type});
  };


  Blockly.Blocks['ros_subscribe_'+name] = {
    init: function() {
      this.extra = extra;
      this.setColour(10);
      this.appendDummyInput().appendField('[ROS] subscribe ' + name);
      this.setInputsInline(true);

      this.appendStatementInput('DO')
        .appendField('do')
        .appendField(new Blockly.FieldVariable('item'), 'DO_PARAM');

      this.setPreviousStatement(true);
      return this.setNextStatement(true);
    },

    getVars: function(){
      return [this.getFieldValue('DO_PARAM')];
    },
  };
};

Blockly.Blocks['ros_subscribe'] = {
  init: function() {
    this.setColour(10);
    this.appendValueInput('NAME').appendField('[ROS] subscribe name :');
    this.appendValueInput('TYPE').appendField('type :');
    this.setInputsInline(true);

    this.appendStatementInput('DO')
      .appendField('do')
      .appendField(new Blockly.FieldVariable('item'), 'DO_PARAM');

    this.setPreviousStatement(false);
    return this.setNextStatement(false);
  },

  getVars: function(){
    return [this.getFieldValue('DO_PARAM')];
  }
};


Blockly.JavaScript['ros_subscribe'] = function(block) {
  var name = Blockly.JavaScript.valueToCode(block, 'NAME', Blockly.JavaScript.ORDER_NONE) || "''";
  var type = Blockly.JavaScript.valueToCode(block, 'TYPE', Blockly.JavaScript.ORDER_NONE) || "''";
  var param0 = block.getFieldValue('DO_PARAM');
  var code = Blockly.JavaScript.statementToCode(block, 'DO');
  var tpl = "$engine.subscribe(<%= name %>, <%= type %>, function(<%= param0 %>){ <%= code %> });";

  return _.template(tpl)({name: name, code: code, param0: param0, type: type});
};

Blockly.Blocks['ros_publish'] = {
  init: function() {
    this.setColour(ACTION_COLOR);
    this.appendValueInput('NAME').appendField('[ROS] publish name :');
    this.appendValueInput('TYPE').appendField('type :');
    this.appendValueInput('VALUE').appendField('message :');
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    return this.setNextStatement(true);
  }
};

Blockly.JavaScript['ros_publish'] = function(block) {
  var msg = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_NONE) || "''";
  var name = Blockly.JavaScript.valueToCode(block, 'NAME', Blockly.JavaScript.ORDER_NONE) || "''";
  var type = Blockly.JavaScript.valueToCode(block, 'TYPE', Blockly.JavaScript.ORDER_NONE) || "''";

  var tpl = '$engine.pub(<%= name %>, <%= type %>, <%= msg %>);';

  return _.template(tpl)({name: name, type: type, msg: msg});
};

Blockly.Blocks['ros_publish2'] = {
  init: function() {
    this.setColour(ACTION_COLOR);
    this.appendValueInput('VALUE').appendField('xxxxxxxxxxxxx xx xoijqweofij qwoefij ');
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    return this.setNextStatement(true);
  }
};


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../config":15}],11:[function(require,module,exports){
(function (global){
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);
var Blockly = (typeof window !== "undefined" ? window.Blockly : typeof global !== "undefined" ? global.Blockly : null);

Blockly.Blocks['ros_requester_allocate'] = {
  configable: true,
  init: function() {
    var block = this;
    this.setColour(77);
    this.appendDummyInput().appendField("Allocate Resource");
    this.setPreviousStatement(false);
    this.setNextStatement(false);
    this.setOutput(true);
    return this;
  }
};
Blockly.JavaScript['ros_requester_allocate'] = function(block){
  // return "requester.cancel_all();";
  var config = block.extra_config;


  var tpl = '($engine.allocateResource("<%= rapp %>", "<%= uri %>", <%= remappings %>, <%= parameters %>, <%= options %>)) ';

  var code = _.template(tpl)({
    rapp: config.rapp, 
    uri: config.uri, 
    remappings: JSON.stringify(config.remappings),
    parameters: JSON.stringify(config.parameters),
    options: JSON.stringify({timeout: config.timeout})
  });
  return [code, Blockly.JavaScript.ORDER_ATOMIC];

};


Blockly.Blocks['ros_requester_allocate2'] = {
  configable: true,
  init: function() {
    var block = this;
    this.setColour(77);
    this.appendDummyInput().appendField("Allocate Resource");
    this.appendDummyInput().appendField('type').appendField(new Blockly.FieldDropdown([['dynamic', 'dynamic'], ['static', 'static']]), 'TYPE');
    this.appendDummyInput().appendField('var').appendField(new Blockly.FieldTextInput('resource', null), 'VAR')
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    // this.setOutput(true);
    return this;
  },

  getVars: function(){
    return [this.getFieldValue('VAR')];

  }
  
};
Blockly.JavaScript['ros_requester_allocate2'] = function(block){
  // return "requester.cancel_all();";
  var config = block.extra_config;
  var type = block.getFieldValue('TYPE');


  var tpl = 'var <%= var_name %> = ($engine.allocateResource("<%= rapp %>", "<%= uri %>", <%= remappings %>, <%= parameters %>, <%= options %>)); ';

  var code = _.template(tpl)({
    var_name: this.getFieldValue('VAR'),
    rapp: config.rapp, 
    uri: config.uri, 
    remappings: JSON.stringify(config.remappings),
    parameters: JSON.stringify(config.parameters),
    options: JSON.stringify({timeout: config.timeout, type: type})
  });
  console.log(code);

  return code;

};

Blockly.Blocks['ros_requester_allocate_with_block'] = {
  configable: true,
  init: function() {
    var block = this;
    this.setColour(77);
    this.appendDummyInput().appendField("Allocate Resource");
    this.appendDummyInput().appendField('type').appendField(new Blockly.FieldDropdown([['dynamic', 'dynamic'], ['static', 'static']]), 'TYPE');
      this.appendStatementInput('ON_SUCCESS')
        .appendField("Success")
        .appendField(new Blockly.FieldVariable('resource'), 'ON_SUCCESS_PARAM');

      this.appendStatementInput('ON_FAIL')
        .appendField("Fail")
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    // this.setOutput(true);
    return this;
  },

  getVars: function(){
    return [this.getFieldValue('ON_SUCCESS_PARAM')];

  }
  
};
Blockly.JavaScript['ros_requester_allocate_with_block'] = function(block){
  // return "requester.cancel_all();";
  var config = block.extra_config;
  var type = block.getFieldValue('TYPE');

  var codeSuccess = Blockly.JavaScript.statementToCode(block, 'ON_SUCCESS');
  var codeFail = Blockly.JavaScript.statementToCode(block, 'ON_FAIL');
  var paramNameOnSucess = block.getFieldValue('ON_SUCCESS_PARAM');

  var tpl = '(function(<%= param %>){ if(<%= param %>){ <%= codeSuccess %> }else{ <%= codeFail %>} })($engine.allocateResource("<%= rapp %>", "<%= uri %>", <%= remappings %>, <%= parameters %>, <%= options %>));';

  var code = _.template(tpl)({
    var_name: this.getFieldValue('VAR'),
    rapp: config.rapp, 
    uri: config.uri, 
    remappings: angular.toJson(config.remappings),
    parameters: angular.toJson(config.parameters),
    options: angular.toJson({timeout: config.timeout, type: type}),
    param: paramNameOnSucess,
    codeSuccess: codeSuccess,
    codeFail: codeFail
  });
  console.log(code);

  return code;

};




Blockly.Blocks['ros_requester_release'] = {
  init: function() {
    var block = this;
    this.setColour(77);
    this.appendValueInput('CTX').appendField("Release Resource");
    this.setPreviousStatement(true);
    return this.setNextStatement(true);
  }
};
Blockly.JavaScript['ros_requester_release'] = function(block){
  var ctx = Blockly.JavaScript.valueToCode(block, 'CTX', Blockly.JavaScript.ORDER_NONE) || "''";
  var tpl = '$engine.releaseResource(<%= ctx %>);';
  return _.template(tpl)({ctx: ctx});

};



}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],12:[function(require,module,exports){
(function (global){
var Blockly = (typeof window !== "undefined" ? window.Blockly : typeof global !== "undefined" ? global.Blockly : null);
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);
var ACTION_COLOR = require('../config').action_color;

Blockly.Blocks['ros_service'] = {
  init: function() {
    this.setColour(ACTION_COLOR);
    this.appendValueInput('NAME').appendField('[ROS] call service :');
    this.appendValueInput('TYPE').appendField('type :');
    this.appendValueInput('VALUE').appendField('message :');

    this.setInputsInline(true);
    this.setOutput(true);
  }
};

Blockly.JavaScript['ros_service'] = function(block) {
  var msg = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_NONE) || "''";
  var name = Blockly.JavaScript.valueToCode(block, 'NAME', Blockly.JavaScript.ORDER_NONE) || "''";
  var type = Blockly.JavaScript.valueToCode(block, 'TYPE', Blockly.JavaScript.ORDER_NONE) || "''";

  var tpl = '($engine.runService(<%= name %>, <%= type %>, <%= msg %>))';
  var code =_.template(tpl)({name: name, type: type, msg: msg});
  return [code, Blockly.JavaScript.ORDER_NONE];
};



}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../config":15}],13:[function(require,module,exports){

Blockly.Blocks['ui_create'] = {

  init: function() {
    this.setColour(30);
    this.appendDummyInput().appendField('Create UI');
    this.appendDummyInput().appendField(new Blockly.FieldTextInput('name', null), 'NAME')
    this.setInputsInline(true);

    this.appendStatementInput('COMPS')
      .appendField("components")

    this.setPreviousStatement(true);
    return this.setNextStatement(true);
  },

};


Blockly.Blocks['ui_horizontal'] = {

  init: function() {
    this.setColour(30);
    this.appendDummyInput().appendField('Layout(horizontal)' + name);
    this.setInputsInline(true);

    this.appendStatementInput('COMPS')
      .appendField("components")

    this.setPreviousStatement(true);
    return this.setNextStatement(true);
  },

};

Blockly.Blocks['ui_vertical'] = {

  init: function() {
    this.setColour(30);
    this.appendDummyInput().appendField('Layout(vertical)' + name);
    this.setInputsInline(true);

    this.appendStatementInput('COMPS')
      .appendField("components")

    this.setPreviousStatement(true);
    return this.setNextStatement(true);
  },

};
Blockly.Blocks['ui_text'] = {

  init: function() {
    this.setColour(30);
    this.appendDummyInput().appendField('Text' + name);

    this.appendDummyInput().appendField('name:')
      .appendField(new Blockly.FieldTextInput('name', null), 'NAME');

    this.appendValueInput('TEXT').appendField('text:');
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    return this.setNextStatement(true);

  },

};

Blockly.Blocks['ui_set_attr'] = {

  init: function() {
    this.setColour(30);
    this.appendDummyInput().appendField('Set Attribute' + name);

    this.appendDummyInput().appendField('name:')
      .appendField(new Blockly.FieldTextInput('name', null), 'NAME');

    this.appendValueInput('ATTR').appendField('attr:');
    this.appendValueInput('VALUE').appendField('value:');
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    return this.setNextStatement(true);


  },

};
Blockly.Blocks['ui_button'] = {

  init: function() {
    this.setColour(30);
    this.appendDummyInput().appendField('Button' + name);

    this.appendDummyInput().appendField('name:')
      .appendField(new Blockly.FieldTextInput('name', null), 'NAME');

    this.appendValueInput('TEXT').appendField('text:');
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    return this.setNextStatement(true);


  },

};
Blockly.JavaScript['ui_set_attr'] = function(block){
  var attr = Blockly.JavaScript.valueToCode(block, 'ATTR', Blockly.JavaScript.ORDER_NONE) || "''";
  var value = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_NONE) || "''";
  var name = block.getFieldValue('NAME');


  var data = {
    rocon_id: name,
    attr: eval(attr),
    value: eval(value)
  };
  var code = _.template('$engine.publish("to-rocon-ui", "std_msgs/String", {data: <%= data %>});')({
    data: "'" + JSON.stringify(data) + "'"
  });
  return code;
};
Blockly.JavaScript['ui_button'] = function(block){
  var text = Blockly.JavaScript.valueToCode(block, 'TEXT', Blockly.JavaScript.ORDER_NONE) || "''";
  var name = block.getFieldValue('NAME');

  console.log(name);

  var code = _.template('layout.push({type: "button", name: "<%= name %>", text: <%= text %>});')({
    text: text,
    name: name
  });
  return code;
};
Blockly.JavaScript['ui_text'] = function(block){
  var text = Blockly.JavaScript.valueToCode(block, 'TEXT', Blockly.JavaScript.ORDER_NONE) || "''";
  var name = block.getFieldValue('NAME');

  console.log(name);

  var code = _.template('layout.push({type: "text", name: "<%= name %>", text: <%= text %>});')({
    text: text,
    name: name
  });
  return code;
};


var _componentsMeta = function(block){
  var code = Blockly.JavaScript.statementToCode(block, 'COMPS', Blockly.JavaScript.ORDER_NONE) || "''";
  var meta_tpl = _.template('(function(layout){ <%= code %>; return layout; })([]);');
  var meta = meta_tpl({code: code});
  return JSON.stringify(eval(meta));

};

Blockly.JavaScript['ui_vertical'] = function(block){
  return _.template('layout.push({type: "vertical", children: <%= meta %>});')({meta: _componentsMeta(block)});
};
Blockly.JavaScript['ui_horizontal'] = function(block){
  return _.template('layout.push({type: "horizontal", children: <%= meta %>});')({meta: _componentsMeta(block)});
};
Blockly.JavaScript['ui_create'] = function(block){
  var name = block.getFieldValue('NAME');
  var tpl = _.template("$engine.createUI('<%= name%>', <%= meta %>);");
  return tpl({name: name, meta: _componentsMeta(block)});
};


},{}],14:[function(require,module,exports){
(function (global){
var Blockly = (typeof window !== "undefined" ? window.Blockly : typeof global !== "undefined" ? global.Blockly : null),
  _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);
var ACTION_COLOR = require('../config').action_color;

Blockly.JavaScript['declare_var'] = function(block){

  // var key = Blockly.JavaScript.valueToCode(block, 'KEY', Blockly.JavaScript.ORDER_NONE) || "''";
  var va = Blockly.JavaScript.valueToCode(block, 'VAR', Blockly.JavaScript.ORDER_NONE) || "''";
  var tpl = "var <%= va %>;";
  var code = _.template(tpl)({va: va});

  return code;

}
Blockly.Blocks['declare_var'] = {
  init: function() {
    this.appendValueInput('VAR').appendField('Declare Variable');
    this.setInputsInline(true);
    this.contextMenu = false;
    this.setPreviousStatement(true);
    this.setNextStatement(true);
  }
};
/*
 * functions
 */

Blockly.register_function_block = function(name, args, has_return){
  Blockly.Blocks['udf_'+name] = {
    init: function() {
      this.setColour(240);
      this.appendDummyInput().appendField(name);
      var blk = this;

      _.each(args, function(arg){
        blk.appendValueInput(arg.toUpperCase()).appendField(arg);

      });

      this.setInputsInline(false);


      if(has_return){
        this.setOutput(true);
        this.setPreviousStatement(false);
        this.setNextStatement(false);
      }else{
        this.setOutput(false);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
      }
    }
  };
  Blockly.JavaScript['udf_'+name] = function(block) {
    var funcName = name;
    var _args = _.map(args, function(a){
      return Blockly.JavaScript.valueToCode(block, a.toUpperCase(), Blockly.JavaScript.ORDER_COMMA) || 'null';
    });
    var code = funcName + '(' + _args.join(', ') + ');';
    if(has_return){
      return [code, Blockly.JavaScript.ORDER_ATOMIC];
    }
    return code;
  };


  // Blockly.JavaScript['ros_publish_'+name] = function(block) {
    // var msg = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_NONE) || "''";
    // var tpl = '$engine.pub("<%= name %>", "<%= type %>", <%= msg %>);';
    // return _.template(tpl)({name: name, type: type, msg: msg});
  // };

};

/*
 * Sleep
 */
Blockly.Blocks['json'] = {
  init: function() {
    // this.setColour(ACTION_COLOR);
    this.appendDummyInput()
      .appendField("JSON")
      .appendField(new Blockly.FieldTextInput('{}', null), 'JSON')
    this.setOutput(true, 'Array');
    this.setPreviousStatement(false);
    return this.setNextStatement(false);
  }
};

Blockly.JavaScript['json'] = function(block) {
  var json = block.getFieldValue('JSON');
  var code = _.template("JSON.parse('<%= json%>')")({json: json});


  return [json, Blockly.JavaScript.ORDER_ATOMIC];
};

/*
 * defer
 */
Blockly.Blocks['defer'] = {
  init: function() {
    // this.setColour(ACTION_COLOR);
    this.appendStatementInput('DO')
      .appendField('background')

    this.setPreviousStatement(true);
    this.setNextStatement(true);
  }
};

Blockly.JavaScript['defer'] = function(block) {
  var code = Blockly.JavaScript.statementToCode(block, 'DO');
  return _.template("setTimeout(function(){ Fiber(function(){<%= code %>}).run(); }, 0);")({code: code});
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../config":15}],15:[function(require,module,exports){
module.exports={
  "action_color": 100,
  "undo_check_interval": 1000,
  "undo_max_size": 100
}

},{}],16:[function(require,module,exports){

                                            
                                            
                                            
// @ngInject
function ConfigCtrl($scope, $rootScope, blocksStore, $http, $modalInstance, rapps) {

  var ctrl = this;
  this.blockConfigs = {};
  this.currentBlockConfig = '';

  this.rapps = rapps.rapps;
  this.config = {
    timeout: 15000,
    remappings: [],
    parameters: []
  }; 



  this.rapps = rapps.rapps.map(function(rapp){
    var apps = R.keys(rapp.rocon_apps);
    return R.map(
      R.concat(rapp.name + "/")
    )(apps);
  });
  this.rapps = R.flatten(this.rapps);
  console.log(this.rapps);


  var fillUris = function(rapp){
    var pair = rapp.split("/");
    var rapp = R.find(R.propEq('name', pair[0]))(rapps.rapps);
    var rocon_app = rapp['rocon_apps'][pair[1]];

    if(rocon_app.children){
      ctrl.uris = JSONSelect.match('.compatibility', rocon_app.children).concat('rocon:/*')
    }else{
      ctrl.uris = [rocon_app.compatibility];
    }

  };

  this.rappSelected = function(item){
    var pair = item.split("/");
    var rapp = R.find(R.propEq('name', pair[0]))(rapps.rapps);
    var rocon_app = rapp['rocon_apps'][pair[1]];


    ctrl.config.parameters = [];
    ctrl.config.remappings = [];
    ctrl.config.timeout = 15000;
    ctrl.config.uri = null;


    fillUris(item);
    ctrl.config.uri = ctrl.uris[0];



    var names = JSONSelect.match('.public_interface .name', rocon_app)
    names.forEach(function(nm){
      var to = nm.match(/\/.+/) ? nm : "/"+nm;
      ctrl.config.remappings.push({remap_from: nm, remap_to: to});
    });


    if(rocon_app.public_parameters){
      ctrl.config.parameters = [];
      R.mapObj.idx(function(v, k){
        ctrl.config.parameters.push({key: k, value: v});
      })(rocon_app.public_parameters)

    }


  };

  this.addRemapping = function(){
    ctrl.config.remappings.push({remap_from: '', remap_to: ''});
  };
  this.deleteRemapping = function(idx){
    ctrl.config.remappings.splice(idx, 1);
  };
  this.addParameter = function(){
    ctrl.config.parameters.push({key: '', value: ''});
  };
  this.deleteParameter = function(idx){
    ctrl.config.parameters.splice(idx, 1);
  };



  // default
  if(Blockly.selected && Blockly.selected.extra_config){
    this.config = Blockly.selected.extra_config;
    fillUris(this.config.rapp);
  }




  this.ok = function(){
    if(Blockly.selected){
      console.log(ctrl.config);


      _.each(ctrl.config.remappings, function(x){
        delete x['$$hashKey'];
      });
      _.each(ctrl.config.parameters, function(x){
        delete x['$$hashKey'];
      });

      Blockly.selected.extra_config = ctrl.config;
    };
    $modalInstance.dismiss();

  };


};

module.exports = ConfigCtrl;

},{}],17:[function(require,module,exports){
(function (global){
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

module.exports = function($scope, blocksStore, $http, $state, $rootScope) {

  angular.element(document).on('unload', function(e){
    console.log('unload');
    e.preventDefault();


  });


  $scope.services = [];
  $scope.state = $state;


  console.log('00000000000000');

  blocksStore.loadRapp().then(function(data){

    console.log('XXXXXXXXXXXXXXXXXXXXXXXXXXXXX', data);

    $rootScope.rapps = data;
  console.log('9999999999');

  });

  blocksStore.getParam(ITEMS_PARAM_KEY).then(function(rows){
    console.log('loaded ', rows);
    if(!rows){
      $scope.items = [];
    }else{
      $scope.items = rows;
      $rootScope.$emit('items:loaded');
      // reload_udf_blocks($scope.items);

    }

    $scope.$watch('items', function(newValue, oldValue) {
      console.log('items watched');
      if (!_.isEqual(newValue, oldValue)) {
        console.log(oldValue, "->", newValue);

        blocksStore.setParam(ITEMS_PARAM_KEY, newValue).then(function(res){
          $rootScope.$emit('items:saved');

        });
          
      }
    }, true);

  });

  blocksStore.getParam(SERVICES_PARAM_KEY).then(function(rows){
    console.log('loaded ', rows);
    if(!rows){
      $scope.services = $scope.recents = [];
    }else{
      $scope.services = rows;
      // $scope.recents = R.take(5, R.sort(function(a, b){ return b.id - a.id; }, rows));
    }
    $scope.$watch('services', function(newValue, oldValue) {
      console.log('services watched');
      if (!_.isEqual(newValue, oldValue)) {
        console.log(oldValue, "->", newValue);

        blocksStore.setParam(SERVICES_PARAM_KEY, newValue).then(function(res){
          console.log('services saved', newValue, res);

        });
          
      }
    }, true);
  });

  $scope.searchCompare = function(v, keyword){ 
    return v.toString().toLowerCase().indexOf(keyword.toLowerCase()) >= 0;
  };

};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],18:[function(require,module,exports){
(function (global){
var R = (typeof window !== "undefined" ? window.R : typeof global !== "undefined" ? global.R : null)
  $ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null),
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
    var title = $scope.title;
    var description = $scope.description;

    serviceAuthoring.saveService(title, description, v, destPackage).then(function(){
      alert('saved');
      $('#modal-package-select').modal('hide');
      
    });

  };
  $scope.export = function(){
    serviceAuthoring.getPackages().then(function(packs){
      // $scope.packageList = packs;

      var v = editor.getValue();
      // serviceAuthoring.saveService(v);
      $scope.title = v.name;
      $scope.description = v.description;

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

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../schema/service_form":23,"../utils":28}],19:[function(require,module,exports){

module.exports = function ServicesIndex($scope, blocksStore){

};

},{}],20:[function(require,module,exports){
(function (global){
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null),
  $ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null),
  Blockly = (typeof window !== "undefined" ? window.Blockly : typeof global !== "undefined" ? global.Blockly : null),
  BlockGenerator = require('../block_gen'),
  ros_block_override = require('../blocks/blocks_defaults'),
  R = (typeof window !== "undefined" ? window.R : typeof global !== "undefined" ? global.R : null),
  UndoManager = require('../undo_manager'),
  Utils = require('../utils');
              
              
function WorkflowBlocklyCtrl($scope, blocksStore, $http, $rootScope, $stateParams, $modal, $q) {
  Blockly.inject(document.getElementById('blocklyDiv'),
    {path: './', toolbox: document.getElementById('toolbox')});
  var undo_manager = new UndoManager();
  undo_manager.start();


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
      controller: require('./config_ctrl'),
      controllerAs: 'ctrl',
      resolve: {
        rapps: function(){
          return $rootScope.rapps;
        }

      }
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
    Utils.reload_udf_blocks($scope.items);
    if($stateParams.id){ // load
      $scope.load($stateParams.id);
    }
  });
  $rootScope.$on('items:saved', function(){
    Utils.reload_udf_blocks($scope.items);

    $('#alert .alert').html('Saved');
    $('#alert').show().delay(500).fadeOut('fast');

  });

  var resetCurrent = function(){
    $scope.current = {id: Utils.uuid(), title: 'Untitled', description: 'Service Description', created_at: new Date().getTime()};
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
    var cur = $scope.current;


    var id = $scope.current.id;
    var title = $scope.current.title;
    var description = $scope.current.description;
    var created_at = $scope.current.created_at;
    try {
      var js = _js();
      var xml = _xml();
    }catch(e){
      alert('failed to save : ' + e.message);

      return null;

    }


    var idx = _.findIndex($scope.items, {id: id});
    if(idx >= 0){
      $scope.items[idx] = {id: id, js: js, xml: xml, title: $scope.current.title, description: description, created_at: created_at};
      console.log(1);


    }
    else {
      var sameTitleIdx = R.findIndex(R.propEq('title', cur.title))($scope.items);
      if(sameTitleIdx >= 0){
        alert('item with same title exists');
        return;

      }
      
      $scope.items.push({id: id, title: title, js: js, xml: xml, description: description, created_at: created_at});
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
          var $ros = $tb.find('category[name=Rocon]');


          R.forEach(function(pair){
            if(!pair[0]){
              return;
            }
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
        R.map(function($el){ $tb.find('category[name=Rocon]').append($el); }),
        R.map(R.bind(generator.generate_client_app_blocks, generator)),
        R.reject(R.isEmpty),
        R.flatten,
        R.map(function(i){ return {interface: i.interface, client_app_name: i.name, client_app_id: i._id}; })
        // R.mapProp('interface'),
        // R.map(function(i){ i.interface = R.map(R.assoc('client_app_id', i._id))(i.interface); return i;})
      )(interactions.data);
      


      console.groupEnd();

      // IMPORTANT
      ros_block_override();


      console.log('----------------------a');
      console.log($('#toolbox').get(0));



      Blockly.updateToolbox($('#toolbox').get(0));
      console.log('----------------------/a');
      Utils.reload_udf_blocks($scope.items);

    })
    .catch(function(e){
      console.error('cannot load blocks - msg database error', e);

      
    })
      

  };
  _.defer(loadBlocks);


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
    console.log($scope.items);
    console.log($scope.itemSelection);

    var pom = document.createElement('a');
    R.map(function(id){
      var item = _.find($scope.items, {title: id});


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
    console.log('here!');

    var files = e.files;
    var f = files[0];

    var r = new FileReader();
    r.onload = function(e) { 
      var json = e.target.result;
      console.log(json);

      var item = JSON.parse(json);
      console.log(item);





      var sameTitleIdx = R.findIndex(R.propEq('title', item.title))($scope.items);
      console.log(sameTitleIdx);
      if(sameTitleIdx >= 0){
        if(confirm('item with same title exists, overrite?')){
          $scope.$apply(function(){
            item.id = Utils.uuid();
            $scope.items[sameTitleIdx] = item;
          });
        }
      }else{
        $scope.$apply(function(){
          console.log('here');

          item.id = Utils.uuid();
          $scope.items.push(item);
        });
      }
      $('#itemsFile').val('');



    }
    r.readAsText(f);




  };
};

module.exports = WorkflowBlocklyCtrl;


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../block_gen":2,"../blocks/blocks_defaults":3,"../undo_manager":27,"../utils":28,"./config_ctrl":16}],21:[function(require,module,exports){
(function (global){
var R = (typeof window !== "undefined" ? window.R : typeof global !== "undefined" ? global.R : null);

module.exports = function($scope, blocksStore) {
  $scope.items = [];
  $scope.recents = [];
  blocksStore.getParam(ITEMS_PARAM_KEY).then(function(rows){
    console.log('loaded ', rows);
    if(!rows){
      $scope.items = $scope.recents = [];
    }else{
      $scope.items = rows;
      $scope.recents = R.take(5, R.sort(function(a, b){ return b.id - a.id; }, rows));
    }
  });
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],22:[function(require,module,exports){
(function (global){
var R = (typeof window !== "undefined" ? window.R : typeof global !== "undefined" ? global.R : null);

function CAJsonEditorProvider(){
  this.$get = function(){
    return (typeof window !== "undefined" ? window.JSONEditor : typeof global !== "undefined" ? global.JSONEditor : null);
  };

};

CAJsonEditor.$inject = ['$q', 'caJsonEditor'];

function CAJsonEditor($q, JSONEditor){
  return {
    restrict: 'E',
    scope: {
      schema: '=',
      editorOptions: '=',
      startval: '=',
      onChange: '&'
    },
    link: function(scope, element, attrs){
      var valueToResolve,
          startValPromise = $q.when(null),
          schemaPromise = $q.when(null);

      scope.isValid = false;

      console.log('ATTRS', attrs);


      if (!angular.isString(attrs.schema)) {
          throw new Error('no schema specified');
      }
      if (angular.isObject(scope.schema)) {
          schemaPromise = $q.when(scope.schema);
      }
      if (angular.isObject(scope.startval)) {
          valueToResolve = scope.startval;
          if (angular.isDefined(valueToResolve.$promise)) {
              startValPromise = $q.when(valueToResolve.$promise);
          } else {
              startValPromise = $q.when(valueToResolve);
          }
      }

      $q.all([schemaPromise, startValPromise]).then(function (result) {

        var schema = result[0].data || result[0],
            startVal = result[1];
        if (schema === null) {
            throw new Error('no schema');
        }

        console.log('schema : ', schema);


        var options = {schema: schema};
        if(startVal){ options.startval = startVal; }


        options = R.mixin(options, scope.editorOptions);
        scope.editor = new JSONEditor(element[0], options);

        var editor = scope.editor;

        editor.on('ready', function () {
          scope.isValid = (editor.validate().length === 0);
        });

        editor.on('change', function () {
          if (typeof scope.onChange === 'function') {
            console.log('---', editor.getValue());

              scope.onChange({data: editor.getValue()});
          }
          scope.$apply(function () {
              scope.isValid = (editor.validate().length === 0);
          });
        });

      });

    }

  }

}

module.exports = {
  provider: CAJsonEditorProvider,
  directive: CAJsonEditor
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],23:[function(require,module,exports){
module.exports={
  "title": "Create Service",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "options": {
        "hidden": true
      }

    },
    "created_at": {
      "type": "integer",
      "options": {
        "hidden": true
      }

    },

    "name": {
      "type": "string",
      "title": "Name"

    },
    "description": {
      "type": "string",
      "title": "Description"
    },
    "author": {
      "type": "string",
      "title": "Author"

    },
    "priority": {
      "type": "integer",
      "default": 10000,
      "title": "Priority"
    },
    "launcher": {
      "type": "object",
      "properties": {
        "launcher_type": {
          "type": "string",
          "enum": [
            "ros_launcher",
            "bpel",
            "blockly"
          ]

        },
        "launcher_body": {
          "type": "string",
          "format": "textarea"
        }


      }

    },
    "workflows": {
      "type": "array",
      "uniqueItems": true,
      "format": "checkbox",
      "items": {
        "type": "string",
        "enum": ["value1","value2"]
      }
    },
    "interactions": {
      "type": "array",
      "title": "Interactions",
      "options": {
        "disable_array_add": true,
        "collapsed": false

      },
      "items": {
        "type": "object",
        "title": "Interaction",
        "headerTemplate": "{{self.display_name}}",
        "properties": {
          "_id": {
            "type": "string",
            "options": {
              "hidden": true
            }
          },
          "display_name": {
            "type": "string"
          },
          "name": {"type": "string"},
          "role": {"type": "string"},
          "compatibility": {
            "type": "string", 
            "options": {
              "hidden": true
            }
          },
          "description": {
            "type": "string",
            "format": "textarea"
          },
          "max": {
            "type": "integer", 
            "default": -1
          },
          "remappings": {
            "type": "array",
            "format": "table",
            "title": "Remappings",
            "options": {
            },
            "items": {
              "type": "object",
              "properties": {
                "remap_from": {"type": "string"},
                "remap_to": {"type": "string"}
              }

            }

          },
          "parameters": {
            "type": "array",
            "format": "table",
            "title": "Parameters",
            "options": {
              "disable_array_delete": true

            },
            "items": {
              "type": "object",
              "properties": {
                "key": {"type": "string"},
                "value": {"type": "string"}
              }

            }

          }
        }

      },

      "properties": {
        "role": {
          "title": "Role",
          "type": "string"

        }

      }
    },
    "parameters": {
      "type": "array",
      "format": "table",
      "title": "Parameters",
      "options": {
        "disable_array_delete": true

      },
      "items": {
        "type": "object",
        "properties": {
          "key": {"type": "string"},
          "value": {"type": "string"}
        }

      }
    }
  }
}

},{}],24:[function(require,module,exports){

module.exports = function($http, $q){


  this.setParam = function(k, v){
    // var dfd = $q.defer();
    // localStorage.setItem(k, JSON.stringify(v));
    // dfd.resolve(true);
    // return dfd.promise;
    return $http.post('/api/param/'+k, {data: v}).then(function(res){
      return res.data;
    });
  }
  this.getParam = function(k){
    // var dfd = $q.defer();
    // var v = localStorage.getItem(k);
    // dfd.resolve(JSON.parse(v));
    // return dfd.promise;
    

    return $http.get('/api/param/'+k).then(function(res){
      if(res.data.data){
        return res.data.data;
      }
      return null;
    });
  }
  this.publish = function(topic){
    return $http.post('/api/publish', {topic: topic}).then(function(res){
      return res.data;
    });
  }

  this.loadRapp = function(){
    var that = this;
    var data = {};
    return $http.post('/api/load_rapp', data).then(function(res){
      return res.data;
    });
  };
  this.loadInteractions = function(){
    var that = this;
    var data = {};
    return $http.get('/api/load_interactions', data).then(function(res){
      return res.data;
    });
  };
  this.eval = function(code){
    var that = this;
    var data = {code: code};
    $http.post('/api/eval', data).then(function(res){
      return res.data;
    });
  };


};

},{}],25:[function(require,module,exports){

module.exports = function($http, $q){

  this.saveService = function(title, description, serviceMeta, package){
    return $http.post('/api/services/save', {service: serviceMeta, package: package, title: title, description: description})
      .then(function(res){
        return res.data;
      });

  };

  this.getPackages = function(serviceMeta){
    return $http.get('/api/packages').then(function(res){
      return res.data;
    });

  };

};




},{}],26:[function(require,module,exports){
/*jslint onevar: false, plusplus: false */
/*

 JS Beautifier
---------------


  Written by Einar Lielmanis, <einar@jsbeautifier.org>
      http://jsbeautifier.org/

  Originally converted to javascript by Vital, <vital76@gmail.com>

  You are free to use this in any way you want, in case you find this useful or working for you.

  Usage:
    js_beautify(js_source_text);
    js_beautify(js_source_text, options);

  The options are:
    indent_size (default 4)          â€” indentation size,
    indent_char (default space)      â€” character to indent with,
    preserve_newlines (default true) â€” whether existing line breaks should be preserved,
    preserve_max_newlines (default unlimited) - maximum number of line breaks to be preserved in one chunk,
    indent_level (default 0)         â€” initial indentation level, you probably won't need this ever,

    space_after_anon_function (default false) â€” if true, then space is added between "function ()"
            (jslint is happy about this); if false, then the common "function()" output is used.
    braces_on_own_line (default false) - ANSI / Allman brace style, each opening/closing brace gets its own line.

    e.g

    js_beautify(js_source_text, {indent_size: 1, indent_char: '\t'});


*/



function js_beautify(js_source_text, options) {

    var input, output, token_text, last_type, last_text, last_last_text, last_word, flags, flag_store, indent_string;
    var whitespace, wordchar, punct, parser_pos, line_starters, digits;
    var prefix, token_type, do_block_just_closed;
    var wanted_newline, just_added_newline, n_newlines;


    // Some interpreters have unexpected results with foo = baz || bar;
    options = options ? options : {};
    var opt_braces_on_own_line = options.braces_on_own_line ? options.braces_on_own_line : false;
    var opt_indent_size = options.indent_size ? options.indent_size : 4;
    var opt_indent_char = options.indent_char ? options.indent_char : ' ';
    var opt_preserve_newlines = typeof options.preserve_newlines === 'undefined' ? true : options.preserve_newlines;
    var opt_max_preserve_newlines = typeof options.max_preserve_newlines === 'undefined' ? false : options.max_preserve_newlines;
    var opt_indent_level = options.indent_level ? options.indent_level : 0; // starting indentation
    var opt_space_after_anon_function = options.space_after_anon_function === 'undefined' ? false : options.space_after_anon_function;
    var opt_keep_array_indentation = typeof options.keep_array_indentation === 'undefined' ? false : options.keep_array_indentation;

    just_added_newline = false;

    // cache the source's length.
    var input_length = js_source_text.length;

    function trim_output(eat_newlines) {
        eat_newlines = typeof eat_newlines === 'undefined' ? false : eat_newlines;
        while (output.length && (output[output.length - 1] === ' '
            || output[output.length - 1] === indent_string
            || (eat_newlines && (output[output.length - 1] === '\n' || output[output.length - 1] === '\r')))) {
            output.pop();
        }
    }

    function trim(s) {
        return s.replace(/^\s\s*|\s\s*$/, '');
    }

    function print_newline(ignore_repeated) {

        flags.eat_next_space = false;
        if (opt_keep_array_indentation && is_array(flags.mode)) {
            return;
        }

        ignore_repeated = typeof ignore_repeated === 'undefined' ? true : ignore_repeated;

        flags.if_line = false;
        trim_output();

        if (!output.length) {
            return; // no newline on start of file
        }

        if (output[output.length - 1] !== "\n" || !ignore_repeated) {
            just_added_newline = true;
            output.push("\n");
        }
        for (var i = 0; i < flags.indentation_level; i += 1) {
            output.push(indent_string);
        }
        if (flags.var_line && flags.var_line_reindented) {
            if (opt_indent_char === ' ') {
                output.push('    '); // var_line always pushes 4 spaces, so that the variables would be one under another
            } else {
                output.push(indent_string); // skip space-stuffing, if indenting with a tab
            }
        }
    }



    function print_single_space() {
        if (flags.eat_next_space) {
            flags.eat_next_space = false;
            return;
        }
        var last_output = ' ';
        if (output.length) {
            last_output = output[output.length - 1];
        }
        if (last_output !== ' ' && last_output !== '\n' && last_output !== indent_string) { // prevent occassional duplicate space
            output.push(' ');
        }
    }


    function print_token() {
        just_added_newline = false;
        flags.eat_next_space = false;
        output.push(token_text);
    }

    function indent() {
        flags.indentation_level += 1;
    }


    function remove_indent() {
        if (output.length && output[output.length - 1] === indent_string) {
            output.pop();
        }
    }

    function set_mode(mode) {
        if (flags) {
            flag_store.push(flags);
        }
        flags = {
            previous_mode: flags ? flags.mode : 'BLOCK',
            mode: mode,
            var_line: false,
            var_line_tainted: false,
            var_line_reindented: false,
            in_html_comment: false,
            if_line: false,
            in_case: false,
            eat_next_space: false,
            indentation_baseline: -1,
            indentation_level: (flags ? flags.indentation_level + ((flags.var_line && flags.var_line_reindented) ? 1 : 0) : opt_indent_level)
        };
    }

    function is_array(mode) {
        return mode === '[EXPRESSION]' || mode === '[INDENTED-EXPRESSION]';
    }

    function is_expression(mode) {
        return mode === '[EXPRESSION]' || mode === '[INDENTED-EXPRESSION]' || mode === '(EXPRESSION)';
    }

    function restore_mode() {
        do_block_just_closed = flags.mode === 'DO_BLOCK';
        if (flag_store.length > 0) {
            flags = flag_store.pop();
        }
    }


    function in_array(what, arr) {
        for (var i = 0; i < arr.length; i += 1) {
            if (arr[i] === what) {
                return true;
            }
        }
        return false;
    }

    // Walk backwards from the colon to find a '?' (colon is part of a ternary op)
    // or a '{' (colon is part of a class literal).  Along the way, keep track of
    // the blocks and expressions we pass so we only trigger on those chars in our
    // own level, and keep track of the colons so we only trigger on the matching '?'.


    function is_ternary_op() {
        var level = 0,
            colon_count = 0;
        for (var i = output.length - 1; i >= 0; i--) {
            switch (output[i]) {
            case ':':
                if (level === 0) {
                    colon_count++;
                }
                break;
            case '?':
                if (level === 0) {
                    if (colon_count === 0) {
                        return true;
                    } else {
                        colon_count--;
                    }
                }
                break;
            case '{':
                if (level === 0) {
                    return false;
                }
                level--;
                break;
            case '(':
            case '[':
                level--;
                break;
            case ')':
            case ']':
            case '}':
                level++;
                break;
            }
        }
    }

    function get_next_token() {
        n_newlines = 0;

        if (parser_pos >= input_length) {
            return ['', 'TK_EOF'];
        }

        wanted_newline = false;

        var c = input.charAt(parser_pos);
        parser_pos += 1;


        var keep_whitespace = opt_keep_array_indentation && is_array(flags.mode);

        if (keep_whitespace) {

            //
            // slight mess to allow nice preservation of array indentation and reindent that correctly
            // first time when we get to the arrays:
            // var a = [
            // ....'something'
            // we make note of whitespace_count = 4 into flags.indentation_baseline
            // so we know that 4 whitespaces in original source match indent_level of reindented source
            //
            // and afterwards, when we get to
            //    'something,
            // .......'something else'
            // we know that this should be indented to indent_level + (7 - indentation_baseline) spaces
            //
            var whitespace_count = 0;

            while (in_array(c, whitespace)) {

                if (c === "\n") {
                    trim_output();
                    output.push("\n");
                    just_added_newline = true;
                    whitespace_count = 0;
                } else {
                    if (c === '\t') {
                        whitespace_count += 4;
                    } else if (c === '\r') {
                        // nothing
                    } else {
                        whitespace_count += 1;
                    }
                }

                if (parser_pos >= input_length) {
                    return ['', 'TK_EOF'];
                }

                c = input.charAt(parser_pos);
                parser_pos += 1;

            }
            if (flags.indentation_baseline === -1) {
                flags.indentation_baseline = whitespace_count;
            }

            if (just_added_newline) {
                var i;
                for (i = 0; i < flags.indentation_level + 1; i += 1) {
                    output.push(indent_string);
                }
                if (flags.indentation_baseline !== -1) {
                    for (i = 0; i < whitespace_count - flags.indentation_baseline; i++) {
                        output.push(' ');
                    }
                }
            }

        } else {
            while (in_array(c, whitespace)) {

                if (c === "\n") {
                    n_newlines += ( (opt_max_preserve_newlines) ? (n_newlines <= opt_max_preserve_newlines) ? 1: 0: 1 );
                }


                if (parser_pos >= input_length) {
                    return ['', 'TK_EOF'];
                }

                c = input.charAt(parser_pos);
                parser_pos += 1;

            }

            if (opt_preserve_newlines) {
                if (n_newlines > 1) {
                    for (i = 0; i < n_newlines; i += 1) {
                        print_newline(i === 0);
                        just_added_newline = true;
                    }
                }
            }
            wanted_newline = n_newlines > 0;
        }


        if (in_array(c, wordchar)) {
            if (parser_pos < input_length) {
                while (in_array(input.charAt(parser_pos), wordchar)) {
                    c += input.charAt(parser_pos);
                    parser_pos += 1;
                    if (parser_pos === input_length) {
                        break;
                    }
                }
            }

            // small and surprisingly unugly hack for 1E-10 representation
            if (parser_pos !== input_length && c.match(/^[0-9]+[Ee]$/) && (input.charAt(parser_pos) === '-' || input.charAt(parser_pos) === '+')) {

                var sign = input.charAt(parser_pos);
                parser_pos += 1;

                var t = get_next_token(parser_pos);
                c += sign + t[0];
                return [c, 'TK_WORD'];
            }

            if (c === 'in') { // hack for 'in' operator
                return [c, 'TK_OPERATOR'];
            }
            if (wanted_newline && last_type !== 'TK_OPERATOR' && !flags.if_line && (opt_preserve_newlines || last_text !== 'var')) {
                print_newline();
            }
            return [c, 'TK_WORD'];
        }

        if (c === '(' || c === '[') {
            return [c, 'TK_START_EXPR'];
        }

        if (c === ')' || c === ']') {
            return [c, 'TK_END_EXPR'];
        }

        if (c === '{') {
            return [c, 'TK_START_BLOCK'];
        }

        if (c === '}') {
            return [c, 'TK_END_BLOCK'];
        }

        if (c === ';') {
            return [c, 'TK_SEMICOLON'];
        }

        if (c === '/') {
            var comment = '';
            // peek for comment /* ... */
            var inline_comment = true;
            if (input.charAt(parser_pos) === '*') {
                parser_pos += 1;
                if (parser_pos < input_length) {
                    while (! (input.charAt(parser_pos) === '*' && input.charAt(parser_pos + 1) && input.charAt(parser_pos + 1) === '/') && parser_pos < input_length) {
                        c = input.charAt(parser_pos);
                        comment += c;
                        if (c === '\x0d' || c === '\x0a') {
                            inline_comment = false;
                        }
                        parser_pos += 1;
                        if (parser_pos >= input_length) {
                            break;
                        }
                    }
                }
                parser_pos += 2;
                if (inline_comment) {
                    return ['/*' + comment + '*/', 'TK_INLINE_COMMENT'];
                } else {
                    return ['/*' + comment + '*/', 'TK_BLOCK_COMMENT'];
                }
            }
            // peek for comment // ...
            if (input.charAt(parser_pos) === '/') {
                comment = c;
                while (input.charAt(parser_pos) !== '\r' && input.charAt(parser_pos) !== '\n') {
                    comment += input.charAt(parser_pos);
                    parser_pos += 1;
                    if (parser_pos >= input_length) {
                        break;
                    }
                }
                parser_pos += 1;
                if (wanted_newline) {
                    print_newline();
                }
                return [comment, 'TK_COMMENT'];
            }

        }

        if (c === "'" || // string
        c === '"' || // string
        (c === '/' &&
            ((last_type === 'TK_WORD' && in_array(last_text, ['return', 'do'])) ||
                (last_type === 'TK_COMMENT' || last_type === 'TK_START_EXPR' || last_type === 'TK_START_BLOCK' || last_type === 'TK_END_BLOCK' || last_type === 'TK_OPERATOR' || last_type === 'TK_EQUALS' || last_type === 'TK_EOF' || last_type === 'TK_SEMICOLON')))) { // regexp
            var sep = c;
            var esc = false;
            var resulting_string = c;

            if (parser_pos < input_length) {
                if (sep === '/') {
                    //
                    // handle regexp separately...
                    //
                    var in_char_class = false;
                    while (esc || in_char_class || input.charAt(parser_pos) !== sep) {
                        resulting_string += input.charAt(parser_pos);
                        if (!esc) {
                            esc = input.charAt(parser_pos) === '\\';
                            if (input.charAt(parser_pos) === '[') {
                                in_char_class = true;
                            } else if (input.charAt(parser_pos) === ']') {
                                in_char_class = false;
                            }
                        } else {
                            esc = false;
                        }
                        parser_pos += 1;
                        if (parser_pos >= input_length) {
                            // incomplete string/rexp when end-of-file reached.
                            // bail out with what had been received so far.
                            return [resulting_string, 'TK_STRING'];
                        }
                    }

                } else {
                    //
                    // and handle string also separately
                    //
                    while (esc || input.charAt(parser_pos) !== sep) {
                        resulting_string += input.charAt(parser_pos);
                        if (!esc) {
                            esc = input.charAt(parser_pos) === '\\';
                        } else {
                            esc = false;
                        }
                        parser_pos += 1;
                        if (parser_pos >= input_length) {
                            // incomplete string/rexp when end-of-file reached.
                            // bail out with what had been received so far.
                            return [resulting_string, 'TK_STRING'];
                        }
                    }
                }



            }

            parser_pos += 1;

            resulting_string += sep;

            if (sep === '/') {
                // regexps may have modifiers /regexp/MOD , so fetch those, too
                while (parser_pos < input_length && in_array(input.charAt(parser_pos), wordchar)) {
                    resulting_string += input.charAt(parser_pos);
                    parser_pos += 1;
                }
            }
            return [resulting_string, 'TK_STRING'];
        }

        if (c === '#') {


            if (output.length === 0 && input.charAt(parser_pos) === '!') {
                // shebang
                resulting_string = c;
                while (parser_pos < input_length && c != '\n') {
                    c = input.charAt(parser_pos);
                    resulting_string += c;
                    parser_pos += 1;
                }
                output.push(trim(resulting_string) + '\n');
                print_newline();
                return get_next_token();
            }



            // Spidermonkey-specific sharp variables for circular references
            // https://developer.mozilla.org/En/Sharp_variables_in_JavaScript
            // http://mxr.mozilla.org/mozilla-central/source/js/src/jsscan.cpp around line 1935
            var sharp = '#';
            if (parser_pos < input_length && in_array(input.charAt(parser_pos), digits)) {
                do {
                    c = input.charAt(parser_pos);
                    sharp += c;
                    parser_pos += 1;
                } while (parser_pos < input_length && c !== '#' && c !== '=');
                if (c === '#') {
                    //
                } else if (input.charAt(parser_pos) === '[' && input.charAt(parser_pos + 1) === ']') {
                    sharp += '[]';
                    parser_pos += 2;
                } else if (input.charAt(parser_pos) === '{' && input.charAt(parser_pos + 1) === '}') {
                    sharp += '{}';
                    parser_pos += 2;
                }
                return [sharp, 'TK_WORD'];
            }
        }

        if (c === '<' && input.substring(parser_pos - 1, parser_pos + 3) === '<!--') {
            parser_pos += 3;
            flags.in_html_comment = true;
            return ['<!--', 'TK_COMMENT'];
        }

        if (c === '-' && flags.in_html_comment && input.substring(parser_pos - 1, parser_pos + 2) === '-->') {
            flags.in_html_comment = false;
            parser_pos += 2;
            if (wanted_newline) {
                print_newline();
            }
            return ['-->', 'TK_COMMENT'];
        }

        if (in_array(c, punct)) {
            while (parser_pos < input_length && in_array(c + input.charAt(parser_pos), punct)) {
                c += input.charAt(parser_pos);
                parser_pos += 1;
                if (parser_pos >= input_length) {
                    break;
                }
            }

            if (c === '=') {
                return [c, 'TK_EQUALS'];
            } else {
                return [c, 'TK_OPERATOR'];
            }
        }

        return [c, 'TK_UNKNOWN'];
    }

    //----------------------------------
    indent_string = '';
    while (opt_indent_size > 0) {
        indent_string += opt_indent_char;
        opt_indent_size -= 1;
    }

    input = js_source_text;

    last_word = ''; // last 'TK_WORD' passed
    last_type = 'TK_START_EXPR'; // last token type
    last_text = ''; // last token text
    last_last_text = ''; // pre-last token text
    output = [];

    do_block_just_closed = false;

    whitespace = "\n\r\t ".split('');
    wordchar = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_$'.split('');
    digits = '0123456789'.split('');

    punct = '+ - * / % & ++ -- = += -= *= /= %= == === != !== > < >= <= >> << >>> >>>= >>= <<= && &= | || ! !! , : ? ^ ^= |= ::'.split(' ');

    // words which should always start on new line.
    line_starters = 'continue,try,throw,return,var,if,switch,case,default,for,while,break,function'.split(',');

    // states showing if we are currently in expression (i.e. "if" case) - 'EXPRESSION', or in usual block (like, procedure), 'BLOCK'.
    // some formatting depends on that.
    flag_store = [];
    set_mode('BLOCK');

    parser_pos = 0;
    while (true) {
        var t = get_next_token(parser_pos);
        token_text = t[0];
        token_type = t[1];
        if (token_type === 'TK_EOF') {
            break;
        }

        switch (token_type) {

        case 'TK_START_EXPR':

            if (token_text === '[') {

                if (last_type === 'TK_WORD' || last_text === ')') {
                    // this is array index specifier, break immediately
                    // a[x], fn()[x]
                    if (in_array(last_text, line_starters)) {
                        print_single_space();
                    }
                    set_mode('(EXPRESSION)');
                    print_token();
                    break;
                }

                if (flags.mode === '[EXPRESSION]' || flags.mode === '[INDENTED-EXPRESSION]') {
                    if (last_last_text === ']' && last_text === ',') {
                        // ], [ goes to new line
                        if (flags.mode === '[EXPRESSION]') {
                            flags.mode = '[INDENTED-EXPRESSION]';
                            if (!opt_keep_array_indentation) {
                                indent();
                            }
                        }
                        set_mode('[EXPRESSION]');
                        if (!opt_keep_array_indentation) {
                            print_newline();
                        }
                    } else if (last_text === '[') {
                        if (flags.mode === '[EXPRESSION]') {
                            flags.mode = '[INDENTED-EXPRESSION]';
                            if (!opt_keep_array_indentation) {
                                indent();
                            }
                        }
                        set_mode('[EXPRESSION]');

                        if (!opt_keep_array_indentation) {
                            print_newline();
                        }
                    } else {
                        set_mode('[EXPRESSION]');
                    }
                } else {
                    set_mode('[EXPRESSION]');
                }



            } else {
                set_mode('(EXPRESSION)');
            }

            if (last_text === ';' || last_type === 'TK_START_BLOCK') {
                print_newline();
            } else if (last_type === 'TK_END_EXPR' || last_type === 'TK_START_EXPR' || last_type === 'TK_END_BLOCK' || last_text === '.') {
                // do nothing on (( and )( and ][ and ]( and .(
            } else if (last_type !== 'TK_WORD' && last_type !== 'TK_OPERATOR') {
                print_single_space();
            } else if (last_word === 'function') {
                // function() vs function ()
                if (opt_space_after_anon_function) {
                    print_single_space();
                }
            } else if (in_array(last_text, line_starters) || last_text === 'catch') {
                print_single_space();
            }
            print_token();

            break;

        case 'TK_END_EXPR':
            if (token_text === ']') {
                if (opt_keep_array_indentation) {
                    if (last_text === '}') {
                        // trim_output();
                        // print_newline(true);
                        remove_indent();
                        print_token();
                        restore_mode();
                        break;
                    }
                } else {
                    if (flags.mode === '[INDENTED-EXPRESSION]') {
                        if (last_text === ']') {
                            restore_mode();
                            print_newline();
                            print_token();
                            break;
                        }
                    }
                }
            }
            restore_mode();
            print_token();
            break;

        case 'TK_START_BLOCK':

            if (last_word === 'do') {
                set_mode('DO_BLOCK');
            } else {
                set_mode('BLOCK');
            }
            if (opt_braces_on_own_line) {
                if (last_type !== 'TK_OPERATOR') {
                    if (last_text == 'return') {
                        print_single_space();
                    } else {
                        print_newline(true);
                    }
                }
                print_token();
                indent();
            } else {
                if (last_type !== 'TK_OPERATOR' && last_type !== 'TK_START_EXPR') {
                    if (last_type === 'TK_START_BLOCK') {
                        print_newline();
                    } else {
                        print_single_space();
                    }
                } else {
                    // if TK_OPERATOR or TK_START_EXPR
                    if (is_array(flags.previous_mode) && last_text === ',') {
                        if (last_last_text === '}') {
                            // }, { in array context
                            print_single_space();
                        } else {
                            print_newline(); // [a, b, c, {
                        }
                    }
                }
                indent();
                print_token();
            }

            break;

        case 'TK_END_BLOCK':
            restore_mode();
            if (opt_braces_on_own_line) {
                print_newline();
                print_token();
            } else {
                if (last_type === 'TK_START_BLOCK') {
                    // nothing
                    if (just_added_newline) {
                        remove_indent();
                    } else {
                        // {}
                        trim_output();
                    }
                } else {
                    if (is_array(flags.mode) && opt_keep_array_indentation) {
                        // we REALLY need a newline here, but newliner would skip that
                        opt_keep_array_indentation = false;
                        print_newline();
                        opt_keep_array_indentation = true;

                    } else {
                        print_newline();
                    }
                }
                print_token();
            }
            break;

        case 'TK_WORD':

            // no, it's not you. even I have problems understanding how this works
            // and what does what.
            if (do_block_just_closed) {
                // do {} ## while ()
                print_single_space();
                print_token();
                print_single_space();
                do_block_just_closed = false;
                break;
            }

            if (token_text === 'function') {
                if ((just_added_newline || last_text === ';') && last_text !== '{') {
                    // make sure there is a nice clean space of at least one blank line
                    // before a new function definition
                    n_newlines = just_added_newline ? n_newlines : 0;
                    if ( ! opt_preserve_newlines) {
                        n_newlines = 1;
                    }

                    for (var i = 0; i < 2 - n_newlines; i++) {
                        print_newline(false);
                    }
                }
            }

            if (token_text === 'case' || token_text === 'default') {
                if (last_text === ':') {
                    // switch cases following one another
                    remove_indent();
                } else {
                    // case statement starts in the same line where switch
                    flags.indentation_level--;
                    print_newline();
                    flags.indentation_level++;
                }
                print_token();
                flags.in_case = true;
                break;
            }

            prefix = 'NONE';

            if (last_type === 'TK_END_BLOCK') {
                if (!in_array(token_text.toLowerCase(), ['else', 'catch', 'finally'])) {
                    prefix = 'NEWLINE';
                } else {
                    if (opt_braces_on_own_line) {
                        prefix = 'NEWLINE';
                    } else {
                        prefix = 'SPACE';
                        print_single_space();
                    }
                }
            } else if (last_type === 'TK_SEMICOLON' && (flags.mode === 'BLOCK' || flags.mode === 'DO_BLOCK')) {
                prefix = 'NEWLINE';
            } else if (last_type === 'TK_SEMICOLON' && is_expression(flags.mode)) {
                prefix = 'SPACE';
            } else if (last_type === 'TK_STRING') {
                prefix = 'NEWLINE';
            } else if (last_type === 'TK_WORD') {
                prefix = 'SPACE';
            } else if (last_type === 'TK_START_BLOCK') {
                prefix = 'NEWLINE';
            } else if (last_type === 'TK_END_EXPR') {
                print_single_space();
                prefix = 'NEWLINE';
            }

            if (flags.if_line && last_type === 'TK_END_EXPR') {
                flags.if_line = false;
            }
            if (in_array(token_text.toLowerCase(), ['else', 'catch', 'finally'])) {
                if (last_type !== 'TK_END_BLOCK' || opt_braces_on_own_line) {
                    print_newline();
                } else {
                    trim_output(true);
                    print_single_space();
                }
            } else if (in_array(token_text, line_starters) || prefix === 'NEWLINE') {
                if ((last_type === 'TK_START_EXPR' || last_text === '=' || last_text === ',') && token_text === 'function') {
                    // no need to force newline on 'function': (function
                    // DONOTHING
                } else if (last_text === 'return' || last_text === 'throw') {
                    // no newline between 'return nnn'
                    print_single_space();
                } else if (last_type !== 'TK_END_EXPR') {
                    if ((last_type !== 'TK_START_EXPR' || token_text !== 'var') && last_text !== ':') {
                        // no need to force newline on 'var': for (var x = 0...)
                        if (token_text === 'if' && last_word === 'else' && last_text !== '{') {
                            // no newline for } else if {
                            print_single_space();
                        } else {
                            print_newline();
                        }
                    }
                } else {
                    if (in_array(token_text, line_starters) && last_text !== ')') {
                        print_newline();
                    }
                }
            } else if (is_array(flags.mode) && last_text === ',' && last_last_text === '}') {
                print_newline(); // }, in lists get a newline treatment
            } else if (prefix === 'SPACE') {
                print_single_space();
            }
            print_token();
            last_word = token_text;

            if (token_text === 'var') {
                flags.var_line = true;
                flags.var_line_reindented = false;
                flags.var_line_tainted = false;
            }

            if (token_text === 'if') {
                flags.if_line = true;
            }
            if (token_text === 'else') {
                flags.if_line = false;
            }

            break;

        case 'TK_SEMICOLON':

            print_token();
            flags.var_line = false;
            flags.var_line_reindented = false;
            break;

        case 'TK_STRING':

            if (last_type === 'TK_START_BLOCK' || last_type === 'TK_END_BLOCK' || last_type === 'TK_SEMICOLON') {
                print_newline();
            } else if (last_type === 'TK_WORD') {
                print_single_space();
            }
            print_token();
            break;

        case 'TK_EQUALS':
            if (flags.var_line) {
                // just got an '=' in a var-line, different formatting/line-breaking, etc will now be done
                flags.var_line_tainted = true;
            }
            print_single_space();
            print_token();
            print_single_space();
            break;

        case 'TK_OPERATOR':

            var space_before = true;
            var space_after = true;

            if (flags.var_line && token_text === ',' && (is_expression(flags.mode))) {
                // do not break on comma, for(var a = 1, b = 2)
                flags.var_line_tainted = false;
            }

            if (flags.var_line) {
                if (token_text === ',') {
                    if (flags.var_line_tainted) {
                        print_token();
                        flags.var_line_reindented = true;
                        flags.var_line_tainted = false;
                        print_newline();
                        break;
                    } else {
                        flags.var_line_tainted = false;
                    }
                // } else if (token_text === ':') {
                    // hmm, when does this happen? tests don't catch this
                    // flags.var_line = false;
                }
            }

            if (last_text === 'return' || last_text === 'throw') {
                // "return" had a special handling in TK_WORD. Now we need to return the favor
                print_single_space();
                print_token();
                break;
            }

            if (token_text === ':' && flags.in_case) {
                print_token(); // colon really asks for separate treatment
                print_newline();
                flags.in_case = false;
                break;
            }

            if (token_text === '::') {
                // no spaces around exotic namespacing syntax operator
                print_token();
                break;
            }

            if (token_text === ',') {
                if (flags.var_line) {
                    if (flags.var_line_tainted) {
                        print_token();
                        print_newline();
                        flags.var_line_tainted = false;
                    } else {
                        print_token();
                        print_single_space();
                    }
                } else if (last_type === 'TK_END_BLOCK' && flags.mode !== "(EXPRESSION)") {
                    print_token();
                    if (flags.mode === 'OBJECT' && last_text === '}') {
                        print_newline();
                    } else {
                        print_single_space();
                    }
                } else {
                    if (flags.mode === 'OBJECT') {
                        print_token();
                        print_newline();
                    } else {
                        // EXPR or DO_BLOCK
                        print_token();
                        print_single_space();
                    }
                }
                break;
            // } else if (in_array(token_text, ['--', '++', '!']) || (in_array(token_text, ['-', '+']) && (in_array(last_type, ['TK_START_BLOCK', 'TK_START_EXPR', 'TK_EQUALS']) || in_array(last_text, line_starters) || in_array(last_text, ['==', '!=', '+=', '-=', '*=', '/=', '+', '-'])))) {
            } else if (in_array(token_text, ['--', '++', '!']) || (in_array(token_text, ['-', '+']) && (in_array(last_type, ['TK_START_BLOCK', 'TK_START_EXPR', 'TK_EQUALS', 'TK_OPERATOR']) || in_array(last_text, line_starters)))) {
                // unary operators (and binary +/- pretending to be unary) special cases

                space_before = false;
                space_after = false;

                if (last_text === ';' && is_expression(flags.mode)) {
                    // for (;; ++i)
                    //        ^^^
                    space_before = true;
                }
                if (last_type === 'TK_WORD' && in_array(last_text, line_starters)) {
                    space_before = true;
                }

                if (flags.mode === 'BLOCK' && (last_text === '{' || last_text === ';')) {
                    // { foo; --i }
                    // foo(); --bar;
                    print_newline();
                }
            } else if (token_text === '.') {
                // decimal digits or object.property
                space_before = false;

            } else if (token_text === ':') {
                if (!is_ternary_op()) {
                    flags.mode = 'OBJECT';
                    space_before = false;
                }
            }
            if (space_before) {
                print_single_space();
            }

            print_token();

            if (space_after) {
                print_single_space();
            }

            if (token_text === '!') {
                // flags.eat_next_space = true;
            }

            break;

        case 'TK_BLOCK_COMMENT':

            var lines = token_text.split(/\x0a|\x0d\x0a/);

            if (/^\/\*\*/.test(token_text)) {
                // javadoc: reformat and reindent
                print_newline();
                output.push(lines[0]);
                for (i = 1; i < lines.length; i++) {
                    print_newline();
                    output.push(' ');
                    output.push(trim(lines[i]));
                }

            } else {

                // simple block comment: leave intact
                if (lines.length > 1) {
                    // multiline comment block starts with a new line
                    print_newline();
                    trim_output();
                } else {
                    // single-line /* comment */ stays where it is
                    print_single_space();

                }

                for (i = 0; i < lines.length; i++) {
                    output.push(lines[i]);
                    output.push('\n');
                }

            }
            print_newline();
            break;

        case 'TK_INLINE_COMMENT':

            print_single_space();
            print_token();
            if (is_expression(flags.mode)) {
                print_single_space();
            } else {
                print_newline();
            }
            break;

        case 'TK_COMMENT':

            // print_newline();
            if (wanted_newline) {
                print_newline();
            } else {
                print_single_space();
            }
            print_token();
            print_newline();
            break;

        case 'TK_UNKNOWN':
            if (last_text === 'return' || last_text === 'throw') {
                print_single_space();
            }
            print_token();
            break;
        }

        last_last_text = last_text;
        last_type = token_type;
        last_text = token_text;
    }

    return output.join('').replace(/[\n ]+$/, '');

}

// Add support for ComdmonJS. Just put this file somewhere on your require.paths
// and you will be able to `var js_beautify = require("beautify").js_beautify`.
if (typeof exports !== "undefined")
    exports.js_beautify = js_beautify;


module.exports = js_beautify;

},{}],27:[function(require,module,exports){
var Utils = require('./utils'),
  config = require('./config');
  
var UndoManager = function(){
  this.stack = [];


};

UndoManager.prototype.start = function(){
  // this.timer = setInterval(this.pushSnapshot.bind(this), UNDO_CHECK_INTERVAL);
  Blockly.mainWorkspace.getCanvas().addEventListener('blocklyWorkspaceChange', this.pushSnapshot.bind(this));

};

UndoManager.prototype.stop = function(){
  Blockly.mainWorkspace.getCanvas().removeEventListener('blocklyWorkspaceChange', this.pushSnapshot.bind(this));
  // clearInterval(this.timer);
}

UndoManager.prototype.pushSnapshot = function(){
  if(this.stack.length >= config.undo_max_size)
    return;

  var curXml = Utils.xml();

  if(this.stack.length == 0 || curXml != this.stack[this.stack.length-1]){
    console.log('snapshot pushed');
    // console.log('cur: '+curXml+' , was:'+this.stack[this.stack.length-1]);
    this.stack.push(curXml);
    this.stack.slice(0, config.undo_max_size);
  }else{
    // console.log('no snapshot pushed - equal');
  }



};

UndoManager.prototype.undo = function(){
  if(this.stack.length < 2)
    return;

  this.stop();
  this.stack.pop(); // pop current
  var dom = Blockly.Xml.textToDom(this.stack.pop())
  Blockly.mainWorkspace.clear();
  Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, dom);

  this.start();


};



module.exports = UndoManager;

},{"./config":15,"./utils":28}],28:[function(require,module,exports){
(function (global){
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null),
  R = (typeof window !== "undefined" ? window.R : typeof global !== "undefined" ? global.R : null),
  $ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null),
  js_beautify = require('./tools/beautify'),
  vkbeautify = (typeof window !== "undefined" ? window.vkbeautify : typeof global !== "undefined" ? global.vkbeautify : null),
  Blockly = (typeof window !== "undefined" ? window.Blockly : typeof global !== "undefined" ? global.Blockly : null);

R.mapProp = R.compose( R.map, R.prop );

var _uuid = (function() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
               .toString(16)
               .substring(1);
  }
  return function() {
      return [s4() + s4(),
        s4(),
        s4(),
        s4(),
        s4() + s4() + s4()].join("");
  };
})();


_js = function(prettify){
  var js = Blockly.JavaScript.workspaceToCode();
  if(prettify) js = js_beautify(js);
  return js;
};

_xml = function(prettify){
  var dom = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
  var xml = Blockly.Xml.domToText(dom);
  if(prettify) xml = vkbeautify.xml(xml);
  return xml;
};


var reload_udf_blocks = function(items){


  var $cat = $('category[name=Utils]');

  // $('category[name=Utils] block').remove();
  _.each(items, function(item){
    var parser = new DOMParser();
    var xml = parser.parseFromString(item.xml, "text/xml");

    $(xml).find('block[type=procedures_defreturn],block[type=procedures_defnoreturn]').each(function(b){
      var fname = $(this).find('> field[name]').text();
      var args = $(this).find('mutation arg').map(function(e){ return $(this).attr('name'); }).toArray();
      Blockly.register_function_block(fname, args, $(this).attr('type') == 'procedures_defreturn');

      
      $cat.find('block[type=udf_' + fname + ']').remove();
      $cat.append('<block type="udf_'+fname+'"></block>');


    });
    Blockly.updateToolbox($('#toolbox').get(0));

  });
  console.log('udf reloaded');

};


module.exports = {
  reload_udf_blocks: reload_udf_blocks,
  xml: _xml,
  js: _js,
  uuid: _uuid

};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./tools/beautify":26}]},{},[1]);
