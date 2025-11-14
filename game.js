// Canvas i kontekst za crtanje
var canvas = document.getElementById('gameCanvas');
var ctx = canvas.getContext('2d');

// Postavke za kockice
var BRICK_ROWS = 5;
var BRICK_COLS = 10;
var TOTAL_BRICKS = 50;
var BRICK_WIDTH = 60;
var BRICK_HEIGHT = 20;
var BRICK_HORIZONTAL_SPACING = 30;
var BRICK_VERTICAL_SPACING = 15;
// Postavke za platformu
var PADDLE_WIDTH = 100;
var PADDLE_HEIGHT = 15;
// Postavke za lopticu
var BALL_SIZE = 8;
var INITIAL_BALL_SPEED = 4;
var BALL_COLOR = 'white';
var PADDLE_COLOR = '#f5f5f5';

// Boje kockica po redovima
var BRICK_COLORS = [
    { r: 153, g: 51, b: 0 },
    { r: 255, g: 0, b: 0 },
    { r: 255, g: 153, b: 204 },
    { r: 0, g: 255, b: 0 },
    { r: 255, g: 255, b: 153 }
];

// Stanje igre i rezultati
var gameState = 'start';
var score = 0;
var bestScore = 0;
var bricks = [];

// Objekt platforme
var paddle = {
    x: 0,
    y: 0,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    speed: 8
};

// Objekt loptice
var ball = {
    x: 0,
    y: 0,
    size: BALL_SIZE,
    speedX: 0,
    speedY: 0,
    speed: INITIAL_BALL_SPEED
};

// Praćenje pritisnutih tipki
var keys = {};

// Učitava najbolji rezultat iz localStorage
function loadBestScore() {
    var stored = localStorage.getItem('breakout_best_score');
    if (stored !== null) {
        bestScore = parseInt(stored, 10);
    }
}

// Sprema najbolji rezultat ako je trenutni veći
function saveBestScore() {
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('breakout_best_score', bestScore.toString());
    }
}

// Inicijalizira sve kockice u mreži
function initBricks() {
    bricks = [];
    var startX = (canvas.width - (BRICK_COLS * BRICK_WIDTH + (BRICK_COLS - 1) * BRICK_HORIZONTAL_SPACING)) / 2;
    var startY = 50;

    for (var row = 0; row < BRICK_ROWS; row++) {
        for (var col = 0; col < BRICK_COLS; col++) {
            var brick = {
                x: startX + col * (BRICK_WIDTH + BRICK_HORIZONTAL_SPACING),
                y: startY + row * (BRICK_HEIGHT + BRICK_VERTICAL_SPACING),
                width: BRICK_WIDTH,
                height: BRICK_HEIGHT,
                color: BRICK_COLORS[row],
                destroyed: false
            };
            bricks.push(brick);
        }
    }
}

// Postavlja platformu na sredinu donjeg dijela ekrana
function initPaddle() {
    paddle.x = (canvas.width - paddle.width) / 2;
    paddle.y = canvas.height - paddle.height - 30;
}

// Postavlja lopticu iznad platforme i daje joj nasumičan smjer
function initBall() {
    ball.x = paddle.x + paddle.width / 2;
    ball.y = paddle.y - ball.size - 5;
    var direction = Math.random() < 0.5 ? -1 : 1;
    var angle = Math.PI / 4;
    ball.speedX = direction * ball.speed * Math.cos(angle);
    ball.speedY = -ball.speed * Math.sin(angle);
}

// Crtanje kockice s 3D efektom
function drawBrick(brick) {
    if (brick.destroyed) return;

    var x = brick.x;
    var y = brick.y;
    var w = brick.width;
    var h = brick.height;
    var c = brick.color;

    // Glavna boja kockice
    ctx.fillStyle = 'rgb(' + c.r + ',' + c.g + ',' + c.b + ')';
    ctx.fillRect(x, y, w, h);

    // Svjetlija rubna linija (gore i lijevo)
    ctx.strokeStyle = 'rgb(' + Math.min(255, c.r + 40) + ',' + Math.min(255, c.g + 40) + ',' + Math.min(255, c.b + 40) + ')';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + h);
    ctx.stroke();

    // Tamnija rubna linija (dolje i desno)
    ctx.strokeStyle = 'rgb(' + Math.max(0, c.r - 40) + ',' + Math.max(0, c.g - 40) + ',' + Math.max(0, c.b - 40) + ')';
    ctx.beginPath();
    ctx.moveTo(x + w, y);
    ctx.lineTo(x + w, y + h);
    ctx.moveTo(x, y + h);
    ctx.lineTo(x + w, y + h);
    ctx.stroke();
}

// Crtanje platforme s 3D efektom
function drawPaddle() {
    var x = paddle.x;
    var y = paddle.y;
    var w = paddle.width;
    var h = paddle.height;

    ctx.fillStyle = PADDLE_COLOR;
    ctx.fillRect(x, y, w, h);

    // Svjetliji rubovi
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + h);
    ctx.stroke();

    // Tamniji rubovi
    ctx.strokeStyle = '#cccccc';
    ctx.beginPath();
    ctx.moveTo(x + w, y);
    ctx.lineTo(x + w, y + h);
    ctx.moveTo(x, y + h);
    ctx.lineTo(x + w, y + h);
    ctx.stroke();
}

// Crtanje loptice s svjetlosnim efektom
function drawBall() {
    var x = ball.x;
    var y = ball.y;
    var size = ball.size;

    // Glavna boja
    ctx.fillStyle = BALL_COLOR;
    ctx.fillRect(x - size, y - size, size * 2, size * 2);

    // Svjetliji kvadrat (gore lijevo)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x - size + 2, y - size + 2, size, size);

    // Tamniji kvadrat (dolje desno)
    ctx.fillStyle = '#cccccc';
    ctx.fillRect(x, y, size, size);
}

// Početni ekran
function drawStartScreen() {
    ctx.fillStyle = 'white';
    ctx.font = 'bold 36px Helvetica, Verdana, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('BREAKOUT', canvas.width / 2, canvas.height / 2 - 10);

    ctx.font = 'bold italic 18px Helvetica, Verdana, sans-serif';
    ctx.fillText('Press SPACE to begin', canvas.width / 2, canvas.height / 2 + 30);
}

// Ekran za kraj igre
function drawGameOver() {
    ctx.fillStyle = 'yellow';
    ctx.font = 'bold 40px Helvetica, Verdana, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
}

// Ekran za pobjedu
function drawWinScreen() {
    ctx.fillStyle = 'yellow';
    ctx.font = 'bold 40px Helvetica, Verdana, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('YOU WIN!', canvas.width / 2, canvas.height / 2);
}

// Prikaz rezultata
function drawScore() {
    ctx.fillStyle = 'white';
    ctx.font = 'bold 18px Helvetica, Verdana, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('Score: ' + score, 20, 20);

    ctx.textAlign = 'right';
    ctx.fillText('Best: ' + bestScore, canvas.width - 100, 20);
}

// Provjerava koliziju između loptice i pravokutnika
function checkCollision(ball, rect) {
    return ball.x - ball.size < rect.x + rect.width &&
           ball.x + ball.size > rect.x &&
           ball.y - ball.size < rect.y + rect.height &&
           ball.y + ball.size > rect.y;
}

// Rukovanje kolizijom loptice i kockica
function handleBrickCollision() {
    for (var i = 0; i < bricks.length; i++) {
        var brick = bricks[i];
        if (brick.destroyed) continue;

        if (checkCollision(ball, brick)) {
            brick.destroyed = true;
            score++;
            saveBestScore();

            // Računanje pozicije za određivanje smjera odbijanja
            var ballCenterX = ball.x;
            var ballCenterY = ball.y;
            var brickCenterX = brick.x + brick.width / 2;
            var brickCenterY = brick.y + brick.height / 2;

            var dx = ballCenterX - brickCenterX;
            var dy = ballCenterY - brickCenterY;

            // Ako je udar u kut, odbija se u oba smjera i ubrzava
            var cornerThreshold = 5;
            var isCorner = Math.abs(dx) > (brick.width / 2 - cornerThreshold) &&
                           Math.abs(dy) > (brick.height / 2 - cornerThreshold);

            if (isCorner) {
                ball.speedX = -ball.speedX;
                ball.speedY = -ball.speedY;
                ball.speed *= 1.05;
                ball.speedX = ball.speedX > 0 ? ball.speed : -ball.speed;
                ball.speedY = ball.speedY > 0 ? ball.speed : -ball.speed;
            } else {
                // Inače odbija se samo u jednom smjeru
                if (Math.abs(dx) > Math.abs(dy)) {
                    ball.speedX = -ball.speedX;
                } else {
                    ball.speedY = -ball.speedY;
                }
            }

            return true;
        }
    }
    return false;
}

// Rukovanje kolizijom loptice i platforme
function handlePaddleCollision() {
    if (checkCollision(ball, paddle)) {
        // Smjer odbijanja ovisi o tome gdje loptice udari platformu
        var hitPos = (ball.x - paddle.x) / paddle.width;
        hitPos = Math.max(0, Math.min(1, hitPos));

        // Kut odbijanja ovisi o poziciji udara
        var angle = (hitPos - 0.5) * Math.PI / 3;
        ball.speedX = ball.speed * Math.sin(angle);
        ball.speedY = -Math.abs(ball.speed * Math.cos(angle));

        // Sprječava da loptice uđe u platformu
        if (ball.y < paddle.y) {
            ball.y = paddle.y - ball.size;
        }
    }
}

// Rukovanje kolizijom loptice sa zidovima
function handleWallCollision() {
    // Lijevi i desni zid
    if (ball.x - ball.size <= 5 || ball.x + ball.size >= canvas.width - 5) {
        ball.speedX = -ball.speedX;
        ball.x = Math.max(ball.size + 5, Math.min(canvas.width - ball.size - 5, ball.x));
    }

    // Gornji zid
    if (ball.y - ball.size <= 5) {
        ball.speedY = -ball.speedY;
        ball.y = ball.size + 5;
    }

    // Donji zid - gubitak
    if (ball.y + ball.size >= canvas.height - 5) {
        gameState = 'gameover';
        saveBestScore();
    }
}

// Ažuriranje pozicije platforme
function updatePaddle() {
    // Kretanje lijevo
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
        paddle.x = Math.max(5, paddle.x - paddle.speed);
    }
    // Kretanje desno
    if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        paddle.x = Math.min(canvas.width - paddle.width - 5, paddle.x + paddle.speed);
    }

    // Na početnom ekranu loptice prati platformu
    if (gameState === 'start') {
        ball.x = paddle.x + paddle.width / 2;
        ball.y = paddle.y - ball.size - 5;
    }
}

// Ažuriranje pozicije loptice i provjera kolizija
function updateBall() {
    if (gameState !== 'playing') return;

    // Pomicanje loptice
    ball.x += ball.speedX;
    ball.y += ball.speedY;

    // Provjera kolizija
    handleWallCollision();
    handleBrickCollision();
    handlePaddleCollision();

    // Provjera jesu li sve kockice uništene
    var allDestroyed = true;
    for (var i = 0; i < bricks.length; i++) {
        if (!bricks[i].destroyed) {
            allDestroyed = false;
            break;
        }
    }
    if (allDestroyed) {
        gameState = 'win';
        saveBestScore();
    }
}

// Glavna funkcija za crtanje svega na ekran
function draw() {
    // Crni pozadina
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Crtanje ovisno o stanju igre
    if (gameState === 'start') {
        drawStartScreen();
        drawPaddle();
        drawBall();
    } else if (gameState === 'gameover') {
        drawGameOver();
        drawScore();
    } else if (gameState === 'win') {
        drawWinScreen();
        drawScore();
    } else if (gameState === 'playing') {
        for (var i = 0; i < bricks.length; i++) {
            drawBrick(bricks[i]);
        }
        drawPaddle();
        drawBall();
        drawScore();
    }
}

// Glavna petlja igre
function gameLoop() {
    updatePaddle();
    updateBall();
    draw();
    requestAnimationFrame(gameLoop);
}

// Rukovanje pritiskom tipke
function handleKeyDown(e) {
    keys[e.key] = true;

    // Space za početak igre
    if (e.key === ' ') {
        e.preventDefault();
        if (gameState === 'start') {
            gameState = 'playing';
            initBall();
        }
    }
}

// Rukovanje otpuštanjem tipke
function handleKeyUp(e) {
    keys[e.key] = false;
}

// Inicijalizacija igre
function initGame() {
    loadBestScore();
    initBricks();
    initPaddle();
    initBall();
    draw();
}

// Event listeneri za tipkovnicu
window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);

// Pokretanje igre
initGame();
gameLoop();
