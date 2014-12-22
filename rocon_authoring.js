#!/usr/bin/env node

var _ = require('lodash'),
  MongoClient = require('mongodb').MongoClient,
  colors = require('colors'),
  bodyParser = require('body-parser'),
  swig = require('swig'),
  express = require('express'),
  MongoClient = require('mongodb').MongoClient,
  Engine = require('./engine');
  
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

MongoClient.connect(process.env.ROCON_AUTHORING_MONGO_URL, function(e, db){
  if(e) throw e;
  console.log('mongo connected');

  /*
   * Express
   */

  app.use(express.static('public'));
  app.use(bodyParser.json({limit: '50mb'}));

  // This is where all the magic happens!
  app.engine('html', swig.renderFile);

  app.set('view engine', 'html');
  app.set('views', __dirname + '/views');

  app.set('view cache', false);
  swig.setDefaults({ cache: false });

  $engine = new Engine(db);

  require('./routes')(app, db);
  require('./monitor')(io);

  server = http.listen(process.env.ROCON_AUTHORING_SERVER_PORT, function(){
    console.log('Listening on port %d (%s)', server.address().port, process.env.NODE_ENV);
  });



  var args = process.argv.slice(1);
  if(args.length){
    $engine.once('started', function(){
      $engine.runBlocks(args);
    });

  }




});



