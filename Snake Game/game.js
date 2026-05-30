const board = document.querySelector(".board");
const startButton = document.querySelector(".btn-start");
const modal = document.querySelector(".modal");
const startGameModal  = document.querySelector(".start-game");
const gameOverModal = document.querySelector(".game-over");
const restartButton = document.querySelector(".btn-restart");

// New DOM Selectors for tracking text
const scoreDisplay = document.getElementById("score"); 
const highScoreDisplay = document.getElementById("high-score"); 
const timeDisplay = document.getElementById("time");

const blockHeight = 50;
const blockWidth = 50;

const cols = Math.floor(board.clientWidth / blockWidth);
const rows = Math.floor(board.clientHeight / blockHeight);

const blocks = {}; 
let intervalId = null;
let timerId = null; // New interval for the clock

// Game State Variables
let snake = [
    { x: 1, y: 3 },
    { x: 1, y: 4 },
    { x: 1, y: 5 }
];
let direction = "down";
let score = 0;
let timeElapsed = 0;

// Get High Score from Local Storage (Default to 0 if it doesn't exist)
let highScore = localStorage.getItem("snakeHighScore") || 0;

// Initialize the grid
for(let row = 0; row < rows; row++){
    for(let col = 0; col < cols; col++){
        const block = document.createElement("div");
        block.classList.add("block");
        board.appendChild(block);
        blocks[`${row}-${col}`] = block; 
    }
}

// Generate food initially
let food = {x: Math.floor(Math.random() * rows), y: Math.floor(Math.random() * cols)};
blocks[`${food.x}-${food.y}`].classList.add("food");

// Draw initial snake state
snake.forEach(segment => {
    if(blocks[`${segment.x}-${segment.y}`]) {
        blocks[`${segment.x}-${segment.y}`].classList.add("fill");
    }
});

// Update the initial UI displays
if(scoreDisplay) scoreDisplay.innerText = score;
if(highScoreDisplay) highScoreDisplay.innerText = highScore;
if(timeDisplay) timeDisplay.innerText = timeElapsed;

function render() {
    let head = null;

    if(direction === "left") head = {x: snake[0].x, y: snake[0].y - 1};
    else if(direction === "right") head = {x: snake[0].x, y: snake[0].y + 1};
    else if(direction === "down") head = {x: snake[0].x + 1, y: snake[0].y};
    else if(direction === "up") head = {x: snake[0].x - 1, y: snake[0].y};

    // Wall Collision Check
    if(head.x < 0 || head.x >= rows || head.y < 0 || head.y >= cols) {
        endGame();
        return; 
    }

    // Self-Collision Check
    for (let i = 0; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            endGame();
            return;
        }
    }

    // Logic for Movement & Eating Food
    if (head.x === food.x && head.y === food.y) {
        blocks[`${food.x}-${food.y}`].classList.remove("food");
        
        // Update Score
        score++;
        if(scoreDisplay) scoreDisplay.innerText = score;

        // Check and Update High Score
        if (score > highScore) {
            highScore = score;
            localStorage.setItem("snakeHighScore", highScore);
            if(highScoreDisplay) highScoreDisplay.innerText = highScore;
        }
        
        food = {x: Math.floor(Math.random() * rows), y: Math.floor(Math.random() * cols)};
        blocks[`${food.x}-${food.y}`].classList.add("food");
    } else {
        const tail = snake.pop();
        if(blocks[`${tail.x}-${tail.y}`]) {
            blocks[`${tail.x}-${tail.y}`].classList.remove("fill");
        }
    }
    
    snake.unshift(head); 
    if(blocks[`${head.x}-${head.y}`]) {
        blocks[`${head.x}-${head.y}`].classList.add("fill");
    }
}

function updateTime() {
    timeElapsed++;
    
    // Calculate minutes and seconds
    const minutes = Math.floor(timeElapsed / 60).toString().padStart(2, '0');
    const seconds = (timeElapsed % 60).toString().padStart(2, '0');
    
    // Update the HTML
    if(timeDisplay) {
        timeDisplay.innerText = `${minutes}:${seconds}`;
    }
}

function endGame() {
    clearInterval(intervalId);
    clearInterval(timerId); // Stop the clock
    modal.style.display = "flex";
    startGameModal.style.display = "none";
    gameOverModal.style.display = "flex";
}

startButton.addEventListener("click", () => {
    modal.style.display = "none";
    
    if (intervalId) clearInterval(intervalId); 
    if (timerId) clearInterval(timerId);
    
    intervalId = setInterval(() => { render() }, 300);
    timerId = setInterval(updateTime, 1000); // Start the 1-second timer
});

restartButton.addEventListener("click", restartGame);

function restartGame() {
    // Clear old state from the DOM
    blocks[`${food.x}-${food.y}`].classList.remove("food");
    snake.forEach(segment => {
        if(blocks[`${segment.x}-${segment.y}`]) {
            blocks[`${segment.x}-${segment.y}`].classList.remove("fill");
        }
    });

    // Reset game variables
    modal.style.display = "none";
    direction = "down";
    score = 0;
    timeElapsed = 0;
    
    // Reset displays
    if(scoreDisplay) scoreDisplay.innerText = score;
    if(timeDisplay) timeDisplay.innerText = timeElapsed;
    
    snake = [
        { x: 1, y: 3 },
        { x: 1, y: 4 }
    ];
    
    snake.forEach(segment => {
        blocks[`${segment.x}-${segment.y}`].classList.add("fill");
    });

    food = {x: Math.floor(Math.random() * rows), y: Math.floor(Math.random() * cols)};
    blocks[`${food.x}-${food.y}`].classList.add("food");

    if (intervalId) clearInterval(intervalId);
    if (timerId) clearInterval(timerId);
    
    intervalId = setInterval(() => { render() }, 300);
    timerId = setInterval(updateTime, 1000);
}

// Controls
addEventListener("keydown", (event) =>{
    if(event.key === "ArrowUp" && direction !== "down") direction = "up";
    else if(event.key === "ArrowDown" && direction !== "up") direction = "down";
    else if(event.key === "ArrowLeft" && direction !== "right") direction = "left";
    else if(event.key === "ArrowRight" && direction !== "left") direction = "right";
});