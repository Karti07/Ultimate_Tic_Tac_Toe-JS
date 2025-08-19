// Import necessary modules
import { GameHandler } from './GameHandler.mjs';
import { OnlineGameHandler } from './OnlineGameHandler.mjs';
import { AIGameHandler } from './AIGameHandler.mjs';

// DOM element references
const elem_cells = document.querySelectorAll('.cell');
const elem_miniboards = document.querySelectorAll('.mini-board');
const elem_ultimateboard = document.querySelector('.ultimate-board');
const elem_message = document.getElementById('message');
const elem_infobutton = document.getElementById('info-button');
const elem_closeinfobutton = document.getElementById('close-info-button');
const elem_info = document.getElementById('info');
const elem_restart = document.getElementById('restart');
const elem_gamemodedropdown = document.getElementById('game-mode');
const muteButton = document.getElementById('mute-button');
const muteIcon = document.getElementById('mute-icon');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const darkIcon = document.getElementById('dark-icon');


// Initialize GameHandler as a generic GameHandler instance
let gameHandler = new GameHandler();

// Audio element to play sounds
let audioElement = new Audio();

// Tracks if audio/video is muted
let isMuted = false;

// Tracks if dark-mode is enabled
let isDarkMode = false;

//Function to handle Audio
function playAudio(audioPath) {
    // Check if muted; if muted, do not play audio
    if (isMuted) return;

    // Check if there is any audio currently playing (i.e., not paused)
    if (!audioElement.paused) {
        // Pause the currently playing audio
        audioElement.pause();
    }
    
    // Set the audio source to the provided audio path
    audioElement.src = audioPath;
    
    // Play the audio and handle the promise with .catch()
    audioElement.play().catch((err) => {});
}

// Function to handle cell clicks
function HandleCellClick(event) {
    const cell = event.currentTarget;
    
    // Check if the clicked element is not a div; return if it's not
    if (!(cell instanceof HTMLDivElement)) { return; }

    const parent = cell.parentElement;

    // Ensure the cell has a parent element; return if not
    if (parent == null) { return; }

    const elementDataIndex = cell.dataset.index;
    const parentDataIndex = parent.dataset.index;

    // Ensure data-index attributes are defined; return if not
    if (elementDataIndex === undefined || parentDataIndex === undefined) { return; }

    const cellIndex = Math.floor(Number.parseInt(elementDataIndex) % 9);
    const boardIndex = Number.parseInt(parentDataIndex);

    // If the player can move, handle the player's move
    if (gameHandler.canPlayerMove()) {
        playAudio('/audio/cell_click.mp3');
        gameHandler.playerMove(boardIndex, cellIndex);

        cell.classList.add("bounce");
    }
}

// Function to handle cell change events
function onCellChange({ boardIndex, cellIndex }) {
    // Update cell content
    elem_cells[boardIndex * 9 + cellIndex].textContent = gameHandler.getCellSymbol(boardIndex, cellIndex);

    // Remove active-mini-board class from all mini-boards
    for (const board of elem_miniboards) {
        board.classList.remove('active-mini-board');
    }

    // Update mini-board classes based on the board state
    const board = elem_miniboards[boardIndex];
    const boardState = gameHandler.getBoardState(boardIndex);
    switch (boardState) {
        case 'Winner X':
        case 'Winner O':
            board.classList.add(`winner-${boardState.charAt(boardState.length - 1)}`);
            // Play mini-board winner sound
            const winnerAudio = new Audio('/audio/mini-board_winner.mp3');
            playAudio('/audio/mini-board_winner.mp3');
            
            break;
        default:
    }

    // Handle overall game winner
    const overallGameState = gameHandler.getGameState();
    if (overallGameState === 'Winner X' || overallGameState === 'Winner O') {
        // Hide small X and O pieces and enable the ultimate board
        for (const cell of elem_cells) {
            cell.classList.add('hide-content');
            elem_ultimateboard.classList.remove('disable');
        }
        clearCellBackgroundColors();

        playAudio('/audio/overall_winner.mp3');
        
    } else {
        // If the game is not done, highlight the active mini-board
        const activeBoardIndex = gameHandler.getActiveBoardIndex();
        if (activeBoardIndex !== -1) {
            elem_miniboards[activeBoardIndex].classList.add('active-mini-board');
        }
    }

    // Update message based on game state
    elem_message.textContent = gameHandler.getMessage();

    // Update the last move
    gameHandler.updateLastMove(boardIndex, cellIndex);

    //Function to check if any mini-board or the overall game is in a winning state
    function isWinState() {
        return (
            boardState !== 'Winner X' &&
            boardState !== 'Winner O' &&
            overallGameState !== 'Winner X' &&
            overallGameState !== 'Winner O'
        );
    }

    //Function to highlight the cell of the last move played
    function highlightLastMoveCell() {
        // Highlight the last moved cell in yellow
        const lastMoveCell = elem_cells[gameHandler.lastMove.boardIndex * 9 + gameHandler.lastMove.cellIndex];
        lastMoveCell.classList.add('yellow-background');
    }

    // Check if there is a winner state and handle it
    if (isWinState()) {
        // If there is a winner, highlight the last moved cell in AI mode
        if (gameHandler instanceof AIGameHandler) {
            clearCellBackgroundColors();
            highlightLastMoveCell();
        }
    }

    //Function to clear the background colour of all cells
    function clearCellBackgroundColors() {
        // Remove background color from all cells
        for (const cell of elem_cells) {
            cell.classList.remove('yellow-background');
        }
    }
}

// Function to handle player change events
function onPlayerChange() {
    // Enable or disable the ultimate board based on the player's ability to move
    elem_ultimateboard.classList.toggle('disable', !gameHandler.canPlayerMove());

    // Update the message based on the game state
    elem_message.textContent = gameHandler.getMessage();
}

// Function to set up the game mode based on the selected dropdown option
function SetupGameMode() {
    // Check if an online multiplayer game is active
    if (
        gameHandler instanceof OnlineGameHandler &&
        gameHandler.gameStarted === true &&
        (gameHandler.getGameState() !== 'Winner X' && gameHandler.getGameState() !== 'Winner O')
    ) {
        // Display an alert and reset the dropdown if an online game is active
        elem_gamemodedropdown.selectedIndex = 1; // set to online again
        alert('Online Multiplayer Game is Active. Please finish before starting a new game!');
        return;
    }

    // Clean up the current game handler and create a new one based on the selected mode
    gameHandler.cleanUp();
    switch (elem_gamemodedropdown.value) {
        case 'local':
            gameHandler = new GameHandler();
            break;
        case 'online':
            gameHandler = new OnlineGameHandler();
            break;
        case 'single':
            gameHandler = new AIGameHandler();
            break;
    }

    // Reset the board inside the switch case
    for (const element of elem_cells) {
        element.textContent = '';
        element.classList.remove('hide-content');
        element.classList.remove('yellow-background');
    }
    for (const element of elem_miniboards) {
        element.classList.remove('winner-X', 'winner-O', 'tie', 'active-mini-board');
    }
    elem_ultimateboard.classList.remove('disable');

    // Subscribe to cell change and player change events, then start the game
    gameHandler.subscribeToCellChange(onCellChange);
    gameHandler.subscribeToPlayerChange(onPlayerChange);
    gameHandler.start();
}

function Restart() {
    if (
        gameHandler instanceof OnlineGameHandler &&
        gameHandler.gameStarted === true &&
        gameHandler.getGameState() !== 'Winner X' && gameHandler.getGameState() !== 'Winner O'
    ) {
        // Display a message or handle the situation as needed
        alert('Restart is disabled in online mode.');
        return;
    }
    // Reset the board and mini-boards, then set up the game mode
    for (const element of elem_cells) {
        element.textContent = '';
        element.classList.remove('yellow-background');
        element.classList.remove('hide-content');
        element.classList.remove('bounce');
    }
    for (const element of elem_miniboards) {
        element.classList.remove('winner-X', 'winner-O', 'tie', 'active-mini-board');
    }
    elem_ultimateboard.classList.remove('disable');
    SetupGameMode()
}

// Function to show the info
function ToggleInfo() {
    elem_info.classList.toggle('hidden');
}

// Function to handle the 'Escape' key press event
function handleEscapeKey(event) {
    // Check if the pressed key is 'Escape'
    if (event.key === 'Escape') {
        if (!elem_info.classList.contains('hidden')) {
            ToggleInfo();
        }
    }
}

//Function to setup the full screen button
function setupFullscreenButton() {
    // Check if fullscreen is supported by the browser
    if (document.fullscreenEnabled) {
        const fullscreen_button = document.createElement("button");
        fullscreen_button.setAttribute('id','fullscreen-button');
        fullscreen_button.addEventListener("click", toggle_fullscreen);
        fullscreen_button.innerHTML  = `
            <svg viewBox="0 0 24 24">
                <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 
                7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
            </svg>
            <svg viewBox="0 0 24 24">
                <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 
                11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
            </svg>
        `;
        document.body.appendChild(fullscreen_button);
    }
}
//Function to toggle the full screen
function toggle_fullscreen() {
    if (!document.fullscreenElement) {
        document.body.requestFullscreen();
        document.body.setAttribute("fullscreen",""); 
    } else {
        document.exitFullscreen();
        document.body.removeAttribute("fullscreen"); 
    }
}

function main() {
    // Add click event listeners to all cells
    for (const cell of elem_cells) {
        cell.addEventListener('click', HandleCellClick);
    }

    // Event listeners for UI interactions
    elem_restart.addEventListener('click', Restart);
    elem_infobutton.addEventListener('click', ToggleInfo);
    elem_closeinfobutton.addEventListener('click', ToggleInfo);
    elem_gamemodedropdown.addEventListener('change', SetupGameMode);
    document.addEventListener('keydown', handleEscapeKey);
    darkModeToggle.addEventListener('click', () => {
        isDarkMode = !isDarkMode;
        darkIcon.className = isDarkMode ? 'fa fa-sun' : 'fa fa-moon';
        document.body.classList.toggle('dark-mode');
    });  
    muteButton.addEventListener('click', () => {
        isMuted = !isMuted;
        muteIcon.className = isMuted ? 'fa fa-volume-mute' : 'fa fa-volume-up';
    });

    // Setup fullscreen button
    setupFullscreenButton();
    
    // Event Litseners for keyboard shortcuts
    document.addEventListener('keydown', (event) => {
        if (event.key.toLowerCase() === 'f') {
            toggle_fullscreen();
        } else if (event.key.toLowerCase() === 'r') {
            Restart();
        }
        else if  (event.key.toLowerCase() === 'd') {
            isDarkMode = !isDarkMode;
            darkIcon.className = isDarkMode ? 'fa fa-sun' : 'fa fa-moon';
            document.body.classList.toggle('dark-mode');
        }
        else if (event.key.toLowerCase() === 'm') {
            isMuted = !isMuted;
            muteIcon.className = isMuted ? 'fa fa-volume-mute' : 'fa fa-volume-up';
        }
    });

    // Set up the initial game mode
    SetupGameMode();
}

main()