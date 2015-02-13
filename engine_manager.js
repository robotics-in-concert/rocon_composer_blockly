

var EngineManager = function(){
  this.engine_processes = {};
};


EngineManager.prototype.startEngine = function(extras){
  var engine_opts = _.defaults(argv.engine_options || {}, extras, {
    publish_delay: +process.env.ROCON_AUTHORING_PUBLISH_DELAY,
    socketio_port: socketio_port
  });

  logger.info('engine options', engine_opts);

  var child = spawn('node', ['./engine_runner.js', '--option', JSON.stringify(engine_opts)], {stdio: ['pipe', 'pipe', 'pipe', 'ipc']})
  global.childEngine = child;

  logger.info("engine spawn pid :", child.pid);

  child.stdout.on('data', function(data){
    console.log("engine", data.toString().trim());
  });
  child.stderr.on('data', function(data){
    console.error("engine", data.toString().trim());
  });


  this.engine_processes[child.pid] = child;


}



EngineManager.prototype.stopEngine = function(pid){
  var child = this.engine_processes[pid];

  child.on('message', function(msg){
    if(msg == 'engine_stopped'){
      child..kill('SIGTERM');
    }
  });

  delete this.engine_processes[pid];

};

EngineManager.prototype.restartEngine = function(pid){
  childEngine.on('message', function(msg){
    if(msg == 'engine_stopped'){
      childEngine.kill('SIGTERM');
      startEngine();
    }
  });
  childEngine.send({action: 'stop'});
};



module.exports = EngineManager;
