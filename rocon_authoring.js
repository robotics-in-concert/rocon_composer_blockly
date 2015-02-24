#!/usr/bin/env node

var _ = require('lodash'),
  argv = require('minimist')(process.argv.slice(2)),
  MongoClient = require('mongodb').MongoClient,
  colors = require('colors'),
  bodyParser = require('body-parser'),
  swig = require('swig'),
  http = require('http'),
  express = require('express'),
  socketio = require('socket.io'),
  MongoClient = require('mongodb').MongoClient,
  winston = require('winston'),
  EngineManager = require('./engine_manager'),
  mongoose = require('mongoose'),
  Engine = require('./engine');


ROCON_AUTHORING_ITEMS_KEY = 'cento_authoring_items';

setupLogger();
checkEnvVars();



mongoose.connect(process.env.ROCON_AUTHORING_MONGO_URL);


MongoClient.connect(process.env.ROCON_AUTHORING_MONGO_URL, function(e, db){
  if(e) throw e;



  /*
   * Express
   */
  if(argv.web){

    var app = express(); 
    var server = http.createServer(app);
    var io = socketio(server);
    $io = io;

    io.on('connection', function(sock){
      console.log('socket.io connected');


    });


    app.use(express.static('public'));
    app.use(bodyParser.json({limit: '50mb'}));

    // This is where all the magic happens!
    app.engine('html', swig.renderFile);

    app.set('view engine', 'html');
    app.set('views', __dirname + '/views');

    app.set('view cache', false);
    swig.setDefaults({ cache: false });


    require('./routes')(app, db);

    server = server.listen(process.env.ROCON_AUTHORING_SERVER_PORT, function(){
      logger.info('Listening on port %d (%s)', server.address().port, process.env.NODE_ENV);
    });








  }

  var engine_opts = _.defaults(argv.engine_options || {}, {
    publish_delay: +process.env.ROCON_AUTHORING_PUBLISH_DELAY,
    service_port: +process.env.ROCON_AUTHORING_SERVER_PORT
  });
  global.engineManager = new EngineManager(io, {engine_options: engine_opts});

  if(argv.workflow){
    argv.engine = true;
  }


  if(argv.engine){
    


    var workflows = argv.workflow;
    if(!_.isEmpty(workflows)){
      var pid = engineManager.startEngine();
      engineManager.run(pid, workflows);
    }




  }






});

function setupLogger(){
  winston.loggers.add('main', {
    console: {
      colorize: true,
      level: process.env.ROCON_AUTHORING_LOG_LEVEL,
      prettyPrint: true
    }

  });
  var logger = winston.loggers.get('main')
  // logger.cli()

  global.logger = logger;

  logger.debug('logger initialized');

};

function checkEnvVars(){

  ['ROCON_AUTHORING_SERVER_PORT',
    'ROCON_AUTHORING_ROSBRIDGE_URL',
    'ROCON_AUTHORING_MONGO_URL',
    'ROCON_AUTHORING_PUBLISH_DELAY',
    'MSG_DATABASE'].forEach(function(e){
      var v = process.env[e]
      if(v){
        logger.info(e, process.env[e].green);
      }else{
        logger.info(e, 'null'.red);
      }
    });

};

