var _ = require('lodash');
var Promise = require('bluebird');
var Utils = require('./utils');
var util = require('util');
var R = require('ramda');
var async = require('async');
var request = require('request');
var requestP = Promise.promisify(request);
var path = require('path');
var URL = require('url');
var ServiceStore = require('./service_store');

R.mapProp = R.compose(R.map, R.prop);


var load_types = function(types_to_load, load_types_callback){
  async.map(types_to_load, _.bind($engine.getMessageDetails, $engine), function(e, types){
    var z = _.zipObject(types_to_load, types)
    var types = _.mapValues(z, function(mv, k){
      return _.mapValues(_.groupBy(mv, 'type'), function(x){ return x[0]; });
    });
    load_types_callback(types);
  });

};



module.exports = function(app, db){

  app.get('/', function(req, res){
    res.render('index', {msg_database: process.env.MSG_DATABASE});
  });
  app.get('/ping', function(req, res){
    res.send('pong')
  });


  app.get('/api/load_interactions', function(req, res){

    var apiPath = URL.resolve(process.env.MSG_DATABASE, "api/interaction_interfaces");

    requestP(apiPath, {json: true}).spread(function(res0, data){

      var types_to_load = R.compose( R.mapProp('type'), R.flatten,  R.mapProp('interface'))(data);
      load_types(types_to_load, function(types){
        res.send({data: data, types: types});
      });

    });
  });

  app.post('/api/load_rapp', function(req, res){


    var apiPath = URL.resolve(process.env.MSG_DATABASE, "api/interfaces");
    console.log(apiPath);

    request.get(apiPath, function(e, res0, body){
      var data = JSON.parse(body)

      var ifs = R.pipe(
          R.map(R.prop('rocon_apps')),
          R.map(R.mapObj(R.prop('interfaces'))),
          R.map(R.values),
          R.flatten
        )(data);


      console.log(util.inspect(ifs, false, 10, true));
      console.log(ifs);


      types_to_load = _.map(ifs, function(interface){
        return _.map(interface, function(v, k){
          return _.pluck(v, 'type');

        });

      });
      console.log(types_to_load);

      types_to_load = _.compact(_.flatten(types_to_load));
      load_types(types_to_load, function(types){
        res.send({rapps: data, types: types});
      });


      
      
      // res.send({interfaces: data, types: _.flatten(types_to_load)});
    });

  });


  app.post('/api/publish', function(req, res){
    var topic = req.body.topic;
    $engine.pub(topic);
    res.send({result: true})
  });

  app.post('/api/param/:key', function(req, res){
    var col = db.collection('settings');
    var k = req.params.key;
    col.update({key: k}, {$set: {value: req.body}}, {w: 1, upsert: true}, function(err, doc){
      res.send({result: true})
    });

  });
  app.get('/api/param/:key', function(req, res){
    var k = req.params.key;
    var col = db.collection('settings');
    col.findOne({key: k}, function(err, doc){
      if(!doc){
        res.send([]);
      }else{
        res.send(doc.value);
      }

    });
  });


  app.post('/api/engine/reset', function(req, res){
    $engine.clear()
    res.send({result: true});


  });
  app.post('/api/engine/load', function(req, res){

    var items = req.body.blocks;
    $engine.runBlocksById(items)
    res.send({result: true});
  });
  app.post('/api/eval', function(req, res){
    var code = req.body.code;
    $engine.runCode(code);
    res.send({result: true});


  });


  app.get('/api/packages', function(req, res){
    var ss = new ServiceStore({ros_root: process.env.ROS_PACKAGE_ROOT});
    ss.allPackageInfos().then(function(rows){
      res.send(rows);

    });

  });

  app.post('/api/services/save', function(req, res){
    var ss = new ServiceStore({ros_root: process.env.ROS_PACKAGE_ROOT});
    ss.exportToROS('package_name', req.body.service, req.body.package).then(function(){
      res.send('ok');
    });



  });

  app.get('/monitoring', function(req, res){
    res.render('monitoring');

  });

};
