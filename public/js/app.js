ITEMS_PARAM_KEY = 'cento_authoring_items';
SERVICES_PARAM_KEY = 'cento_authoring_services';

JSONEditor.defaults.options.theme = 'bootstrap3';
$.fn.editable.defaults.mode = 'inline';
$.fn.editableform.buttons = '<button type="submit" class="btn btn-primary btn-sm editable-submit"><i class="fa fa-check"></i></button><button type="button" class="btn btn-default btn-sm editable-cancel"><i class="fa fa-remove"></i></button>'

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
  $code.text(_js(true));
  $code.attr('class', 'javascript');
  hljs.highlightBlock($('.code-modal code').get(0));
  jQuery('.code-modal').modal({});

});
Mousetrap.bind('ctrl+alt+l', function() { 
  $('.code-modal .modal-title').text('XML');

  var $code = $('.code-modal code');
  $code.text(_xml(true));
  $code.attr('class', 'xml');
  hljs.highlightBlock($('.code-modal code').get(0));
  jQuery('.code-modal').modal({});

});



var app = angular.module('centoAuthoring', ['ui.router', 'ui.bootstrap', 'ui.select2']);


app.config(function($stateProvider, $interpolateProvider) {
  $interpolateProvider.startSymbol('[[');
  $interpolateProvider.endSymbol(']]');


  $stateProvider
    .state('services_index', {
      url: '/services_index',
      templateUrl: '/js/tpl/services_index.html'
    })
    .state('services', {
      url: '/services?new_name',
      templateUrl: '/js/tpl/services.html'
    })
    .state('services_edit', {
      url: '/services/:service_id',
      templateUrl: '/js/tpl/services.html'
    })
    .state('workflow_index', {
      url: '',
      templateUrl: '/js/tpl/workflow_index.html'

    })
    .state('workflow_edit', {
      url: '/blockly/:id',
      templateUrl: '/js/tpl/blockly.html'

    })
    .state('workflow_blockly', {
      url: '/blockly?new_name',
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











// Socket.io
window.socket = io.connect();



// blockly
var blockly_remove_scrollbar = function(){
  var ws = Blockly.mainWorkspace;
  var s = ws.scrollbar;
  if(!s){
    return;
  }
  $(s.corner_).remove();

  s.vScroll.dispose();
  s.hScroll.dispose();

  ws.scrollbar = null;

};
var blockly_add_scrollbar = function(){
  var ws = Blockly.mainWorkspace;
  ws.scrollbar = new Blockly.ScrollbarPair(ws);
  Blockly.fireUiEvent(window, 'resize');

};
