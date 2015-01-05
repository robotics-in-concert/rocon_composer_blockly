var variable_definitions = [];



Blockly.JavaScript['variables_set'] = function(block) {
  // Variable setter.
  var argument0 = Blockly.JavaScript.valueToCode(block, 'VALUE',
      Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
  var varName = Blockly.JavaScript.variableDB_.getName(
      block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);

  if(R.contains(varName, variable_definitions)){
    return '' + varName + ' = ' + argument0 + ';\n';

  }else{
    variable_definitions.push(varName);
    return 'var ' + varName + ' = ' + argument0 + ';\n';


  }
};


var _js_init = Blockly.JavaScript.init;

Blockly.JavaScript.init = function() {
  variable_definitions = [];
  // Create a dictionary of definitions to be printed before the code.
  Blockly.JavaScript.definitions_ = Object.create(null);
  // Create a dictionary mapping desired function names in definitions_
  // to actual function names (to avoid collisions with user functions).
  Blockly.JavaScript.functionNames_ = Object.create(null);

  if (Blockly.Variables) {
    if (!Blockly.JavaScript.variableDB_) {
      Blockly.JavaScript.variableDB_ =
          new Blockly.Names(Blockly.JavaScript.RESERVED_WORDS_);
    } else {
      Blockly.JavaScript.variableDB_.reset();
    }

    var defvars = [];
    var variables = Blockly.Variables.allVariables();
    for (var x = 0; x < variables.length; x++) {
      defvars[x] = 'xxvar ' +
          Blockly.JavaScript.variableDB_.getName(variables[x],
          Blockly.Variables.NAME_TYPE) + ';';
    }
    // Blockly.JavaScript.definitions_['variables'] = defvars.join('\n');
  }
};


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
          $('#block-config-modal').modal();
        }});
        return opts;

      };
    }


    b.mutationToDom = function() {
      var re = null;
      var container = re = document.createElement('mutation');
      ['extra_config', 'extra'].forEach(function(attr){
        if(this[attr]){
          container.setAttribute(attr, JSON.stringify(this[attr]));
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

