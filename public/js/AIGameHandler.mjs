// Import necessary modules
import { GameHandler } from './GameHandler.mjs';
import { ChooseRandom, isValidIndex } from '../win.mjs';

// Class definition for AIGameHandler, extending GameHandler
export class AIGameHandler extends GameHandler {
    // Constructor for AIGameHandler
    constructor() {
        super();

        // Set AI move delay and player symbol
        this.aiMoveDelay = 700;
        this.playerSymbol = 'O';

        // If it's not the player's turn, initiate AI move
        if (this.gameData.currentPlayer !== this.playerSymbol) {
            this.aiMove(-1);
        }
    }

    // Check if the player can make a move
    canPlayerMove() {
        return !this.gameData.isDone() && this.gameData.currentPlayer === this.playerSymbol;
    }

    // Handle player's move
    playerMove(boardIndex, cellIndex) {
        if (isValidIndex(boardIndex) && isValidIndex(cellIndex)) {
            if (this.gameData.setCell(boardIndex, cellIndex)) {
                // Emit cell change event
                this.emitCellChange(boardIndex, cellIndex);

                // If the game is not done, initiate AI move
                if (!this.gameData.isDone()) {
                    this.aiMove(this.gameData.activeBoardIndex);
                }
            }
        }
    }

    // Handle AI's move with a delay
    aiMove(boardIndex) {
        setTimeout(() => {
            if (!isValidIndex(boardIndex)) {
                // Choose a random playable board index if not specified
                boardIndex = ChooseRandom(this.gameData.getPlayableBoardIndices());
            }

            if (isValidIndex(boardIndex)) {
                // Get the AI move using the minimax algorithm
                const board = this.gameData.getBoard(boardIndex);
                const { index: cellIndex } = this.minimax(board, boardIndex, 0, this.playerSymbol);

                // Set the AI move and emit cell change event
                if (this.gameData.setCell(boardIndex, cellIndex)) {
                    this.emitCellChange(boardIndex, cellIndex);
                }
            }
        }, this.aiMoveDelay);
    }

    // Minimax algorithm for AI move calculation
    minimax(board, boardIndex, depth, player) {
        const availableMoves = board.getEmptyCellIndices();
        const MAX_DEPTH = 3;

        // Base cases: game is done, max depth reached, or no available moves
        if (this.gameData.isDone() || depth === MAX_DEPTH || availableMoves.length === 0) {
            const score = this.evaluate(board, player);
            return { score };
        }

        const moves = [];

        // Recursively evaluate possible moves
        for (const move of availableMoves) {
            const newBoard = board.clone();
            newBoard.setCellValue(move, player);

            const nextPlayer = player === 'O' ? 'X' : 'O';
            const moveScore = this.minimax(newBoard, move, depth + 1, nextPlayer).score;

            moves.push({ index: move, score: moveScore });
        }

        let bestMove;

        // Sort moves based on the player (maximizing or minimizing)
        if (player === this.playerSymbol) {
            moves.sort((a, b) => b.score - a.score);
        } else {
            moves.sort((a, b) => a.score - b.score);
        }

        // Filter best moves with the highest score
        const bestMoves = moves.filter((move) => move.score === moves[0].score);

        // Randomly choose one of the best moves
        bestMove = bestMoves[Math.floor(Math.random() * bestMoves.length)];

        return bestMove;
    }

    // Evaluate the current board state for a given player
    evaluate(board, player) {
        const opponent = this.getOpponentSymbol();

        // Check for a winner and assign scores accordingly
        if (board.getState() === `Winner ${this.playerSymbol}`) {
            return 10;
        } else if (board.getState() === `Winner ${opponent}`) {
            return -10;
        } else {
            // Check for potential wins in the next move for both player and opponent
            const playerWinningMove = this.checkWinningMove(board, player);
            const opponentWinningMove = this.checkWinningMove(board, opponent);

            if (playerWinningMove) {
                return 5; // Give a positive score for a potential winning move for the player
            } else if (opponentWinningMove) {
                return -5; // Give a negative score for a potential winning move for the opponent
            } else {
                return 0;
            }
        }
    }

    // Check if a winning move is possible on the current board
    checkWinningMove(board, player) {
        const emptyCells = board.getEmptyCellIndices();

        for (const move of emptyCells) {
            const newBoard = board.clone();
            newBoard.setCellValue(move, player);

            if (newBoard.getState() === `Winner ${player}`) {
                return true;
            }
        }

        return false;
    }

    // Get the symbol of the opponent
    getOpponentSymbol() {
        return this.playerSymbol === 'O' ? 'X' : 'O';
    }

    // Get the message based on the game state
    getMessage() {
        switch (this.gameData.getState()) {
            case 'Winner X':
                return this.playerSymbol === 'X' ? 'You win the game!' : 'AI wins the game!';
            case 'Winner O':
                return this.playerSymbol === 'O' ? 'You win the game!' : 'AI wins the game!';
            case 'Tie':
                return `It's a draw!`;
        }
        return this.gameData.currentPlayer === this.playerSymbol ? 'Your turn' : "AI's turn";
    }
}