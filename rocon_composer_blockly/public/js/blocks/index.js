var _ = require('lodash');
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
