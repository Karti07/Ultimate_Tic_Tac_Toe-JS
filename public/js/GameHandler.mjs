// Import necessary modules
import { GameData } from './GameData.mjs';
import { isValidIndex } from '../win.mjs';

// Class definition for GameHandler
export class GameHandler {
  // Constructor for GameHandler
  constructor() {
    // Initialize GameData instance
    this.gameData = new GameData();
    // Initialize variables to track the last move
    this.lastMove = { boardIndex: -1, cellIndex: -1 };
  }

  // Set of subscriptions for cell change events
  cellChangeSubscriptions = new Set();
  // Subscribe to cell change events
  subscribeToCellChange(callback) {
    this.cellChangeSubscriptions.add(callback);
  }
  // Emit cell change event to subscribers
  emitCellChange(boardIndex, cellIndex) {
    // Notify all subscribers about the cell change
    for (const callback of this.cellChangeSubscriptions) {
      callback({ boardIndex, cellIndex });
    }
    // Update the last move
    this.updateLastMove(boardIndex, cellIndex);
    // If the game is not done, emit player change event
    if (!this.gameData.isDone()) {
      this.emitPlayerChange();
    }
  }

  // Set of subscriptions for player change events
  playerChangeSubscriptions = new Set();
  // Subscribe to player change events
  subscribeToPlayerChange(callback) {
    this.playerChangeSubscriptions.add(callback);
  }
  // Emit player change event to subscribers
  emitPlayerChange() {
    // Notify all subscribers about the player change
    for (const callback of this.playerChangeSubscriptions) {
      callback();
    }
  }

  // Clean up method (to be overridden by subclasses)
  cleanUp() { }

  // Start the game and emit player change event
  start() {
    this.emitPlayerChange();
  }

  // Check if the player can make a move
  canPlayerMove() {
    return !this.gameData.isDone();
  }

  // Handle player's move
  playerMove(boardIndex, cellIndex) {
    // Check for valid board and cell indices
    if (isValidIndex(boardIndex) && isValidIndex(cellIndex)) {
      // Set the cell and emit cell change event if successful
      if (this.gameData.setCell(boardIndex, cellIndex)) {
        this.emitCellChange(boardIndex, cellIndex);
      }
    }
  }

  // Get the active board index
  getActiveBoardIndex() {
    return this.gameData.activeBoardIndex;
  }

  // Get the state of a specific board
  getBoardState(boardIndex) {
    if (isValidIndex(boardIndex)) {
      return this.gameData.getBoard(boardIndex).getState();
    }
    return '';
  }

  // Get the overall game state
  getGameState() {
    return this.gameData.getState();
  }

  // Update the last move when a player moves
  updateLastMove(boardIndex, cellIndex) {
    this.lastMove = { boardIndex, cellIndex };
  }

  // Get the symbol at a specific cell
  getCellSymbol(boardIndex, cellIndex) {
    if (isValidIndex(boardIndex) && isValidIndex(cellIndex)) {
      return this.gameData.getBoard(boardIndex).getCellValue(cellIndex);
    }
    return '';
  }

  // Get the message based on the game state
  getMessage() {
    switch (this.gameData.getState()) {
        case 'Winner X':
          return `Player X wins the game!`;
        case 'Winner O':
          return `Player O wins the game!`;
        case 'Tie':
          return `It's a draw!`;
      }
    return `Player ${this.gameData.currentPlayer}'s turn`;
  }
}