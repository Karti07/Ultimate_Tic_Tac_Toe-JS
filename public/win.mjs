//Array represents all possible winning combinations
export const WIN_COMBINATIONS = [
    [0, 1, 2], // Horizontal (top row)
    [3, 4, 5], // Horizontal (middle row)
    [6, 7, 8], // Horizontal (bottom row)
    [0, 3, 6], // Vertical (left column)
    [1, 4, 7], // Vertical (middle column)
    [2, 5, 8], // Vertical (right column)
    [0, 4, 8], // Diagonal (top-left to bottom-right)
    [2, 4, 6], // Diagonal (top-right to bottom-left)
];

//Checks if a given index is a valid index
export function isValidIndex(index) {
    return index >= 0 && index <= 8;
}

//Randomly chooses an element from the provided array
export function ChooseRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}