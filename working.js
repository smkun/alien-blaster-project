// Declaration of global variables
let soldier;
let aliensContainer;
let aliens = [];
let bulletSpeed = 5;
let rocketSpeed = 8;
let soldierSpeed = 12;
let gameLoopId;
let totalAliensSpawned = 0;
let maxAliens = 20;
let spawnIntervalId;
let maxRockets = 20;
let currentWave = 1;
let maxAliensPerWave = 20;
let waveIncreaseFactor = 0.1;
let isWaveInProgress = false;
let highScores = [];

// Initialization function
function init() {
    soldier = document.getElementById("soldier");
    aliensContainer = document.getElementById("aliens-container");
    document.getElementById("ammo").textContent = maxRockets;
    updateHighScoresList();
    document
        .getElementById("start-button")
        .addEventListener("click", startGame);
    document
        .getElementById("next-wave-button")
        .addEventListener("click", startNextWave);
    document.getElementById("next-wave-button").style.display = "none";
}

// Start the game
function startGame() {
    document.getElementById("start-button").style.display = "none";
    soldier.style.display = "block";
    soldier.style.top = "50%";
    currentWave = 1;
    document.addEventListener("keydown", handleKeyDown);
    gameLoop();
    startWave();
}

// Start a new wave
function startWave() {
    isWaveInProgress = true;
    totalAliensSpawned = 0;
    spawnAliensOverTime();
}

// Start the next wave
function startNextWave() {
    if (!isWaveInProgress) {
        document.getElementById("next-wave-button").style.display = "none";
        soldier.style.display = "block";
        isWaveInProgress = true;
        maxAliens = Math.floor(
            maxAliensPerWave * (1 + waveIncreaseFactor * currentWave)
        );
        currentWave++;
        document.getElementById("wave").textContent = currentWave;

        startWave();
    }
}

// Spawn aliens over time
function spawnAliensOverTime() {
    spawnIntervalId = setInterval(() => {
        if (totalAliensSpawned < maxAliens) {
            spawnAlien();
            totalAliensSpawned++;

            if (totalAliensSpawned % 5 === 0) {
                if (Math.random() < 0.5) {
                    spawnHealthPack();
                } else {
                    spawnAmmoPack();
                }
            }
        } else {
            clearInterval(spawnIntervalId);
            checkForWaveCompletion();
        }
    }, 1000);
}

// Check if the current wave is completed
function checkForWaveCompletion() {
    if (totalAliensSpawned >= maxAliens && aliens.length === 0) {
        isWaveInProgress = false;
        if (parseInt(document.getElementById("health").textContent) > 0) {
            document.getElementById("next-wave-button").style.display = "block";
        }
    }
}

// Update the high scores list
function updateHighScoresList() {
    const highScoresList = document.getElementById("high-scores-list");
    highScoresList.innerHTML = "";

    highScores.forEach((score) => {
        const li = document.createElement("li");
        li.textContent = `${score.name} - ${score.score}`;
        highScoresList.appendChild(li);
    });
}

// Spawn an alien
function spawnAlien() {
    const alienTypes = ["red", "green", "yellow"];
    const alienType = alienTypes[Math.floor(Math.random() * alienTypes.length)];
    const alien = document.createElement("div");
    alien.className = `alien ${alienType}`;
    alien.style.right = "0px";
    const gameContainerHeight =
        document.getElementById("game-container").offsetHeight;
    const alienHeight = 50;
    const availableSpace = gameContainerHeight - alienHeight;
    const randomTop = Math.random() * availableSpace;
    alien.style.top = `${randomTop}px`;
    alien.style.display = "block";
    let health;
    if (alienType === "yellow") {
        health = 8;
    } else if (alienType === "red") {
        health = 2; // Set the health of red aliens to 2
    } else {
        health = 1;
    }
    alien.setAttribute("data-health", health);
    aliensContainer.appendChild(alien);
    aliens.push(alien);

    if (alienType === "yellow") {
        const healthBar = document.createElement("div");
        healthBar.className = "health-bar";
        healthBar.style.width = "90%";
        healthBar.style.height = "5px";
        healthBar.style.backgroundColor = "green";
        alien.appendChild(healthBar);
    }
}

// Handle keydown events
function handleKeyDown(event) {
    switch (event.keyCode) {
        case 38:
            soldier.style.top = `${Math.max(
                soldier.offsetTop - soldierSpeed,
                0
            )}px`;
            break;
        case 40:
            soldier.style.top = `${Math.min(
                soldier.offsetTop + soldierSpeed,
                document.getElementById("game-container").offsetHeight -
                    soldier.offsetHeight
            )}px`;
            break;
        case 32:
            shootBullet();
            break;
        case 82:
            shootRocket();
            break;
    }
}

// Shoot a bullet
function shootBullet() {
    let bullet = document.createElement("div");
    bullet.className = "bullet";
    bullet.style.left = `${soldier.offsetLeft + soldier.offsetWidth}px`;
    bullet.style.top = `${
        soldier.offsetTop + soldier.offsetHeight / 2 - 2.5
    }px`;
    document.getElementById("game-container").appendChild(bullet);

    let bulletInterval = setInterval(() => {
        bullet.style.left = `${bullet.offsetLeft + bulletSpeed}px`;

        for (let i = 0; i < aliens.length; i++) {
            if (checkCollision(bullet, aliens[i])) {
                let health =
                    parseInt(aliens[i].getAttribute("data-health")) - 1;
                aliens[i].setAttribute("data-health", health);

                if (health <= 0) {
                    updateScore(aliens[i].classList[1]);
                    aliens[i].remove();
                    aliens.splice(i, 1);
                }

                if (aliens[i].classList.contains("yellow")) {
                    const healthBar = aliens[i].querySelector(".health-bar");
                    const health = parseInt(
                        aliens[i].getAttribute("data-health")
                    );
                    healthBar.style.width = `${(health / 8) * 100}%`;
                }

                bullet.remove();
                clearInterval(bulletInterval);
                break;
            }
        }

        if (
            bullet.offsetLeft >
            document.getElementById("game-container").offsetWidth
        ) {
            bullet.remove();
            clearInterval(bulletInterval);
        }
    }, 10);
}

// Shoot a rocket
function shootRocket() {
    let currentAmmo = parseInt(document.getElementById("ammo").textContent);
    if (currentAmmo > 0) {
        let rocket = document.createElement("div");
        rocket.className = "rocket";
        rocket.style.left = `${soldier.offsetLeft + soldier.offsetWidth}px`;
        rocket.style.top = `${
            soldier.offsetTop + soldier.offsetHeight / 2 - 2.5
        }px`;
        document.getElementById("game-container").appendChild(rocket);

        let rocketInterval = setInterval(() => {
            rocket.style.left = `${rocket.offsetLeft + rocketSpeed}px`;

            for (let i = 0; i < aliens.length; i++) {
                if (checkCollision(rocket, aliens[i])) {
                    let health =
                        parseInt(aliens[i].getAttribute("data-health")) - 5;
                    aliens[i].setAttribute("data-health", health);

                    if (health <= 0) {
                        updateScore(aliens[i].classList[1]);
                        aliens[i].remove();
                        aliens.splice(i, 1);
                    }

                    if (aliens[i].classList.contains("yellow")) {
                        const healthBar =
                            aliens[i].querySelector(".health-bar");
                        const health = parseInt(
                            aliens[i].getAttribute("data-health")
                        );
                        healthBar.style.width = `${(health / 8) * 100}%`;
                    }

                    rocket.remove();
                    clearInterval(rocketInterval);
                    break;
                }
            }

            if (
                rocket.offsetLeft >
                document.getElementById("game-container").offsetWidth
            ) {
                rocket.remove();
                clearInterval(rocketInterval);
            }
        }, 10);
        document.getElementById("ammo").textContent = currentAmmo - 1;
    }
}

// Spawn a health pack
function spawnHealthPack() {
    const healthPack = document.createElement("div");
    healthPack.className = "health-pack";
    healthPack.style.right = "0px";
    const gameContainerHeight =
        document.getElementById("game-container").offsetHeight;
    const healthPackHeight = 30;
    const availableSpace = gameContainerHeight - healthPackHeight;
    const randomTop = Math.random() * availableSpace;
    healthPack.style.top = `${randomTop}px`;
    healthPack.style.display = "block";
    aliensContainer.appendChild(healthPack);
}

// Spawn an ammo pack
function spawnAmmoPack() {
    const ammoPack = document.createElement("div");
    ammoPack.className = "ammo-pack";
    ammoPack.style.right = "0px";
    const gameContainerHeight =
        document.getElementById("game-container").offsetHeight;
    const ammoPackHeight = 30;
    const availableSpace = gameContainerHeight - ammoPackHeight;
    const randomTop = Math.random() * availableSpace;
    ammoPack.style.top = `${randomTop}px`;
    ammoPack.style.display = "block";
    aliensContainer.appendChild(ammoPack);
}

// Check collision between two elements
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

// Update the score based on the alien type
function updateScore(alienType) {
    const scoreElement = document.getElementById("score");
    let score = parseInt(scoreElement.textContent);

    if (alienType === "red") {
        score += 2;
    } else if (alienType === "green") {
        score += 1;
    } else if (alienType === "yellow") {
        score += 4;
    }

    scoreElement.textContent = score;
}

// Update the health of the soldier
function updateHealth(amount = -1) {
    const healthElement = document.getElementById("health");
    let health = parseInt(healthElement.textContent);

    health = Math.min(health + amount, 50);
    healthElement.textContent = health;

    if (health <= 0) {
        endGame();
    }
}

// Update the ammo count
function updateAmmo(amount) {
    const ammoElement = document.getElementById("ammo");
    let ammo = parseInt(ammoElement.textContent);

    ammo = Math.min(ammo + amount, maxRockets);
    ammoElement.textContent = ammo;
}

// End the game
function endGame() {
    cancelAnimationFrame(gameLoopId);
    clearInterval(spawnIntervalId);

    while (aliensContainer.firstChild) {
        aliensContainer.firstChild.remove();
    }

    const gameOverElement = document.getElementById("game-over");
    gameOverElement.innerHTML = "";

    const imageElement = document.createElement("img");
    imageElement.src = "images/gameOver.png";
    imageElement.alt = "Game Over Image";
    imageElement.style.width = "50%";
    imageElement.style.display = "block";
    imageElement.style.margin = "0 auto";
    gameOverElement.appendChild(imageElement);

    const playerNameInput = document.createElement("input");
    playerNameInput.type = "text";
    playerNameInput.placeholder = "Enter your name";
    playerNameInput.id = "player-name";
    playerNameInput.style.display = "block";
    playerNameInput.style.margin = "20px auto";
    playerNameInput.style.width = "80%";
    playerNameInput.style.padding = "10px";
    playerNameInput.style.fontSize = "18px";
    playerNameInput.style.textAlign = "center";
    gameOverElement.appendChild(playerNameInput);

    const submitButton = document.createElement("button");
    submitButton.textContent = "Submit Score";
    submitButton.id = "submit-score";
    submitButton.style.display = "block";
    submitButton.style.margin = "10px auto";
    submitButton.style.padding = "10px 20px";
    submitButton.style.fontSize = "24px";
    submitButton.style.cursor = "pointer";
    submitButton.style.borderRadius = "5px";
    submitButton.style.backgroundColor = "blue";
    submitButton.style.color = "lightgray";
    gameOverElement.appendChild(submitButton);

    submitButton.addEventListener("click", function () {
        submitHighScore(parseInt(document.getElementById("score").textContent));
    });

    document.getElementById("soldier").style.display = "none";
    document.getElementById("next-wave-button").style.display = "none";
}

// Submit high score
function submitHighScore(score) {
    const playerName = document.getElementById("player-name").value;
    if (!playerName) {
        alert("Please enter your name.");
        return;
    }

    highScores.push({ name: playerName, score: score });
    highScores.sort((a, b) => b.score - a.score);
    updateHighScoresList();

    document.getElementById("game-over").innerHTML = "";
    restartGame();
}

// Restart the game
function restartGame() {
    aliens = [];
    totalAliensSpawned = 0;
    currentWave = 1;
    document.getElementById("wave").textContent = currentWave;
    document.getElementById("score").textContent = "0";
    document.getElementById("health").textContent = "50";
    document.getElementById("ammo").textContent = maxRockets;

    document.getElementById("start-button").style.display = "block";
    document.getElementById("soldier").style.display = "none";

    cancelAnimationFrame(gameLoopId);
    clearInterval(spawnIntervalId);
}
// Game loop
function gameLoop() {
    for (let i = 0; i < aliens.length; i++) {
        let alienSpeed = 2;
        if (aliens[i].classList.contains("green")) {
            alienSpeed = 3;
        } else if (aliens[i].classList.contains("yellow")) {
            alienSpeed = 1;
        }
        aliens[i].style.left = `${aliens[i].offsetLeft - alienSpeed}px`;

        if (
            checkCollision(aliens[i], soldier) ||
            aliens[i].offsetLeft + aliens[i].offsetWidth < 0
        ) {
            aliens[i].remove();
            aliens.splice(i, 1);
            i--;
            updateHealth();
        }

        if (aliens[i] && aliens[i].classList.contains("yellow")) {
            const healthBar = aliens[i].querySelector(".health-bar");
            const health = parseInt(aliens[i].getAttribute("data-health"));
            if (health >= 3 && health <= 7) {
                healthBar.style.backgroundColor = "yellow";
            } else if (health >= 1 && health <= 2) {
                healthBar.style.backgroundColor = "red";
            }
        }
    }

    const healthPacks = document.getElementsByClassName("health-pack");
    for (let i = 0; i < healthPacks.length; i++) {
        healthPacks[i].style.left = `${healthPacks[i].offsetLeft - 2}px`;
        if (checkCollision(healthPacks[i], soldier)) {
            healthPacks[i].remove();
            updateHealth(3);
        } else if (healthPacks[i].offsetLeft + healthPacks[i].offsetWidth < 0) {
            healthPacks[i].remove();
        }
    }

    const ammoPacks = document.getElementsByClassName("ammo-pack");
    for (let i = 0; i < ammoPacks.length; i++) {
        ammoPacks[i].style.left = `${ammoPacks[i].offsetLeft - 2}px`;
        if (checkCollision(ammoPacks[i], soldier)) {
            ammoPacks[i].remove();
            updateAmmo(3);
        } else if (ammoPacks[i].offsetLeft + ammoPacks[i].offsetWidth < 0) {
            ammoPacks[i].remove();
        }
    }

    if (totalAliensSpawned >= maxAliens && aliens.length === 0) {
        checkForWaveCompletion();
    }
    gameLoopId = requestAnimationFrame(gameLoop);
}

// Initialization function
window.onload = init;
