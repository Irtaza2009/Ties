const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const center = { x: canvas.width / 2, y: canvas.height / 2 };
const arenaRadius = 250;

// player ball
const player = {
    x: center.x + 100,
    y: center.y,
    radius: 10,
    color: "lime",
    vx: 0,
    vy: 0,
    speed: 2,
};

// ai ball
const ai = {
    x: center.x - 100,
    y: center.y,
    radius: 10,
    color: "red",
    vx: 1.5,
    vy: 1
};

const keys = {};

window.addEventListener('keydown', (e) => keys[e.key] = true);
window.addEventListener('keyup', (e) => keys[e.key] = false);

function updatePlayer() {
    if (keys['ArrowUp']) player.vy -= 0.1;
    if (keys['ArrowDown']) player.vy += 0.1;
    if (keys['ArrowLeft']) player.vx -= 0.1;
    if (keys['ArrowRight']) player.vx += 0.1;

    player.x += player.vx;
    player.y += player.vy;

    // friction
    player.vx *= 0.98;
    player.vy *= 0.98;

    checkBounce(player);
}

function updateAI() {
    ai.x += ai.vx;
    ai.y += ai.vy;

    // simple random drift ai
    ai.vx += (Math.random() - 0.5) * 0.05;
    ai.vy += (Math.random() - 0.5) * 0.05;

    checkBounce(ai);
}

function checkBounce(ball) {
    const dx = ball.x - center.x;
    const dy = ball.y - center.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance + ball.radius > arenaRadius) {

        // normal vector
        const nx = dx / distance;
        const ny = dy / distance;

        // reflect velocity
        const dot = ball.vx * nx + ball.vy * ny;
        ball.vx -= 2 * dot * nx;
        ball.vy -= 2 * dot * ny;

        // push ball slightly inside
        const overlap = (distance + ball.radius) - arenaRadius;
        ball.x -= overlap * nx;
        ball.y -= overlap * ny;
    }
}

function drawCircle() {
    ctx.beginPath();
    ctx.arc(center.x, center.y, arenaRadius, 0, Math.PI * 2);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();
}

function drawBall(ball) {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.fill();
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawCircle();

    updatePlayer();
    updateAI();

    drawBall(player);
    drawBall(ai);

    requestAnimationFrame(gameLoop);
}

gameLoop();
