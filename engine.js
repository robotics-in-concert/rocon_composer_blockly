var _ = require('lodash'),
  R = require('ramda'),
  Promise = require('bluebird'),
  EventEmitter = require('events').EventEmitter,
  colors = require('colors'),
  bodyParser = require('body-parser'),
  express = require('express'),
  ROSLIB = require('roslib'),
  Fiber = require('fibers')
  Future = require('fibers/future'),
  wait = Future.wait,
  Utils = require('./utils'),
  util = require('util'),
  request = require('request'),
  Requester = require('./requester').Requester,
  Resource = require('./requester').Resource,
  UUID = require('node-uuid'),
  URL = require('url');


DEBUG = process.env.DEBUG || false



/*
 * Engine class
 */

var Engine = function(db){
  this.db = db;
  this.ee = new EventEmitter();
  this.memory = {};
  var ros = this.ros = new ROSLIB.Ros({encoding: 'utf8'});
  var engine = this;
  this.topics = [];
  var that = this;
  this.schedule_requests = {};


  setInterval(function(){
    engine.emit('engine:tick', new Date().getTime());

  }, 3000);

  var retry_op = Utils.retry(function(){
    engine.log('trying to connect to ros ' + process.env.ROCON_AUTHORING_ROSBRIDGE_URL);
    var connected = false;

    var ros = that.ros = new ROSLIB.Ros({encoding: 'utf8'});

    ros.on('error', function(e){
      engine.log('ros error', e);
      if(!connected){
        retry_op.retry();
      }
    });
    ros.on('connection', function(){
      engine.log('ros connected');
      engine.emit('started');
      connected = true;
      // ros.getMessageDetails('simple_delivery_msgs/DeliveryStatus', function(detail){
        // console.log('detail', detail);
      // });
      // ros.getMessageDetails('simple_delivery_msgs/DeliveryOrder', function(detail){
        // console.log('detail', detail);
      // });
      // ros.getTopics(function(topics){
        // console.log('topics : ', topics);
      // });
      // ros.getServices(function(topics){
        // // console.log('services : ', topics);
      // });

    });
    ros.on('close', function(){
      engine.log('ros closed');
      // retry_op.retry();
    });
    ros.connect(process.env.ROCON_AUTHORING_ROSBRIDGE_URL);

  }, 0, 1000);

  _.defer(function(){
    // engine.emit('started');

  });

};
util.inherits(Engine, EventEmitter);


Engine.prototype.getMessageDetails = function(type, cb){
  var engine = this;
  var url = URL.resolve(process.env.MSG_DATABASE, "/api/message_details");
  request(url, {qs: {type: type}, json: true}, function(e, res, body){
    engine.log("BODY", body, typeof body);

    
    cb(null, body);

  });
};

Engine.prototype.unsubscribe = function(topic){
  var t = _.remove(this.topics, {name: topic});
  t = t[0];
  t.listener.unsubscribe();
};
Engine.prototype.unsubscribeAll = function(){
  var engine = this;
  this.topics.forEach(function(t){
    t.listener.unsubscribe();
    engine.log("topic "+t.name+" unsubscribed");

  });
  this.topics = [];
};

Engine.prototype.subscribe = function(topic, type){
  var engine = this;
  var listener = new ROSLIB.Topic({
    ros : this.ros,
    name : topic,
    messageType : type
  });

  listener.subscribe(function(message) {
    engine.debug('Received message on ' + listener.name + ': ' + message);
    engine.ee.emit(listener.name, message);

  });

  this.topics.push({name: topic, listener: listener});

};


Engine.prototype.pub = function(topic, type, msg){

  var topic = new ROSLIB.Topic({
    ros : this.ros,
    name : topic,
    messageType : type
  });

  var msg = new ROSLIB.Message(msg);


  // And finally, publish.
  topic.publish(msg);


  return topic;


};



Engine.prototype.sleep = function(ms){
  var _sleep = function(ms){
    var future = new Future;
    setTimeout(function(){
      future.return();
    }, ms);
    return future;
  };

  _sleep(ms).wait();

};
Engine.prototype.runService = function(name, type, request){
  var e = this;

  var _runService = function(name, type, request){
    var future = new Future;

    var service = new ROSLIB.Service({
     ros : e.ros,
     name : name,
     servicetype : type
    });


    var request = new ROSLIB.ServiceRequest(request);

    service.callService(request, function(result){
      future.return(result);
    });
    return future;

  };
  return _runService(name, type, request).wait();
};

Engine.prototype.runCode = function(code){
  code = ["Fiber(function(){", code , "}).run();"].join("\n");
  code = Utils.js_beautify(code);
  this.debug("---------------- scripts -----------------");
  this.debug(_.map(code.split(/\n/), function(line){ return line; }).join("\n"));
  this.debug("------------------------------------------");
  try{
    eval(code);
    this.log("scripts evaluated.");
  }catch(e){
    this.log('invalid block scripts. failed. - ' + e.toString());
  }


};

Engine.prototype._waitForTopicsReady = function(required_topics){
  var engine = this;
  return new Promise(function(resolve, reject){

    var timer = setInterval(function(){
      engine.ros.getTopics(function(topics){

        
        var remapped_topics = R.filter(function(t){ return R.contains(t, required_topics); })(topics);
        console.log('topic count check : ', [remapped_topics.length, required_topics.length].join("/"), remapped_topics, required_topics);

        if(remapped_topics.length >= required_topics.length){
          clearInterval(timer);
          resolve();
        }
      });
    }, 1000);


  });

};
Engine.prototype._waitForTopicsReadyF = function(required_topics){
  var engine = this;



  var future = new Future();

  var timer = setInterval(function(){
    engine.ros.getTopics(function(topics){
      
      var remapped_topics = R.filter(function(t){ return R.contains(t, required_topics); })(topics);
      console.log('topic count check : ', [remapped_topics.length, required_topics.length].join("/"), remapped_topics, required_topics);

      if(remapped_topics.length >= required_topics.length){
        clearInterval(timer);
        future.return();
      }
    });
  }, 1000);



  return future.wait();

};

Engine.prototype.allocateResource = function(rapp, uri, remappings, parameters){
  var engine = this;
  
  var r = new Requester(this);

  R.forEach(function(remap){
    if(R.isEmpty(remap.remap_to)){
      remap.remap_to = "/" + remap.remap_from + "_" + UUID.v4().replace(/-/g, "")
    }

  })(remappings);

  var res = new Resource();
  res.rapp = rapp;
  res.uri = uri;
  res.remappings = remappings;
  res.parameters = parameters;

  var future = new Future();
  r.send_allocation_request(res).then(function(reqId){
    engine.schedule_requests[reqId] = r;
    future.return({req_id: reqId, remappings: remappings, parameters: parameters, rapp: rapp, uri: uri});
  });

  
  return future.wait();
};

Engine.prototype.releaseResource = function(ctx){
  var requester = this.schedule_requests[ctx.req_id];
  requester.cancel_all();

};

Engine.prototype._scheduled = function(rapp, uri, remappings, parameters, topics_count, name, callback){
  var engine = this;
  
  var r = new Requester(this);

  this.ros.getTopics(function(topics){
    console.log("topics : ", topics);

    var res = new Resource();
    res.rapp = rapp;
    res.uri = uri;
    res.remappings = remappings;

    console.log("remapping ", res.remappings);

    res.parameters = parameters;

    r.send_allocation_request(res).then(function(reqId){

      var topics_ready = new Promise(function(resolve, reject){

        var timer = setInterval(function(){
          engine.ros.getTopics(function(topics){

            
            var remapped_topics = R.filter(R.match("^"+name))(topics);
            console.log('topic count check : ', remapped_topics.length);

            if(remapped_topics.length >= topics_count){
              clearInterval(timer);
              resolve();
            }
          });
        }, 1000);


      });


      topics_ready.then(function(){
        callback(r);
      });
    });
  });


};

Engine.prototype.runScheduledAction = function(ctx, name, type, goal, onResult, onFeedback){

  var remapping_kv = R.compose(
    R.fromPairs,
    R.map(R.values)
  )(ctx.remappings);
  var name = remapping_kv[name];
  var engine = this;

  var required_topics = R.map(R.concat(name+"/"))(["feedback", "result", "status"]);
  console.log('action : ', ctx, required_topics, name);


  engine._waitForTopicsReadyF(required_topics);
  engine.runAction(name, type, goal, 
    function(items){ onResult(items); }, 
    function(items){ onFeedback(items) });

  

};

Engine.prototype.scheduledSubscribe = function(ctx, topic, type, callback){
  var engine = this;
  var remapping_kv = R.compose(
    R.fromPairs,
    R.map(R.values)
  )(ctx.remappings);
  var name = remapping_kv[name];

  // engine._waitForTopicsReadyF([name]);
  
  var listener = new ROSLIB.Topic({
    ros : this.ros,
    name : topic,
    messageType : type
  });

  listener.subscribe(function(message) {
    engine.debug('Received message on ' + listener.name + ': ' + message);
    callback(message);
  });

  this.topics.push({name: topic, listener: listener});
  
};


Engine.prototype.scheduledPublish = function(ctx, topic, type, msg){
  var engine = this;
  var remapping_kv = R.compose(
    R.fromPairs,
    R.map(R.values)
  )(ctx.remappings);
  var name = remapping_kv[topic];
  var engine = this;


  // engine._waitForTopicsReadyF([name]);
  engine.pub(name, type, msg);

};





Engine.prototype.runAction = function(name, type, goal, onResult, onFeedback){
  this.log("run action : " +  name + " " + type + " " + JSON.stringify(goal));

  var ac = new ROSLIB.ActionClient({
    ros : this.ros,
    serverName : name,
    actionName : type
  });

  var goal = new ROSLIB.Goal({
    actionClient : ac,
    goalMessage : goal
  });

  goal.on('feedback', onFeedback);
  goal.on('result', onResult);

  goal.send();

};

Engine.prototype.cmdVel = function(options){

  var cmdVel = new ROSLIB.Topic({
    ros : this.ros,
    name : '/turtle1/cmd_vel',
    messageType : 'geometry_msgs/Twist'
  });

  var twist = new ROSLIB.Message(options);

  cmdVel.publish(twist);


};


Engine.prototype.publish = function(topic, type, msg){
  return this.pub(topic, type, msg);
};

// Engine.prototype.publish = function(event_name, params){
  // var data = {event: event_name};
  // _.assign(data, params);

// };
Engine.prototype.clear = function(){
  this.ee.removeAllListeners();
  this.memory = {};
  this.unsubscribeAll();

  R.mapObj(function(r){
    try{ r.cancel_all(); }catch(e){}
  })(this.schedule_requests);

  this.log('engine cleared');

};
Engine.prototype.print = function(msg){
  console.log(new Date().toString() + " - " + msg.green);

};

Engine.prototype.log = function(args){
  console.log(new Date().toString(), "-", args);
};

Engine.prototype.debug = function(args){
  if(DEBUG){
    console.log(new Date().toString(), "-", args);
  }
};

Engine.prototype.itemsToCode = function(items){
  var js = _.map(items, function(i){
    return "// "+i.title+"\n"+i.js;
  }).join("\n\n");


  return js;



};

Engine.prototype.runBlocksById = function(ids){
  var that = this;
  this.getItems(function(err, items){
    var items_to_load = R.filter(function(i){
      return R.contains(i.id, ids);
    })(items);

    var scripts = that.itemsToCode(items_to_load);

    that.runCode(scripts);




  });


};

Engine.prototype.runBlocks = function(blocks){
  var that = this;
  this.getItems(function(err, items){


    if(blocks && blocks.length > 0){
      items = _.where(items, function(i){
        return _.include(blocks, i.title);
      });
    }

    var scripts = that.itemsToCode(items);

    that.runCode(scripts);




  });

};

Engine.prototype.getItems = function(cb){
  var col = this.db.collection('settings');
  col.findOne({key: 'cento_authoring_items'}, function(e, data){

    var items = data ? data.value.data : [];
    cb(e, items);
  });

};


Engine.prototype.getParam = function(k, cb){
  var param = new ROSLIB.Param({
    ros : this.ros,
    name : k
  });
  param.get(cb)
};


Engine.prototype.setParam = function(k, v, cb){
  var paramClient = new ROSLIB.Service({
    ros : this.ros,
    name : '/rosapi/set_param',
    serviceType : 'rosapi/SetParam'
  });

  var request = new ROSLIB.ServiceRequest({
    name : k,
    value : JSON.stringify(v)
  });

  paramClient.callService(request, cb);
};

Engine.prototype.load = function(){
  this.runBlocks(null);

};
Engine.prototype.reload = function(){
  var that = this;
  this.clear();
  this.load();
};




module.exports = Engine;
