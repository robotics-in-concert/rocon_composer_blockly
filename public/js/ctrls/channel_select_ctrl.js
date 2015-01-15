
angular.module('centoAuthoring').controller('SelectChannelCtrl', SelectChannelCtrl);
                                            
                                            
                                            
SelectChannelCtrl.$inject = ['$scope', 'blocksStore', '$http', '$modalInstance'];                                            

function SelectChannelCtrl($scope, blocksStore, $http, $mi) {
  console.log('x');


  var ctrl = this;
  this.blockConfigs = {};
  this.currentBlockConfig = '';
  this.channels = [];
  this.SelectChannel = null;


  var socket = window.socket;
  socket.emit('blockly:channels', function(chs){
    $scope.$apply(function(){
      ctrl.channels = chs;

    });

  });




  ctrl.join = function(){
    var n = ctrl.selectedChannel;
    $mi.close($scope.selectedChannel);

  };


  


};
