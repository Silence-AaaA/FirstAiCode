/**
 * 贪吃蛇游戏 - 核心逻辑（根目录版本）
 * 本次优化：提升蛇的可见度与“蛇感”，仅改渲染层
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 游戏配置
const CONFIG = {
    gridSize: 22,           // 格子大小（略加粗蛇身）
    tileCount: 18,          // 地图尺寸 18x18（适配画布 400x400 左右）
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
    // 初始蛇位置（头部在中间）
    const mid = Math.floor(CONFIG.tileCount / 2);
    snake = [
        { x: mid,     y: mid },     // 头部
        { x: mid,     y: mid + 1 }, // 身体
        { x: mid,     y: mid + 2 }  // 尾部
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
 * 生成食物（保证不与蛇体重叠）
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
 * 更新游戏状态（不动渲染，仅更新坐标与分数）
 */
function update() {
    if (!isRunning || isPaused || isGameOver) return;
    
    // 更新方向（防止直接反向）
    if (nextDirection.x !== -direction.x || nextDirection.y !== -direction.y) {
        direction = { ...nextDirection };
    }
    
    const head = { 
        x: snake[0].x + direction.x, 
        y: snake[0].y + direction.y 
    };
    
    // 撞墙
    if (head.x < 0 || head.x >= CONFIG.tileCount || 
        head.y < 0 || head.y >= CONFIG.tileCount) {
        endGame();
        return;
    }
    
    // 撞自己
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        endGame();
        return;
    }
    
    snake.unshift(head);
    
    // 吃到食物
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
    // 背景：深色但纯净，提升对比度
    ctx.fillStyle = '#0c1117';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    drawGrid();
    drawFood();
    drawSnake();
}

/**
 * 绘制网格线（细线，降低存在感）
 */
function drawGrid() {
    ctx.strokeStyle = '#161f2b';
    ctx.lineWidth = 0.5;
    
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
 * 绘制食物：适中饱和度的暖色圆点
 */
function drawFood() {
    const x = food.x * CONFIG.gridSize;
    const y = food.y * CONFIG.gridSize;
    const size = CONFIG.gridSize;
    
    ctx.fillStyle = '#f08a5b'; // 食物：#f08a5b 橙偏红
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2 - 4, 0, Math.PI * 2);
    ctx.fill();
}

/**
 * 绘制蛇：
 * - 颜色：青绿色系，和背景形成明显对比
 * - 形状：圆角矩形 + 轻微“拼接感”
 */
function drawSnake() {
    snake.forEach((segment, index) => {
        const x = segment.x * CONFIG.gridSize;
        const y = segment.y * CONFIG.gridSize;
        const size = CONFIG.gridSize;
        
        // 蛇头：更饱和、更亮一点
        if (index === 0) {
            ctx.fillStyle = '#27c499'; // 头：#27c499 中等偏亮青绿
        } else {
            // 身体：同色系稍微暗一点，形成层次
            const t = index / Math.max(snake.length, 8);
            const g = 196 - t * 40; // 绿色分量略递减
            const b = 153 - t * 20; // 蓝色分量略递减
            ctx.fillStyle = `rgb(39, ${g}, ${b})`;
        }
        
        // 身体形状：略粗的圆角矩形 + 中间留一点缝，让节段更连贯
        const padding = 3; // 留出小间距，避免一坨
        roundRect(
            ctx,
            x + padding,
            y + padding,
            size - padding * 2,
            size - padding * 2,
            6
        );
        ctx.fill();
    });
    
    if (snake.length > 0) {
        drawSnakeHeadDetails();
    }
}

/**
 * 绘制蛇头细节：更圆的头 + 简单的眼睛
 */
function drawSnakeHeadDetails() {
    const head = snake[0];
    const x = head.x * CONFIG.gridSize;
    const y = head.y * CONFIG.gridSize;
    const size = CONFIG.gridSize;
    
    // 额外的“头部圆角帽”，让头更圆润一点
    ctx.fillStyle = '#22b48b';
    const headPadding = 2;
    roundRect(
        ctx,
        x + headPadding,
        y + headPadding,
        size - headPadding * 2,
        size - headPadding * 2,
        8
    );
    ctx.fill();
    
    // 眼睛：小黑点，根据方向调整位置
    ctx.fillStyle = '#0b0b0d';
    const eyeRadius = 2;
    const offset = size / 3;
    let eye1X, eye1Y, eye2X, eye2Y;
    
    if (direction.x === 1) {          // 向右
        eye1X = x + size - offset;
        eye2X = x + size - offset;
        eye1Y = y + offset;
        eye2Y = y + size - offset;
    } else if (direction.x === -1) {  // 向左
        eye1X = x + offset;
        eye2X = x + offset;
        eye1Y = y + offset;
        eye2Y = y + size - offset;
    } else if (direction.y === -1) {  // 向上
        eye1X = x + offset;
        eye2X = x + size - offset;
        eye1Y = y + offset;
        eye2Y = y + offset;
    } else {                           // 向下
        eye1X = x + offset;
        eye2X = x + size - offset;
        eye1Y = y + size - offset;
        eye2Y = y + size - offset;
    }
    
    ctx.beginPath();
    ctx.arc(eye1X, eye1Y, eyeRadius, 0, Math.PI * 2);
    ctx.arc(eye2X, eye2Y, eyeRadius, 0, Math.PI * 2);
    ctx.fill();
}

/**
 * 绘制圆角矩形（渲染层工具函数）
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

// 键盘控制（逻辑保持不变）
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

startBtn.addEventListener('click', () => {
    if (!isRunning) {
        startGame();
    } else if (isPaused) {
        togglePause();
    }
});

restartBtn.addEventListener('click', restartGame);

document.addEventListener('DOMContentLoaded', initGame);

window.snakeGame = {
    start: startGame,
    restart: restartGame,
    pause: togglePause
};