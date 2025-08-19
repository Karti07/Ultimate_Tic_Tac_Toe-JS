//Import necessary modules
import { GameData } from './GameData.mjs';
import { GameHandler } from './GameHandler.mjs';
import { isValidIndex } from '../win.mjs';

// Function to get the Socket.IO instance from the window
function getSocket(options) {
    if (typeof window !== 'undefined' && 'io' in window) {
      return window.io(options);
    } else {
      return null;
    }
}
  
// Class for handling online multiplayer games, extending the base GameHandler
export class OnlineGameHandler extends GameHandler {
  constructor(io, games, gamesCount) {
    // Call the constructor of the base class
    super();

    // Initialize properties for online game handling
    this.gameName = '';
    this.gameStarted = false;
    this.playerSymbol = 'O';

    // Set up properties for game management
    this.io = io;
    this.games = games;
    this.gamesCount = gamesCount;

    // Get the Socket.IO instance and set up event listeners
    this.socket = getSocket({ autoConnect: false });
    if (this.socket) {
      this.socket.connect();
      this.socket.on('lobby state', (data) => this.onLobbyState(data));
      this.socket.on('start game', (data) => this.onStartGame(data));
      this.socket.on('play', (data) => this.onPlay(data));
      this.socket.on('game end state', (data) => this.onGameEnd(data));
      this.socket.on('back to lobby', () => this.onBackToLobby());
    }
  }
  
  // Create a new game
  createGame() {
    const gameName = `Game#${this.games.size + 1}`;
    this.games.set(gameName, new GameData());
    return { gameName };
  }  

  // Event handler for lobby state updates
  onLobbyState(data) { }

  // Event handler for the start of the game
  onStartGame({ gameName, playerSymbol }) {
    this.gameStarted = true;
    this.gameName = gameName;
    this.playerSymbol = playerSymbol;
    // Emit a player change event
    this.emitPlayerChange();
  }

  // Handle socket connections
  handleConnection(socket) {
    // Join the 'lobby' room
    socket.join('lobby');

    // Get the lobby room
    const lobby = this.io.sockets.adapter.rooms.get('lobby');
    if (lobby) {
      // Broadcast lobby state to all clients in the 'lobby' room
      this.io.to('lobby').emit('lobby state', { playerCount: lobby.size });

      // Start the game if there are two players in the lobby
      if (lobby.size === 2) {
        this.startGame(lobby);
      }
    }

     // Set up event listeners for 'play' and 'disconnecting' events
     socket.on('play', (data) => {
      this.handlePlay(socket, data);
    });
    socket.on('disconnecting', () => {
      this.handleDisconnect(socket);
    });
  }

  //Start a new game
  startGame(lobby) {
    const { gameName } = this.createGame();

    // Get the sockets of the players in the lobby
    const [sid1, sid2] = lobby;
    const [socket1, socket2] = [sid1, sid2].map((socket) => this.io.sockets.sockets.get(socket));

    // Assign player symbols and emit 'start game' event
    if (socket1 && socket2) {
      socket1.data.playerSymbol = 'X';
      socket1.emit('start game', { gameName, playerSymbol: 'X' });
      socket2.data.playerSymbol = 'O';
      socket2.emit('start game', { gameName, playerSymbol: 'O' });

      // Set up the sockets for the game room and remove from the 'lobby' room
      for (const socket of [socket1, socket2]) {
        socket.data.roomName = gameName;
        socket.join(gameName);
        socket.leave('lobby');

      }
    }
  }

  // Handle player moves
  handlePlay(socket, data) {
    const { roomName, playerSymbol } = socket.data;
    const game = this.games.get(roomName);

    // Check if the move is valid and update the game state
    if (game && !game.isDone() && game.currentPlayer === playerSymbol) {
      if (game.setCell(data.boardIndex, data.cellIndex)) {
        // Broadcast the move to all clients in the game room
        this.io.to(roomName).emit('play', { boardIndex: data.boardIndex, cellIndex: data.cellIndex, lastPlayer: playerSymbol });

        // Check if the game is complete and broadcast the game end state
        if (game.isDone()) {
          this.io.to(roomName).emit('game end state', { finalGameState: game });
        }
      }
    }
  }

  // Method to disconnect from the server
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = undefined;
    }
  }

  // Event handler for the end of the game
  onGameEnd({ finalGameState }) {
    // Disconnect from the server
    this.disconnect();
  }

  // Event handler for returning to the lobby
  onBackToLobby() {
    // Disconnect from the server
    this.disconnect();
  }

  //Handle disconnections
  handleDisconnect(socket) {
    const { roomName } = socket.data;

    // Broadcast 'back to lobby' event to all clients in the game room
    this.io.to(roomName).emit('back to lobby');

    // Move disconnected players back to the 'lobby' room
    const sids = this.io.sockets.adapter.rooms.get(roomName);
    if (sids) {
      for (const sid of sids) {
        const client = this.io.sockets.sockets.get(sid);
        if (client) {
          client.leave(roomName);
          client.join('lobby');
        }
      }
    }
  }

  // Clean-up method to disconnect when cleaning up the game
  cleanUp() {
    this.disconnect();
  }
  
  // Check if the player can make a move
  canPlayerMove() {
    return !this.gameData.isDone() && this.gameData.currentPlayer === this.playerSymbol;
  }
  
  // Method to handle the player's move
  playerMove(boardIndex, cellIndex) {
    // Check for valid indices and emit a play event to the server
    if (isValidIndex(boardIndex) && isValidIndex(cellIndex)) {
      this.socket?.emit('play', { boardIndex, cellIndex });
    }
  }

  // Event handler for player moves
  onPlay({ boardIndex, cellIndex }) {
    // Call the base class's playerMove method with the received data
    super.playerMove(boardIndex, cellIndex);
  }

  // Get a message based on the game state
  getMessage() {
    if (!this.gameStarted) {
      return 'Waiting for the other player to join.';
    }
    switch (this.gameData.getState()) {
      case 'Winner X':
        return this.playerSymbol === 'X' ? 'You win the game!' : 'Your opponent wins the game!';
      case 'Winner O':
        return this.playerSymbol === 'O' ? 'You win the game!' : 'Your opponent wins the game!';
      case 'Tie':
        return `It's a draw!`;
    }
    return this.gameData.currentPlayer === this.playerSymbol ? 'Your turn' : `Opponent's turn`;
  }
}