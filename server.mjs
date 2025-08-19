// Import required modules
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import express from 'express';
import { OnlineGameHandler } from './public/js/OnlineGameHandler.mjs';

// Create an Express app
const app = express();
const server = createServer(app);
const io = new Server(server);

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Set up a route for the root path, serving the main HTML file
app.get('/', (req, res) => res.send('public/index.html'));

// Maintain a map to store game data for each game
let games = new Map();
let gamesCount = 0;

// Create an instance of OnlineGameHandler
const onlineGameHandler = new OnlineGameHandler(io, games, gamesCount);

// Set up a connection event listener for socket.io
io.on('connection', function (socket) {
  onlineGameHandler.handleConnection(socket);
});

// Start the server on port 3000
server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});