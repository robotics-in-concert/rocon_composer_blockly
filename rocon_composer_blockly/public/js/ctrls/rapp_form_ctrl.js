var $ = require('jquery'),
  Utils = require('../utils'),
  PackageSelectCtrl = require('./modal/package_select_ctrl');

module.exports = function($scope, blocksStore, $http, serviceAuthoring, $stateParams, $state, $modal) {
  console.log('x');
  $scope.current = {interfaces: {
    'subscribers':[],
    'publishers':[],
    'services':[],
    'action_clients':[],
    'action_servers':[]
  },
  parameters: []
  };

 $scope.addItem = function(lst, item){
   console.log(lst);
   lst.push(item);
 }
 $scope.deleteItem = function(lst, item){
   console.log(lst, item);

   _.pull(lst, item);
 }

 $scope.export = function(){
   var mi = $modal.open({
     templateUrl: '/js/tpl/modal/package_select.html',
     controller: PackageSelectCtrl,
     controllerAs: 'ctrl',
     resolve: {
       packages: function(){ return serviceAuthoring.getPackages(); },
       defaults: function(){ return {
         title: $scope.current.name,
         description: $scope.current.description
       }; }
     }

   });

   mi.result.then(function(selected){
     var pack = selected.package;
     var v = _.clone($scope.current);
     selected.rapp = v;



     $http.post('/api/rapp/save', selected).then(function(res){
       console.log('rapp saved');

     });

   });

 };

};
