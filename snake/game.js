/**
 * 贪吃蛇游戏 - 核心逻辑
 * 设计风格：简约自然
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 游戏配置
const CONFIG = {
    gridSize: 20,           // 格子大小
    tileCount: 20,          // 地图尺寸 20x20
    gameSpeed: 150          // 移动间隔(ms)
};

// 游戏状态
let snake = [];
let food = { x: 0, y: 0 };
let direction = { x: 0, y: 0 };
let nextDirection = { x: 0, y: 0 };
let score = 0;
let isRunning = false;
let isPaused = false;
let isGameOver = false;
let gameLoop = null;

// DOM 元素
const scoreElement = document.getElementById('scoreValue');
const finalScoreElement = document.getElementById('finalScore');
const gameOverPanel = document.getElementById('gameOverPanel');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');

/**
 * 初始化游戏状态
 */
function initGame() {
    snake = [
        { x: 10, y: 10 },
        { x: 10, y: 11 },
        { x: 10, y: 12 }
    ];
    
    direction = { x: 0, y: -1 };
    nextDirection = { x: 0, y: -1 };
    
    score = 0;
    isRunning = false;
    isPaused = false;
    isGameOver = false;
    
    updateScore();
    spawnFood();
    draw();
    
    startBtn.style.display = 'block';
    startBtn.textContent = '开始游戏';
    gameOverPanel.style.display = 'none';
}

/**
 * 生成食物
 */
function spawnFood() {
    let validPosition = false;
    
    while (!validPosition) {
        food.x = Math.floor(Math.random() * CONFIG.tileCount);
        food.y = Math.floor(Math.random() * CONFIG.tileCount);
        validPosition = !snake.some(segment => segment.x === food.x && segment.y === food.y);
    }
}

/**
 * 更新游戏状态
 */
function update() {
    if (!isRunning || isPaused || isGameOver) return;
    
    if (nextDirection.x !== -direction.x || nextDirection.y !== -direction.y) {
        direction = { ...nextDirection };
    }
    
    const head = { 
        x: snake[0].x + direction.x, 
        y: snake[0].y + direction.y 
    };
    
    if (head.x < 0 || head.x >= CONFIG.tileCount || 
        head.y < 0 || head.y >= CONFIG.tileCount) {
        endGame();
        return;
    }
    
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        endGame();
        return;
    }
    
    snake.unshift(head);
    
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        updateScore();
        spawnFood();
    } else {
        snake.pop();
    }
}

/**
 * 渲染游戏画面
 */
function draw() {
    // 清空画布 - 白色背景
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制网格线
    drawGrid();
    
    // 绘制食物
    drawFood();
    
    // 绘制蛇
    drawSnake();
}

/**
 * 绘制网格线
 */
function drawGrid() {
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= CONFIG.tileCount; i++) {
        const pos = i * CONFIG.gridSize;
        
        ctx.beginPath();
        ctx.moveTo(pos, 0);
        ctx.lineTo(pos, canvas.height);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, pos);
        ctx.lineTo(canvas.width, pos);
        ctx.stroke();
    }
}

/**
 * 绘制食物 - 柔和红色圆点
 */
function drawFood() {
    const x = food.x * CONFIG.gridSize;
    const y = food.y * CONFIG.gridSize;
    const size = CONFIG.gridSize;
    
    // 简洁圆形，无光晕
    ctx.fillStyle = '#e57373';
    ctx.beginPath();
    ctx.arc(x + size/2, y + size/2, size/2 - 4, 0, Math.PI * 2);
    ctx.fill();
}

/**
 * 绘制蛇 - 柔和绿色方块
 */
function drawSnake() {
    snake.forEach((segment, index) => {
        const x = segment.x * CONFIG.gridSize;
        const y = segment.y * CONFIG.gridSize;
        const size = CONFIG.gridSize;
        
        // 蛇头深一些，蛇身浅一些
        if (index === 0) {
            ctx.fillStyle = '#5c9c5c';
        } else {
            // 渐变变淡
            const lightness = 95 - (index / snake.length) * 15;
            ctx.fillStyle = `hsl(120, 35%, ${lightness}%)`;
        }
        
        // 简洁圆角矩形
        roundRect(ctx, x + 1, y + 1, size - 2, size - 2, 3);
        ctx.fill();
    });
    
    // 蛇头小眼睛
    if (snake.length > 0) {
        drawSnakeEyes();
    }
}

/**
 * 绘制蛇眼睛
 */
function drawSnakeEyes() {
    const head = snake[0];
    const x = head.x * CONFIG.gridSize;
    const y = head.y * CONFIG.gridSize;
    const size = CONFIG.gridSize;
    
    ctx.fillStyle = '#333';
    
    let eye1X, eye1Y, eye2X, eye2Y;
    const offset = size / 3;
    const eyeSize = 2.5;
    
    if (direction.x === 1) {
        eye1X = x + size - offset; eye1Y = y + offset;
        eye2X = x + size - offset; eye2Y = y + size - offset;
    } else if (direction.x === -1) {
        eye1X = x + offset; eye1Y = y + offset;
        eye2X = x + offset; eye2Y = y + size - offset;
    } else if (direction.y === -1) {
        eye1X = x + offset; eye1Y = y + offset;
        eye2X = x + size - offset; eye2Y = y + offset;
    } else {
        eye1X = x + offset; eye1Y = y + size - offset;
        eye2X = x + size - offset; eye2Y = y + size - offset;
    }
    
    ctx.beginPath();
    ctx.arc(eye1X, eye1Y, eyeSize, 0, Math.PI * 2);
    ctx.arc(eye2X, eye2Y, eyeSize, 0, Math.PI * 2);
    ctx.fill();
}

/**
 * 绘制圆角矩形
 */
function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

/**
 * 更新分数显示
 */
function updateScore() {
    scoreElement.textContent = score;
}

/**
 * 开始游戏
 */
function startGame() {
    if (isRunning) return;
    
    isRunning = true;
    startBtn.style.display = 'none';
    
    gameLoop = setInterval(() => {
        update();
        draw();
    }, CONFIG.gameSpeed);
}

/**
 * 暂停/继续游戏
 */
function togglePause() {
    if (!isRunning || isGameOver) return;
    
    isPaused = !isPaused;
    startBtn.textContent = isPaused ? '继续' : '暂停';
    startBtn.style.display = 'block';
}

/**
 * 结束游戏
 */
function endGame() {
    isGameOver = true;
    isRunning = false;
    
    if (gameLoop) {
        clearInterval(gameLoop);
        gameLoop = null;
    }
    
    finalScoreElement.textContent = score;
    gameOverPanel.style.display = 'block';
}

/**
 * 重新开始
 */
function restartGame() {
    if (gameLoop) {
        clearInterval(gameLoop);
        gameLoop = null;
    }
    
    initGame();
}

// 键盘控制
document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) {
        e.preventDefault();
    }
    
    if (key === ' ') {
        togglePause();
        return;
    }
    
    if (!isRunning && !isGameOver) {
        const validKeys = ['arrowup', 'w', 'arrowdown', 's', 'arrowleft', 'a', 'arrowright', 'd'];
        if (validKeys.includes(key)) {
            startGame();
        }
    }
    
    switch (key) {
        case 'arrowup':
        case 'w':
            if (direction.y !== 1) nextDirection = { x: 0, y: -1 };
            break;
        case 'arrowdown':
        case 's':
            if (direction.y !== -1) nextDirection = { x: 0, y: 1 };
            break;
        case 'arrowleft':
        case 'a':
            if (direction.x !== 1) nextDirection = { x: -1, y: 0 };
            break;
        case 'arrowright':
        case 'd':
            if (direction.x !== -1) nextDirection = { x: 1, y: 0 };
            break;
    }
});

// 按钮事件
startBtn.addEventListener('click', () => {
    if (!isRunning) {
        startGame();
    } else if (isPaused) {
        togglePause();
    }
});

restartBtn.addEventListener('click', restartGame);

// 初始化
document.addEventListener('DOMContentLoaded', initGame);

window.snakeGame = {
    start: startGame,
    restart: restartGame,
    pause: togglePause
};