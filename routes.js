_ = require('lodash');
Utils = require('./utils');
util = require('util');
R = require('ramda');
async = require('async');
request = require('request');
path = require('path');
URL = require('url');





module.exports = function(app, db){

  app.get('/', function(req, res){
    res.render('index', {msg_database: process.env.MSG_DATABASE});
  });
  app.get('/ping', function(req, res){
    res.send('pong')
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
      async.map(types_to_load, _.bind($engine.getMessageDetails, $engine), function(e, types){
        var z = _.zipObject(types_to_load, types)
        var types = _.mapValues(z, function(mv, k){
          return _.mapValues(_.groupBy(mv, 'type'), function(x){ return x[0]; });
        });
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

    $engine.runBlocks(items)
    res.send({result: true});
  });
  app.post('/api/eval', function(req, res){
    var code = req.body.code;
    $engine.runCode(code);
    res.send({result: true});


  });

};
