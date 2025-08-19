// Import necessary modules
import { GameBoard } from './GameBoard.mjs';
import { WIN_COMBINATIONS, isValidIndex } from '../win.mjs';

// Class definition for GameData
export class GameData {
  // Constructor for GameData
  constructor() {
    // Initialize properties for active board index, current player, game boards, and state
    this.activeBoardIndex = -1;
    this.currentPlayer = 'X';
    this.boards = Array.from({ length: 9 }, () => new GameBoard());
    this.state = '';
  }

  // Get the board at the specified index
  getBoard(index) {
    return this.boards[index];
  }

  // Get indices of playable boards
  getPlayableBoardIndices() {
    const indices = [];
    for (let i = 0; i < this.boards.length; i += 1) {
      // Check for valid index and board not done
      if (isValidIndex(i) && !this.getBoard(i).isDone()) {
        indices.push(i);
      }
    }
    return indices;
  }

  // Set a cell on the board at the specified indices
  setCell(boardIndex, cellIndex) {
    if (this.activeBoardIndex === -1 || this.activeBoardIndex === boardIndex) {
      const board = this.getBoard(boardIndex);
      // Check if the board is not done and the cell is unset
      if (!board.isDone() && board.isCellUnset(cellIndex)) {
        board.setCellValue(cellIndex, this.currentPlayer);
        this.activeBoardIndex = this.getBoard(cellIndex).isDone() ? -1 : cellIndex;
        this.togglePlayer();
        this.updateState();
        return true;
      }
    }
    return false;
  }

  // Get the current player
  getPlayer() {
    return this.currentPlayer;
  }

  // Toggle the current player
  togglePlayer() {
    this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
  }

  // Check if the game is done
  isDone() {
    return this.state !== '';
  }

  // Get the current state of the game
  getState() {
    return this.state;
  }

  // Update the state of the game based on board states
  updateState() {
    // Check for a tie if all boards are done
    if (this.boards.every((board) => board.isDone())) {
      this.state = 'Tie';
    }

    // Check for winning combinations
    for (const combination of WIN_COMBINATIONS) {
      const [a, b, c] = combination;
      if (
        this.boards[a].isDone() &&
        this.boards[a].getState() === this.boards[b].getState() &&
        this.boards[a].getState() === this.boards[c].getState()
      ) {
        // Set the winner based on the board state
        if (this.boards[a].getState() === 'Winner X') {
          this.state = 'Winner X';
        } else {
          this.state = 'Winner O';
        }
        break;
      }
    }
  }
}