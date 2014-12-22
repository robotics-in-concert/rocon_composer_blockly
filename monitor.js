
module.exports = function(io){
  $engine.on('engine:tick', function(ts){
    io.emit('msg', ts);
  });


  io.on('connection', function(socket){
    console.log('monitoring client connected');


  });

};
