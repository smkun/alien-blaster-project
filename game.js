// Game variables
let soldier;
let aliensContainer;
let aliens = [];
let bulletSpeed = 5;
let soldierSpeed = 8;
let gameLoopId;
let totalAliensSpawned = 0;
let maxAliens = 20;
let spawnIntervalId;

// Initialize the game
function init() {
  soldier = document.getElementById('soldier');
  aliensContainer = document.getElementById('aliens-container');
  
  document.getElementById('start-button').addEventListener('click', startGame);
}

// Start the game
function startGame() {
  document.getElementById('start-button').style.display = 'none';
  soldier.style.display = 'block';
  soldier.style.top = '50%';

  document.addEventListener('keydown', handleKeyDown);
  gameLoop();
  spawnAliensOverTime(); // New function to spawn aliens
}

// Function to spawn aliens at random intervals
function spawnAliensOverTime() {
  spawnIntervalId = setInterval(() => {
    if (totalAliensSpawned < maxAliens) {
      spawnAlien();
      totalAliensSpawned++;
    } else {
      clearInterval(spawnIntervalId); // Stop spawning when max is reached
    }
  }, 1000); // Spawn an alien every 1000 milliseconds (1 second)
}

// Function to spawn a single alien
function spawnAlien() {
  const alienTypes = ['red', 'green', 'yellow'];
  const alienType = alienTypes[Math.floor(Math.random() * alienTypes.length)];
  const alien = document.createElement('div');
  alien.className = `alien ${alienType}`;
  alien.style.right = '0px';

  // Calculate the available vertical space for spawning aliens
  const gameContainerHeight = document.getElementById('game-container').offsetHeight;
  const alienHeight = 50; // Adjust this value based on the actual alien height
  const availableSpace = gameContainerHeight - alienHeight;

  // Generate a random vertical position within the available space
  const randomTop = Math.random() * availableSpace;
  alien.style.top = `${randomTop}px`;

  alien.style.display = 'block';
  aliensContainer.appendChild(alien);
  aliens.push(alien);
}

// Handle key down events
function handleKeyDown(event) {
  switch (event.keyCode) {
    case 38: // Up arrow
      soldier.style.top = `${Math.max(soldier.offsetTop - soldierSpeed, 0)}px`;
      break;
    case 40: // Down arrow
      soldier.style.top = `${Math.min(soldier.offsetTop + soldierSpeed, document.getElementById('game-container').offsetHeight - soldier.offsetHeight)}px`;
      break;
    case 32: // Space bar
      shootBullet();
      break;
  }
}

// Shoot a bullet from the soldier
function shootBullet() {
  let bullet = document.createElement('div');
  bullet.className = 'bullet';
  bullet.style.left = `${soldier.offsetLeft + soldier.offsetWidth}px`;
  bullet.style.top = `${soldier.offsetTop + soldier.offsetHeight / 2}px`;
  document.getElementById('game-container').appendChild(bullet);

  let bulletInterval = setInterval(() => {
    bullet.style.left = `${bullet.offsetLeft + bulletSpeed}px`;

    for (let i = 0; i < aliens.length; i++) {
      if (checkCollision(bullet, aliens[i])) {
        aliens[i].remove();
        aliens.splice(i, 1);
        updateScore(aliens[i].classList[1]);
        bullet.remove();
        clearInterval(bulletInterval);
        break;
      }
    }

    if (bullet.offsetLeft > document.getElementById('game-container').offsetWidth) {
      bullet.remove();
      clearInterval(bulletInterval);
    }
  }, 10);
}

function checkCollision(el1, el2) {
  let rect1 = el1.getBoundingClientRect();
  let rect2 = el2.getBoundingClientRect();

  return (
    rect1.left < rect2.right &&
    rect1.right > rect2.left &&
    rect1.top < rect2.bottom &&
    rect1.bottom > rect2.top
  );
}

function updateScore(alienType) {
  const scoreElement = document.getElementById('score');
  let score = parseInt(scoreElement.textContent);

  if (alienType === 'red') {
    score += 1;
  } else if (alienType === 'green') {
    score += 2;
  } else if (alienType === 'yellow') {
    score += 3;
  }

  scoreElement.textContent = score;
}

function updateHealth() {
  const healthElement = document.getElementById('health');
  let health = parseInt(healthElement.textContent);

  health -= 1;
  healthElement.textContent = health;

  if (health <= 0) {
    endGame();
  }
}

function endGame() {
  cancelAnimationFrame(gameLoopId);
  alert('Game Over!');
  location.reload();
}

// Game loop
function gameLoop() {
  for (let i = 0; i < aliens.length; i++) {
    let alienSpeed = 1;
    if (aliens[i].classList.contains('green')) {
      alienSpeed = 2;
    } else if (aliens[i].classList.contains('yellow')) {
      alienSpeed = 0.5;
    }
    aliens[i].style.left = `${aliens[i].offsetLeft - alienSpeed}px`;

    if (
      checkCollision(aliens[i], soldier) ||
      aliens[i].offsetLeft + aliens[i].offsetWidth < 0
    ) {
      aliens[i].remove();
      aliens.splice(i, 1);
      updateHealth();
    }
  }

  gameLoopId = requestAnimationFrame(gameLoop);
}

window.onload = init;
