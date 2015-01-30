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
  spawn = require('child_process').spawn,
  Engine = require('./engine');

setupLogger();
checkEnvVars();


var socketio_port = (process.env.ROCON_AUTHORING_SOCKETIO_PORT || 100 + +process.env.ROCON_AUTHORING_SERVER_PORT)
$socketio_port = socketio_port;

global.childEngine = null;

global.startEngine = function(){
    var engine_opts = _.merge(argv.engine_options || {}, {
      publish_delay: +process.env.ROCON_AUTHORING_PUBLISH_DELAY,
      socketio_port: socketio_port
    });
    console.log(engine_opts);



    var child = spawn('node', ['./engine_runner.js', '--option', JSON.stringify(engine_opts)], {stdio: ['pipe', 'pipe', 'pipe', 'ipc']})
    global.childEngine = child;

    console.log("spawn pid :", child.pid);

    child.stdout.on('data', function(data){
      console.log("* engine : ", data.toString().trim());
    });
    child.stderr.on('data', function(data){
      console.error("* engine - error : ", data.toString().trim());
    });


    // $engine = new Engine(db, io,argv.engine_options);

    // var args = argv.workflow
    // if(args && args.length){
      // $engine.once('started', function(){
        // $engine.runBlocks(args);
      // });

    // }
}

global.stopEngine = function(){
  global.childEngine.kill('SIGTERM');
};

MongoClient.connect(process.env.ROCON_AUTHORING_MONGO_URL, function(e, db){
  if(e) throw e;



  /*
   * Express
   */
  if(argv.web){

    var app = express(); 
    var server = http.createServer(app);
    var server2 = http.createServer(app);
    var io = socketio.listen(server);
    $io = io;


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


  if(argv.workflow){
    argv.engine = true;
  }


  if(argv.engine){
    startEngine();
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





















