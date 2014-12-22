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
