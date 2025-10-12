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
    vx: 2,
    vy: 0,
    canChangeDir: false,
    glow: false
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

// direction change interval
const directionInterval = 5000; // 5s
let lastDirectionTime = 0; 

const keys = {};
window.addEventListener('keydown', (e) => keys[e.key] = true);
window.addEventListener('keyup', (e) => keys[e.key] = false);

function updatePlayer(time) {

    // direction change every interval
    if (time - lastDirectionTime > directionInterval) {
        player.canChangeDir = true;
        player.glow = true;
    }

    if (player.canChangeDir) {
        let dx = 0;
        let dy = 0;

        if (keys['ArrowUp']) dy -= 1;
        if (keys['ArrowDown']) dy += 1;
        if (keys['ArrowLeft']) dx -= 1;
        if (keys['ArrowRight']) dx += 1;

        // if any direction pressed
        if (dx !== 0 || dy !== 0) {

            // normalise vector (so diagonals aren't faster)
            const length = Math.sqrt(dx * dx + dy * dy);
            dx /= length;
            dy /= length;

            const speed = 2;
            player.vx = dx * speed;
            player.vy = dy * speed;

            lockDirectionChange(time);
        }
    }

    player.x += player.vx;
    player.y += player.vy;

    checkBounce(player);
}

function lockDirectionChange(time) {
    player.canChangeDir = false;
    player.glow = false;
    lastDirectionTime = time;
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

    if (ball.glow) {
        ctx.shadowColor = ball.color;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius + 3, 0, Math.PI * 2);
        ctx.strokeStyle = ball.color;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.shadowBlur = 0;
    }
}

function gameLoop(time) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawCircle();

    updatePlayer(time);
    updateAI();

    drawBall(player);
    drawBall(ai);

    requestAnimationFrame(gameLoop);
}

gameLoop(0);
