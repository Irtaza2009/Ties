const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const center = { x: canvas.width / 2, y: canvas.height / 2 };
const arenaRadius = 250;

// player ball
const player = {
  x: center.x + 100,
  y: center.y,
  radius: 10,
  color: 'lime',
  vx: 2,
  vy: 0,
  canChangeDir: false,
  glow: false,
  ties: [],
  tiesCount: 0
};

// ai ball
const ai = {
  x: center.x - 100,
  y: center.y,
  radius: 10,
  color: 'red',
  vx: 1.5,
  vy: 1,
  ties: [],
  tiesCount: 0
};

const directionInterval = 5000;
let lastDirectionTime = 0;
let lastAIDirectionTime = 0; // Track last AI direction change

const keys = {};
window.addEventListener('keydown', (e) => keys[e.key] = true);
window.addEventListener('keyup', (e) => keys[e.key] = false);

let speedMultiplier = 1;
let lastSpeedIncrease = 0;
const speedIncreaseInterval = 3000; // ms
const speedStep = 0.1; // how much to increase each interval

function updatePlayer(time) {
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

    if (dx !== 0 || dy !== 0) {
      const length = Math.sqrt(dx * dx + dy * dy);
      dx /= length;
      dy /= length;

      const baseSpeed = 2;
      player.vx = dx * baseSpeed * speedMultiplier;
      player.vy = dy * baseSpeed * speedMultiplier;

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

function updateAI(time) {
  ai.x += ai.vx;
  ai.y += ai.vy;

  ai.vx += (Math.random() - 0.5) * 0.05;
  ai.vy += (Math.random() - 0.5) * 0.05;

  // change AI direction every 5 seconds
  if (time - lastAIDirectionTime > directionInterval) {
    // pick a random direction
    const angle = Math.random() * Math.PI * 2;
    const baseSpeed = 1.5 * speedMultiplier;
    ai.vx = Math.cos(angle) * baseSpeed;
    ai.vy = Math.sin(angle) * baseSpeed;
    lastAIDirectionTime = time;
  }

  // gradually increase AI speed
  const aiSpeed = Math.sqrt(ai.vx * ai.vx + ai.vy * ai.vy);
  const maxAISpeed = 2 * speedMultiplier;
  if (aiSpeed > maxAISpeed) {
    ai.vx *= maxAISpeed / aiSpeed;
    ai.vy *= maxAISpeed / aiSpeed;
  }

  checkBounce(ai);
}

function checkBounce(ball) {
  const dx = ball.x - center.x;
  const dy = ball.y - center.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist + ball.radius >= arenaRadius) {
    const nx = dx / dist;
    const ny = dy / dist;

    const impactX = center.x + nx * arenaRadius;
    const impactY = center.y + ny * arenaRadius;

    const dot = ball.vx * nx + ball.vy * ny;
    ball.vx -= 2 * dot * nx;
    ball.vy -= 2 * dot * ny;

    const overlap = dist + ball.radius - arenaRadius;
    ball.x -= nx * overlap;
    ball.y -= ny * overlap;

    // tie line that follows the ball 
    ball.ties.push({
      x1: impactX,
      y1: impactY
    });
    ball.tiesCount = ball.tiesCount + 1;
  }
}

// check if a ball intersects a line segment
function ballIntersectsLine(ball, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSq = dx * dx + dy * dy;
  let t = ((ball.x - x1) * dx + (ball.y - y1) * dy) / lengthSq;
  t = Math.max(0, Math.min(1, t));
  const closestX = x1 + t * dx;
  const closestY = y1 + t * dy;
  const distSq = (ball.x - closestX) ** 2 + (ball.y - closestY) ** 2;
  return distSq <= ball.radius * ball.radius;
}

// remove ties cut
function checkTieCuts(ball, otherBall) {
  ball.ties = ball.ties.filter(tie => {
    return !ballIntersectsLine(otherBall, tie.x1, tie.y1, ball.x, ball.y);
  });
}

function drawCircle() {
  ctx.beginPath();
  ctx.arc(center.x, center.y, arenaRadius, 0, Math.PI * 2);
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawBall(ball) {
  ctx.save();
  if (ball.glow) {
    ctx.shadowColor = ball.color;
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius + 3, 0, Math.PI * 2);
    ctx.strokeStyle = ball.color;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = ball.color;
  ctx.fill();
  ctx.restore();
}

function drawTies(ball) {
  ctx.beginPath();
  for (const tie of ball.ties) {
    ctx.moveTo(tie.x1, tie.y1);
    ctx.lineTo(ball.x, ball.y); // follows ball
  }
  ctx.strokeStyle = ball.color;
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

const gameoverDiv = document.getElementById('gameover');
const gameoverText = document.getElementById('gameover-text');
const restartBtn = document.getElementById('restart-btn');
const startPopup = document.getElementById('start-popup');
const startBtn = document.getElementById('start-btn');

let gameEnded = false;
let gameStarted = false;

function checkWinLose() {
  // start checking if both have at least one tie
  if (player.tiesCount === 0 || ai.tiesCount === 0) return;

  if (!gameEnded) {
    if (player.ties.length > 0 && ai.ties.length === 0) {
      showGameover('You Win!');
      gameEnded = true;
    } else if (ai.ties.length > 0 && player.ties.length === 0) {
      showGameover('You Lose!');
      gameEnded = true;
    }
  }
}

function showGameover(text) {
  gameoverText.textContent = text;
  gameoverDiv.classList.remove('hidden');
}

function restartGame() {
  // reset positions
  player.x = center.x + 100;
  player.y = center.y;
  player.vx = 2;
  player.vy = 0;
  player.ties = [];
  player.tiesCount = 0;
  player.canChangeDir = false;
  player.glow = false;

  ai.x = center.x - 100;
  ai.y = center.y;
  ai.vx = 1.5;
  ai.vy = 1;
  ai.ties = [];
  ai.tiesCount = 0;

  lastDirectionTime = 0;
  lastAIDirectionTime = 0; // reset AI direction timer
  gameEnded = false;
  gameStarted = true;
  gameoverDiv.classList.add('hidden');

  // reset speed
  speedMultiplier = 1;
  lastSpeedIncrease = 0;

  gameLoop(0);
}

restartBtn.addEventListener('click', restartGame);

startBtn.addEventListener('click', () => {
  startPopup.classList.add('hidden');
  gameStarted = true;
  gameLoop(0);
});


function gameLoop(time) {
  if (!gameStarted) return;
  if (gameEnded) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawCircle();

  // gradually increase speed
  if (time - lastSpeedIncrease > speedIncreaseInterval) {
    speedMultiplier += speedStep;
    lastSpeedIncrease = time;
  }

  updatePlayer(time);
  updateAI(time);

  checkTieCuts(player, ai); // ai cuts player's ties
  checkTieCuts(ai, player); // player cuts ai's ties

  drawTies(player);
  drawTies(ai);
  drawBall(player);
  drawBall(ai);

  checkWinLose();

  if (!gameEnded) requestAnimationFrame(gameLoop);
}

gameLoop(0);