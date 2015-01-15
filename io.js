var channels = [];
var channel_data = {};

module.exports = function(io){
  io.on('connection', function(socket){
    console.log('socket connected');

    socket.on('disconnect', function(){
      console.log('socket disconnected');
    });
    socket.on('blockly:workspace:lock', function(e){
      socket.host = true;
      socket.emit('blockly:workspace:locked');
    });
    socket.on('blockly:workspace:changed', function(e){
      if(socket.host && socket.channel){
        channel_data[socket.channel] = e;
        socket.broadcast.to(socket.channel).emit('blockly:workspace:changed', e);
      }
    });
    socket.on('blockly:channel:create', function(e, cb){
      socket.host = true;
      socket.channel = e.name;
      socket.join(e.name);
      channels.push(e.name);
      cb('created');
    });
    socket.on('blockly:channel:join', function(e, cb){
      socket.host = false;
      socket.channel = e.name;
      socket.join(e.name);


      // send initial data
      var chdata = channel_data[e.name]
      cb(chdata);
    });
    socket.on('blockly:channel:leave', function(e){
      socket.host = false;
      socket.leave(socket.channel);
      socket.channel = null;
    });


    socket.on('blockly:channels', function(f){
      f(channels);
    });




  });



};
