// Import necessary modules
import { WIN_COMBINATIONS, isValidIndex } from '../win.mjs';

// Class definition for GameBoard
export class GameBoard {
  // Constructor for GameBoard
  constructor() {
    // Initialize an array of cells and set the initial state to an empty string
    this.cells = new Array(9).fill('');
    this.state = '';
  }

  // Check if a cell is unset at the given index
  isCellUnset(cellIndex) {
    return this.cells[cellIndex] === '';
  }

  // Get the value of a cell at the given index
  getCellValue(cellIndex) {
    return this.cells[cellIndex];
  }

  // Set the value of a cell at the given index with the provided symbol
  setCellValue(cellIndex, symbol) {
    // Update the cell value only if the game is not done
    if (!this.isDone()) {
      this.cells[cellIndex] = symbol;
      this.updateState();
    }
  }

  // Get indices of empty cells on the board
  getEmptyCellIndices() {
    const indices = [];
    for (let i = 0; i < this.cells.length; i += 1) {
      // Check for valid index and unset cell
      if (isValidIndex(i) && this.isCellUnset(i)) {
        indices.push(i);
      }
    }
    return indices;
  }

  // Check if the game is done
  isDone() {
    return this.state !== '';
  }

  // Get the current state of the board
  getState() {
    return this.state;
  }

  // Update the state of the board based on cell values
  updateState() {
    // Check for a tie if all cells are filled
    if (this.cells.every((cell) => cell !== '')) {
      this.state = 'Tie';
    }

    // Check for winning combinations
    for (const isWinningCombination of WIN_COMBINATIONS) {
      const [a, b, c] = isWinningCombination;
      if (this.cells[a] !== '' && this.cells[a] === this.cells[b] && this.cells[a] === this.cells[c]) {
        // Set the winner based on the cell value
        if (this.cells[a] === 'X') {
          this.state = 'Winner X';
        } else {
          this.state = 'Winner O';
        }
        break;
      }
    }
  }
  
  // Clone the current board to create a copy
  clone() {
    const clonedBoard = new GameBoard();
    clonedBoard.cells = [...this.cells];
    clonedBoard.state = this.state;
    return clonedBoard;
  }
}