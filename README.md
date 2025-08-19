# Ultimate_Tic_Tac_Toe - JS

## Table of Contents

- [Ultimate_Tic_Tac_Toe - JS](#ultimate_tic_tac_toe---js)
  - [Description](#description)
  - [Features](#features)
  - [Installation](#installation)
  - [How to Play](#how-to-play)
  - [Online Multiplayer Setup](#online-multiplayer-setup)
  - [Development Stack](#development-stack)

## Description
A web-based version of **Ultimate Tic-Tac-Toe**, built with HTML, CSS, JavaScript, Node.js, Express, and Socket.io.
The game features **local multiplayer**, **online multiplayer**, and **single-player vs AI** modes, along with dark mode, audio, and responsive design.

## Features
- Local Multiplayer – Play on the same device with friends.
- Online Multiplayer – Play with another person over the same Wi-Fi network using Socket.io.
- Single Player with AI – Challenge a computer opponent.
- Dynamic UI – Highlights the next playable mini-board.
- Dark Mode – Toggleable theme.
- Audio Effects – Cell clicks, mini-board wins, and overall wins.
- Full-Screen Mode – Immersive gameplay with one click.
- Keyboard Shortcuts:
    - `R` → Restart game
    - `D` → Toggle dark mode
    - `M` → Toggle mute
    - `F` → Fullscreen
    - `Esc` → Close info popup

## Installation
1. Clone this repository to your local machine.
2. Make sure you have Node.js and npm installed.
3. Navigate to the `package.json` file and run this command:
    ```js
    npm install
    ```

4. Run this command to run the server:
    ```js
    npm start
    ```

5. In your browser, copy and paste `http://localhost:3000` or simply typing `3000` should do the job!


## How to Play
- The goal is to win three mini-boards in a row (like normal Tic-Tac-Toe but on a larger scale).
- The cell you pick in a mini-board determines where your opponent must play next.
- Think strategically: you’re always setting up both your move and your opponent’s move.

## Online Multiplayer Setup
- Both players must be on the same Wi-Fi network.
- Player 1 (Host) runs the game and opens http://localhost:3000.
- Player 2 connects using Player 1’s IPv4 address with :3000. Example:
  ```makefile
     192.168.1.5:3000
  ```
- Both players select **Online Multiplayer** from the dropdown menu.

## Development Stack

- HTML
- CSS
- JavaScript
  - [Node.js](https://nodejs.org/en)
  - [Express](https://expressjs.com/)
  - [Socket.io](https://socket.io/)

