// Declaration of global variables
let soldier;
let aliensContainer;
let aliens = [];
let LaserSpeed = 5;
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
    soldier = $("#soldier");
    aliensContainer = $("#aliens-container");
    $("#ammo").text(maxRockets);
    updateHighScoresList();
    $("#start-button").on("click", startGame);
    $("#next-wave-button").on("click", startNextWave);
    $("#next-wave-button").hide();

    // Get the background music element
    const backgroundMusic = $("#background-music")[0];
    // Set the default volume
    backgroundMusic.volume = 0.08;
    // Add the event listener for the mute button
    $("#mute-button").on("click", function () {
        if (backgroundMusic.paused) {
            backgroundMusic.play();
            $(this).text("Mute");
        } else {
            backgroundMusic.pause();
            $(this).text("Unmute");
        }
    });
}

// Start the game
function startGame() {
    $("#start-button").hide();
    soldier.show();
    soldier.css("top", "50%");
    currentWave = 1;
    const backgroundMusic = $("#background-music")[0];
    $(document).on("keydown", handleKeyDown);
    backgroundMusic.play();
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
        $("#next-wave-button").hide();
        soldier.show();
        isWaveInProgress = true;
        maxAliens = Math.floor(
            maxAliensPerWave * (1 + waveIncreaseFactor * currentWave)
        );
        currentWave++;
        $("#wave").text(currentWave);

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
        if (parseInt($("#health").text()) > 0) {
            $("#next-wave-button").show();
        }
    }
}

// Update the high scores list
function updateHighScoresList() {
    const highScoresList = $("#high-scores-list");
    highScoresList.empty();

    highScores.forEach((score) => {
        const li = $("<li>").text(`${score.name} - ${score.score}`);
        highScoresList.append(li);
    });
}

// Spawn an alien
function spawnAlien() {
    const alienTypes = ["red", "green", "yellow"];
    const alienType = alienTypes[Math.floor(Math.random() * alienTypes.length)];
    const alien = $("<div>").addClass(`alien ${alienType}`).css("right", "0px");
    const gameContainerHeight = $("#game-container").height();
    const alienHeight = 60;
    const availableSpace = gameContainerHeight - alienHeight;
    const randomTop = Math.random() * availableSpace;
    alien.css("top", `${randomTop}px`).show();
    let health;
    if (alienType === "yellow") {
        health = 8;
    } else if (alienType === "red") {
        health = 2; 
    } else {
        health = 1;
    }
    alien.attr("data-health", health);
    aliensContainer.append(alien);
    aliens.push(alien);

    if (alienType === "yellow") {
        const healthBar = $("<div>")
            .addClass("health-bar")
            .css({
                width: "90%",
                height: "5px",
                backgroundColor: "green"
            });
        alien.append(healthBar);
    }
}

// Handle keydown events
function handleKeyDown(event) {
    switch (event.keyCode) {
        case 38:
            soldier.css("top", `${Math.max(soldier.position().top - soldierSpeed, 0)}px`);
            break;
        case 40:
            soldier.css("top", `${Math.min(soldier.position().top + soldierSpeed, $("#game-container").height() - soldier.height())}px`);
            break;
        case 32:
            shootLaser();
            break;
        case 82:
            shootRocket();
            break;
    }
}

function playLaserSound() {
    const rocketSound = $("#laser-sound")[0];
    rocketSound.currentTime = 0;
    rocketSound.volume = 0.5;
    rocketSound.play();
}

// Shoot a Laser
function shootLaser() {
    let Laser = $("<div>")
        .addClass("Laser")
        .css({
            left: `${soldier.position().left + soldier.width()}px`,
            top: `${soldier.position().top + soldier.height() / 2 - 2.5}px`
        });
    $("#game-container").append(Laser);
    playLaserSound();

    let LaserInterval = setInterval(() => {
        Laser.css("left", `${Laser.position().left + LaserSpeed}px`);

        for (let i = 0; i < aliens.length; i++) {
            if (checkCollision(Laser[0], aliens[i])) {
                let health = parseInt($(aliens[i]).attr("data-health")) - 1;
                $(aliens[i]).attr("data-health", health);

                if (health <= 0) {
                    updateScore(aliens[i].classList[1]);
                    $(aliens[i]).remove();
                    aliens.splice(i, 1);
                }

                if ($(aliens[i]).hasClass("yellow")) {
                    const healthBar = $(aliens[i]).find(".health-bar");
                    const health = parseInt($(aliens[i]).attr("data-health"));
                    healthBar.css("width", `${(health / 8) * 100}%`);
                }

                Laser.remove();
                clearInterval(LaserInterval);
                break;
            }
        }

        if (Laser.position().left > $("#game-container").width()) {
            Laser.remove();
            clearInterval(LaserInterval);
        }
    }, 10);
}

function playRocketSound() {
    const rocketSound = $("#rocket-sound")[0];
    rocketSound.currentTime = 0;
    rocketSound.volume = 0.5;
    rocketSound.play();
}

// Shoot a rocket
function shootRocket() {
    let currentAmmo = parseInt($("#ammo").text());
    if (currentAmmo > 0) {
        playRocketSound();
        let rocket = $("<div>")
            .addClass("rocket")
            .css({
                left: `${soldier.position().left + soldier.width()}px`,
                top: `${soldier.position().top + soldier.height() / 2 - 2.5}px`
            });
        $("#game-container").append(rocket);

        let rocketInterval = setInterval(() => {
            rocket.css("left", `${rocket.position().left + rocketSpeed}px`);

            for (let i = 0; i < aliens.length; i++) {
                if (checkCollision(rocket[0], aliens[i])) {
                    let health = parseInt($(aliens[i]).attr("data-health")) - 5;
                    $(aliens[i]).attr("data-health", health);

                    if (health <= 0) {
                        updateScore(aliens[i].classList[1]);
                        $(aliens[i]).remove();
                        aliens.splice(i, 1);
                    }

                    if ($(aliens[i]).hasClass("yellow")) {
                        const healthBar = $(aliens[i]).find(".health-bar");
                        const health = parseInt($(aliens[i]).attr("data-health"));
                        healthBar.css("width", `${(health / 8) * 100}%`);
                    }

                    rocket.remove();
                    clearInterval(rocketInterval);
                    break;
                }
            }

            if (rocket.position().left > $("#game-container").width()) {
                rocket.remove();
                clearInterval(rocketInterval);
            }
        }, 10);
        $("#ammo").text(currentAmmo - 1);
    }
}

// Spawn a health pack
function spawnHealthPack() {
    const healthPack = $("<div>")
        .addClass("health-pack")
        .css("right", "0px");
    const gameContainerHeight = $("#game-container").height();
    const healthPackHeight = 30;
    const availableSpace = gameContainerHeight - healthPackHeight;
    const randomTop = Math.random() * availableSpace;
    healthPack.css("top", `${randomTop}px`).show();
    aliensContainer.append(healthPack);
}

// Spawn an ammo pack
function spawnAmmoPack() {
    const ammoPack = $("<div>")
        .addClass("ammo-pack")
        .css("right", "0px");
    const gameContainerHeight = $("#game-container").height();
    const ammoPackHeight = 30;
    const availableSpace = gameContainerHeight - ammoPackHeight;
    const randomTop = Math.random() * availableSpace;
    ammoPack.css("top", `${randomTop}px`).show();
    aliensContainer.append(ammoPack);
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
    const scoreElement = $("#score");
    let score = parseInt(scoreElement.text());

    if (alienType === "red") {
        score += 2;
    } else if (alienType === "green") {
        score += 1;
    } else if (alienType === "yellow") {
        score += 4;
    }

    scoreElement.text(score);
}

// Update the health of the soldier
function updateHealth(amount = -1) {
    const healthElement = $("#health");
    let health = parseInt(healthElement.text());

    health = Math.min(health + amount, 50);
    healthElement.text(health);

    if (health <= 0) {
        endGame();
    }
}

// Update the ammo count
function updateAmmo(amount) {
    const ammoElement = $("#ammo");
    let ammo = parseInt(ammoElement.text());

    ammo = Math.min(ammo + amount, maxRockets);
    ammoElement.text(ammo);
}

// End the game
function endGame() {
    cancelAnimationFrame(gameLoopId);
    clearInterval(spawnIntervalId);

    // Remove all aliens from the game container
    aliensContainer.empty();

    // Game Over UI setup
    const gameOverElement = $("#game-over");
    gameOverElement.empty();
    const imageElement = $("<img>")
        .attr("src", "images/gameOver.png")
        .attr("alt", "Game Over Image")
        .css({
            width: "50%",
            display: "block",
            margin: "0 auto"
        });
    gameOverElement.append(imageElement);

    // Player name input for high score submission
    const playerNameInput = $("<input>")
        .attr("type", "text")
        .attr("placeholder", "Enter your name")
        .attr("id", "player-name")
        .css({
            display: "block",
            margin: "20px auto",
            width: "80%",
            padding: "10px",
            fontSize: "18px",
            textAlign: "center"
        });
    gameOverElement.append(playerNameInput);

    // Submit button for high score
    const submitButton = $("<button>")
        .text("Submit Score")
        .attr("id", "submit-score")
        .css({
            display: "block",
            margin: "10px auto",
            padding: "10px 20px",
            fontSize: "24px",
            cursor: "pointer",
            borderRadius: "5px",
            backgroundColor: "blue",
            color: "lightgray"
        });
    gameOverElement.append(submitButton);

    // Stop background music and reset its time
    const backgroundMusic = $("#background-music")[0];
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;

    // Stop and reset rocket sounds
    const rocketSound = $("#rocket-sound")[0];
    rocketSound.pause();
    rocketSound.currentTime = 0;

    // Disable the ability to shoot rockets
    $(document).off("keydown", handleKeyDown);

    submitButton.on("click", function () {
        submitHighScore(parseInt($("#score").text()));
    });

    $("#soldier").hide();
    $("#next-wave-button").hide();
}

// Submit high score
function submitHighScore(score) {
    const playerName = $("#player-name").val();
    if (!playerName) {
        alert("Please enter your name.");
        return;
    }

    highScores.push({ name: playerName, score: score });
    highScores.sort((a, b) => b.score - a.score);
    updateHighScoresList();

    $("#game-over").empty();
    restartGame();
}

// Restart the game
function restartGame() {
    aliens = [];
    totalAliensSpawned = 0;
    currentWave = 1;
    $("#wave").text(currentWave);
    $("#score").text("0");
    $("#health").text("50");
    $("#ammo").text(maxRockets);

    $("#start-button").show();
    $("#soldier").hide();

    cancelAnimationFrame(gameLoopId);
    clearInterval(spawnIntervalId);
}

// Game loop
function gameLoop() {
    for (let i = 0; i < aliens.length; i++) {
        let alienSpeed = 2;
        if ($(aliens[i]).hasClass("green")) {
            alienSpeed = 3;
        } else if ($(aliens[i]).hasClass("yellow")) {
            alienSpeed = 1;
        }
        $(aliens[i]).css("left", `${$(aliens[i]).position().left - alienSpeed}px`);

        if (
            checkCollision(aliens[i], soldier[0]) ||
            $(aliens[i]).position().left + $(aliens[i]).width() < 0
        ) {
            $(aliens[i]).remove();
            aliens.splice(i, 1);
            i--;
            updateHealth();
        }

        if (aliens[i] && $(aliens[i]).hasClass("yellow")) {
            const healthBar = $(aliens[i]).find(".health-bar");
            const health = parseInt($(aliens[i]).attr("data-health"));
            if (health >= 3 && health <= 7) {
                healthBar.css("background-color", "yellow");
            } else if (health >= 1 && health <= 2) {
                healthBar.css("background-color", "red");
            }
        }
    }

    const healthPacks = $(".health-pack");
    for (let i = 0; i < healthPacks.length; i++) {
        $(healthPacks[i]).css("left", `${$(healthPacks[i]).position().left - 2}px`);
        if (checkCollision(healthPacks[i], soldier[0])) {
            $(healthPacks[i]).remove();
            updateHealth(3);
        } else if ($(healthPacks[i]).position().left + $(healthPacks[i]).width() < 0) {
            $(healthPacks[i]).remove();
        }
    }

    const ammoPacks = $(".ammo-pack");
    for (let i = 0; i < ammoPacks.length; i++) {
        $(ammoPacks[i]).css("left", `${$(ammoPacks[i]).position().left - 2}px`);
        if (checkCollision(ammoPacks[i], soldier[0])) {
            $(ammoPacks[i]).remove();
            updateAmmo(3);
        } else if ($(ammoPacks[i]).position().left + $(ammoPacks[i]).width() < 0) {
            $(ammoPacks[i]).remove();
        }
    }

    if (totalAliensSpawned >= maxAliens && aliens.length === 0) {
        checkForWaveCompletion();
    }
    gameLoopId = requestAnimationFrame(gameLoop);
}

// Initialization function
$(window).on("load", init);
