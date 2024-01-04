const server = require('http').createServer(handler);
const io = require('socket.io')(server); 
const fs = require('fs'); 
const url = require('url'); 
const PORT = process.env.PORT || 3000; 

const ROOT_DIR = 'html'; 

const MIME_TYPES = {
  'css': 'text/css',
  'gif': 'image/gif',
  'htm': 'text/html',
  'html': 'text/html',
  'ico': 'image/x-icon',
  'jpeg': 'image/jpeg',
  'jpg': 'image/jpeg',
  'js': 'application/javascript',
  'json': 'application/json',
  'png': 'image/png',
  'svg': 'image/svg+xml',
  'txt': 'text/plain'
};

const buttonAvailability = {
  JoinAsHomeButton: true,
  JoinAsVisitorButton: true,
  JoinAsSpectatorButton: true,
};

const clientButtons = {};

function get_mime(filename) {
  for (let ext in MIME_TYPES) {
    if (filename.indexOf(ext, filename.length - ext.length) !== -1) {
      return MIME_TYPES[ext];
    }
  }
  return MIME_TYPES['txt'];
}

server.listen(PORT); 

function handler(request, response) {
  let urlObj = url.parse(request.url, true, false);
  console.log('\n============================');
  console.log("PATHNAME: " + urlObj.pathname);
  console.log("REQUEST: " + ROOT_DIR + urlObj.pathname);
  console.log("METHOD: " + request.method);

  let filePath = ROOT_DIR + urlObj.pathname;
  if (urlObj.pathname === '/') filePath = ROOT_DIR + '/index.html';

  fs.readFile(filePath, function(err, data) {
    if (err) {
      console.log('ERROR: ' + JSON.stringify(err));
      response.writeHead(404);
      response.end(JSON.stringify(err));
      return;
    }
    response.writeHead(200, {
      'Content-Type': get_mime(filePath),
    });
    response.end(data);
  });
}

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.emit('buttonAvailability', buttonAvailability);

  socket.on('sending', (message) => {
    console.log(`Received message from client: ${message}`);

    if (message === 'Disable Home' && buttonAvailability.JoinAsHomeButton) {
      io.emit('Recieved', 'Disable Home');
      buttonAvailability.JoinAsHomeButton = false;
      socket.buttonId = 'JoinAsHomeButton';
      if (!clientButtons[socket.id]) {
        clientButtons[socket.id] = [];
      }
      clientButtons[socket.id].push('JoinAsHomeButton');
    } else if (message === 'Disable Visitor' && buttonAvailability.JoinAsVisitorButton) {
      io.emit('Recieved', 'Disable Visitor');
      buttonAvailability.JoinAsVisitorButton = false;
      socket.buttonId = 'JoinAsVisitorButton';
      if (!clientButtons[socket.id]) {
        clientButtons[socket.id] = [];
      }
      clientButtons[socket.id].push('JoinAsVisitorButton');
    } else if (message === 'Disable Spectator' && buttonAvailability.JoinAsSpectatorButton) {
      io.emit('Recieved', 'Disable Spectator');
      buttonAvailability.JoinAsSpectatorButton = false;
      socket.buttonId = 'JoinAsSpectatorButton';
      if (!clientButtons[socket.id]) {
        clientButtons[socket.id] = [];
      }
      clientButtons[socket.id].push('JoinAsSpectatorButton');
    }
  });

  socket.on('mousedown', function(x, y)  {
    io.emit('handleMouseDown', x, y);
  });

  socket.on('mousemove', function(x, y ) {
    io.emit('handleMouseMove', x, y);
  });

  socket.on('mouseup', function(data){
    io.emit('handleMouseUp', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');

    if (socket.id in clientButtons) {
      const lockedButtons = clientButtons[socket.id];
      for (const buttonId of lockedButtons) {
        buttonAvailability[buttonId] = true; 
      }
      delete clientButtons[socket.id]; 
      io.emit('buttonAvailability', buttonAvailability); 
    }
  });
});

console.log(`Server Running at port ${PORT}  CNTL-C to quit`);
console.log(`To Test:`);
console.log("http://localhost:3000/curling.html");
