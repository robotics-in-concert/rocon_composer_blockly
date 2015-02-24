var _ = require('lodash')
  , Promise = require('bluebird')
  , Utils = require('./utils')
  , util = require('util')
  , async = require('async')
  , request = require('request')
  , requestP = Promise.promisify(request)
  , path = require('path')
  , URL = require('url')
  , JSONSelect = require('JSONSelect')
  , Settings = require('./model').Settings
  , ServiceStore = require('./service_store');

var _getMessageDetails = function(type, cb){
  var url = URL.resolve(process.env.MSG_DATABASE, "/api/message_details");
  request(url, {qs: {type: type}, json: true}, function(e, res, body){
    cb(null, body);
  });
};



var load_types = function(types_to_load, load_types_callback){
  async.map(types_to_load, _getMessageDetails, function(e, types){
    var z = _.zipObject(types_to_load, types)
    var types = _.mapValues(z, function(mv, k){
      return _.mapValues(_.groupBy(mv, 'type'), function(x){ return x[0]; });
    });
    load_types_callback(types);
  });

};



module.exports = function(app, db){

  var _getItems = function(cb){
    var col = db.collection('settings');
    col.findOne({key: 'cento_authoring_items'}, function(e, data){
      var items = data ? data.value.data : [];
      cb(e, items);
    });

  };

  app.get('/', function(req, res){
    res.render('index', {msg_database: process.env.MSG_DATABASE});
  });
  app.get('/prezi', function(req, res){
    res.render('prezi', {socketio_port: $socketio_port});
  });
  app.get('/engine', function(req, res){
    res.render('engine');
  });
  app.get('/ping', function(req, res){
    res.send('pong')
  });

  app.get('/api/load_interactions', function(req, res){
    if(!process.env.MSG_DATABASE){
      res.send('no rocon protocols web', 500);
      return
    }


    var apiPath = URL.resolve(process.env.MSG_DATABASE, "api/hic_app");

    requestP(apiPath, {json: true}).spread(function(res0, data){
      var types_to_load = _.unique(JSONSelect.match('.interface .type', data))
      load_types(types_to_load, function(types){
        res.send({data: data, types: types});
      });

    });
  });


  app.post('/api/engine/start', function(req, res){

    var payload = req.body;

    var pid = engineManager.startEngine();
    if(payload && payload.items && payload.items.length){
      engineManager.run(pid, payload.items);
    }
    res.send({status: 'ok', pid: pid});
  });
  app.post('/api/engine/stop', function(req, res){

    var payload = req.body;
    engineManager.killEngine(payload.pid);
    res.send({status: 'ok'});
  });


  app.post('/api/load_rapp', function(req, res){
    if(!process.env.MSG_DATABASE){
      res.send('no rocon protocols web', 500);
      return;
    }


    var apiPath = URL.resolve(process.env.MSG_DATABASE, "api/rocon_app");

    request.get(apiPath, function(e, res0, body){
      if(e){
        res.status(500).send('cannot load msg_database');
        return;
      }
      var data = JSON.parse(body)
      var ifs =  JSONSelect.match('.public_interface', data);
      var types_to_load =  _.unique(JSONSelect.match('.public_interface .type', data));

      load_types(types_to_load, function(types){
        res.send({rapps: data, types: types});
      });
    });

  });


  app.post('/api/publish', function(req, res){
    var topic = req.body.topic;

    global.engineProcess.send({action: 'publish', data: topic});
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

    global.restartEngine();
    // $engine.clear()
    res.send({result: true});


  });
  app.post('/api/engine/load', function(req, res){

    var itemIds = req.body.blocks;

    Settings.findOne({key: 'cento_authoring_items'}, function(e, row){
      var items = row.value.data;
      var items_to_load = _.filter(items, function(i){
        return _.contains(itemIds, i.id);
      });

      var titles = _.map(items_to_load, 'title');
      var pid = engineManager.startEngine();
      engineManager.run(pid, titles);

      res.send({result: true});
    });


  });

  app.get('/api/packages', function(req, res){
    var ss = new ServiceStore({ros_root: process.env.ROS_PACKAGE_ROOT});
    ss.allPackageInfos().then(function(rows){
      res.send(rows);

    });

  });

  app.post('/api/services/save', function(req, res){
    var col = db.collection('settings');
    col.findOne({key: ROCON_AUTHORING_ITEMS_KEY}, function(err, doc){

      var items = [];
      if(doc){
        items = doc.value.data;
      }

      var ss = new ServiceStore({ros_root: process.env.ROS_PACKAGE_ROOT, workflow_items: items});
      ss.exportToROS('package_name', req.body.service, req.body.package).then(function(){
        res.send('ok');
      });
    });



  });

};
