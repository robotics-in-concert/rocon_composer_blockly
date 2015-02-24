var _ = require('lodash');
var Blockly = require('blockly');

Blockly.Blocks['engine_global_set'] = {
  init: function() {
    this.setColour(260);
    this.appendDummyInput()
      .appendField('Engine global set')
    this.appendDummyInput().appendField(new Blockly.FieldTextInput('key', null), 'CHANNEL')
    this.appendValueInput('VALUE')
      .appendField('value : ');

    this.setInputsInline(true);
    this.setOutput(false);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
  }
};

Blockly.Blocks['engine_global_get'] = {
  init: function() {
    this.setColour(260);
    this.appendDummyInput()
      .appendField('Engine global get')
    this.appendDummyInput().appendField(new Blockly.FieldTextInput('key', null), 'CHANNEL')

    this.setInputsInline(true);
    this.setOutput(true);
    this.setPreviousStatement(false);
    this.setNextStatement(false);
  }
};


Blockly.JavaScript['engine_global_set'] = function(block){
  var key = block.getFieldValue('CHANNEL');
  var value = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_NONE) || "null";
  var code = _.template('$engine.globalSet("<%= key %>", <%= value %>)')({key: key, value: value});
  return code;

};


Blockly.JavaScript['engine_global_get'] = function(block){
  var key = block.getFieldValue('CHANNEL');
  var code = _.template('$engine.globalGet("<%= key %>")')({key: key});
  return [code, Blockly.JavaScript.ORDER_ATOMIC];

};
