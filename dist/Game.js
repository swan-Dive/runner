import { Background } from "./Background/Background.js";
import { Canvas } from "./Canvas.js";
import { Ground } from "./Ground.js";
import { Obstacle500 } from "./GameObjects/Obstacles/Obstacle500.js";
import { DEFAULT_PLAYER_DUCKING_HEIGHT, DEFAULT_PLAYER_HEIGHT, Player, } from "./Player.js";
import { Obstacle404 } from "./GameObjects/Obstacles/Obstacle404.js";
import { EnergyCollectable } from "./GameObjects/Collectables/EnergyCollectable.js";
import { BitcoinCollectable } from "./GameObjects/Collectables/BitcoinCollectable.js";
import { PizzaCollectable } from "./GameObjects/Collectables/PizzaCollectable.js";
import { MiddleGround } from "./MiddleGround.js";
const SPEED = 500;
const GROUND_HEIGHT = 20;
const DEFAULT_GRAVITY = 0.15;
export class Game {
    constructor(container) {
        this.gravity = DEFAULT_GRAVITY;
        this.obstacles = [];
        this.running = false;
        this.obstacleSpawnTimer = 0;
        this.collectableSpawnTimer = 0;
        this.score = 0;
        this.scoreInterval = null;
        this.timers = [];
        this.speed = SPEED;
        this.gameEnding = false;
        this.collectables = [];
        this.lastTime = Date.now();
        this.paused = false;
        this.canvas = new Canvas(container, { width: 800, height: 200 });
        this.ground = new Ground(this.canvas.getHeight() - GROUND_HEIGHT, this.canvas.getWidth());
        this.background = new Background(this.canvas.getWidth(), this.canvas.getHeight() - GROUND_HEIGHT);
        this.middleground = new MiddleGround(this.canvas.getWidth(), this.canvas.getHeight() - GROUND_HEIGHT);
        this.player = new Player(this.ground.y);
        this.highScore = this.loadHighScore();
        this._bindEvents();
        this.gameOverSound = new Audio("./dist/assets/game/game_over.mp3");
        this.coin_pickup_sound = new Audio("./dist/assets/game/coin_pickup.wav");
        let font = new FontFace("main_font", "url(./dist/assets/fonts/press_start/PressStart2P-Regular.ttf)");
        font
            .load()
            .then((loadedFont) => {
            document.fonts.add(loadedFont);
        })
            .catch(function (error) {
            console.error("Font failed to load:", error);
        });
    }
    stop() {
        this.running = false;
        if (this.score > this.highScore)
            this.saveHighScore(this.score);
        if (this.scoreInterval) {
            clearInterval(this.scoreInterval);
        }
        this.timers.forEach((item) => clearTimeout(item));
        this.timers = [];
    }
    _restart() {
        this.stop();
        this.player.reset();
        this.background.reset();
        this.middleground.reset();
        this.gravity = DEFAULT_GRAVITY;
        this.score = 0;
        this.gameEnding = false;
        this.speed = SPEED;
        this.obstacles = [];
        this.collectables = [];
        this.start();
    }
    _bindEvents() {
        window.addEventListener("blur", () => {
            this.paused = true;
            if (this.scoreInterval) {
                clearInterval(this.scoreInterval);
                this.scoreInterval = null;
            }
        });
        window.addEventListener("focus", () => {
            this.paused = false;
            requestAnimationFrame(() => this._gameLoop());
        });
        window.addEventListener("keydown", (e) => {
            if (this.gameEnding)
                return;
            if ((e.code === "Space" ||
                e.key === "ArrowUp" ||
                e.key === "W" ||
                e.key === "w") &&
                !this.player.is_jumping() &&
                !this.player.is_ducking() &&
                this.running) {
                this.player.jump(true);
            }
            if ((e.code === "Space" || e.key === " ") && !this.running) {
                this._restart();
            }
            if ((e.code === "ArrowDown" || e.key === "S" || e.key === "s") &&
                !this.player.is_jumping() &&
                this.running) {
                this.player.duck();
            }
            if ((e.code === "ArrowDown" || e.key === "S" || e.key === "s") &&
                this.player.is_jumping()) {
                this.gravity = 0.5;
                this.player.state.is_plumiting = true;
            }
        });
        window.addEventListener("keyup", (e) => {
            if (this.gameEnding || !this.running)
                return;
            if (e.code === "ArrowDown" || e.key === "S" || e.key === "s") {
                if (!this.player.state.is_plumiting)
                    this.player.unduck();
                this.gravity = DEFAULT_GRAVITY;
                this.player.state.is_plumiting = false;
            }
        });
    }
    _keepScore(cls) {
        cls.score += 1;
    }
    chosenCollectable(collectablesToChoseFrom, weights) {
        const total = weights.reduce((a, b) => a + b, 0);
        const r = Math.random() * total;
        let sum = 0;
        for (let i = 0; i < collectablesToChoseFrom.length; i++) {
            sum += weights[i];
            if (r < sum)
                return collectablesToChoseFrom[i];
        }
    }
    _handleSpawnCollectables(timeDelta) {
        const collectablesToChoseFrom = [
            BitcoinCollectable,
            EnergyCollectable,
            PizzaCollectable,
        ];
        const weights = [0.2, 0.5, 0.3]; // 30% chance for Bitcoin, 70% for Energy
        this.collectableSpawnTimer++;
        if (this.obstacleSpawnTimer >
            (1 / timeDelta / 8) * 5 + Math.random() * 3000) {
            const r = parseInt((Math.random() * 2).toFixed(0));
            const collectable = this.chosenCollectable(collectablesToChoseFrom, weights);
            switch (r) {
                case 0:
                    this.collectables.push(new collectable(this.canvas.getWidth(), this.ground.y - DEFAULT_PLAYER_HEIGHT + 20));
                    break;
                case 1:
                    this.collectables.push(new collectable(this.canvas.getWidth(), this.ground.y - DEFAULT_PLAYER_HEIGHT - 30));
                    break;
                default:
                    break;
            }
            this.collectableSpawnTimer = 0;
        }
    }
    _handleSpawnObstacle(timeDelta) {
        this.obstacleSpawnTimer++;
        if (this.obstacleSpawnTimer >
            (1 / timeDelta / 8) * 5 + Math.random() * 1000) {
            if (this.score < 100) {
                this.obstacles.push(new Obstacle500(this.canvas.getWidth(), this.ground.y));
            }
            else {
                const r = parseInt((Math.random() * 5).toFixed(0));
                switch (r) {
                    case 2:
                        this.obstacles.push(new Obstacle500(this.canvas.getWidth() + 150, this.ground.y));
                        break;
                    case 1:
                        this.obstacles.push(new Obstacle404(this.canvas.getWidth() + 150, this.ground.y - (DEFAULT_PLAYER_HEIGHT / 4) * 3));
                        break;
                    case 3:
                        this.obstacles.push(new Obstacle404(this.canvas.getWidth() + 150, this.ground.y - DEFAULT_PLAYER_DUCKING_HEIGHT / 4));
                        break;
                    case 4:
                        this.obstacles.push(new Obstacle404(this.canvas.getWidth() + 150, this.ground.y - (DEFAULT_PLAYER_HEIGHT * 3) / 2));
                        break;
                    default:
                        break;
                }
            }
            this.obstacleSpawnTimer = 0;
        }
    }
    interpolate(v, iMin, iMax, oMin, oMax) {
        return oMin + ((v - iMin) * (oMax - oMin)) / (iMax - iMin);
    }
    _gameLoop() {
        if (!this.running || this.paused)
            return;
        const timeStamp = Date.now();
        const deltaTime = Math.max(Math.min((timeStamp - this.lastTime) / 1000, 0.1), 0.006);
        this.lastTime = timeStamp;
        this._update(deltaTime);
        this._render(deltaTime);
        requestAnimationFrame(() => this._gameLoop());
    }
    _update(timeDelta) {
        if (this.score >= 1000 && this.speed != SPEED + 250 && !this.gameEnding) {
            this.updateScoreIntervalAndSpeed(SPEED + 250, 30);
        }
        else if (this.score >= 500 &&
            this.score < 1000 &&
            this.speed != SPEED + 150 &&
            !this.gameEnding) {
            this.updateScoreIntervalAndSpeed(SPEED + 150, 40);
        }
        else if (this.score >= 200 &&
            this.score < 500 &&
            this.speed != SPEED + 100 &&
            !this.gameEnding) {
            this.updateScoreIntervalAndSpeed(SPEED + 100, 45);
        }
        else if (this.scoreInterval == null && !this.gameEnding) {
            this.updateScoreIntervalAndSpeed(SPEED, 50);
        }
        const accSpeed = this.speed * timeDelta * 1;
        this.player.update(this.interpolate(accSpeed, 2.8, 11, 0.2, 1.1) +
            (this.player.state.is_plumiting ? 0.3 : 0) +
            (this.gameEnding ? (SPEED * timeDelta) / 10 : 0), this.gameEnding, timeDelta, this.interpolate(accSpeed, 2.8, 11, -8, -17));
        this.ground.update(accSpeed);
        this.background.update(timeDelta, this.gameEnding);
        this._handleSpawnObstacle(timeDelta);
        this._handleSpawnCollectables(timeDelta);
        if (this.gameEnding)
            return;
        // Move obstacles
        this.obstacles.forEach((obs) => obs.move(accSpeed));
        this.obstacles = this.obstacles.filter((obs) => obs.isOOB());
        // Move collectables
        this.collectables.forEach((col) => col.move(accSpeed));
        this.collectables.forEach((col) => {
            this.obstacles.forEach((obj) => {
                if (col.isObstacleCollision(obj)) {
                    col.move(-this.speed * 10);
                }
            });
        });
        this.collectables = this.collectables.filter((col) => col.isOOB());
        // Collision
        for (let obs of this.obstacles) {
            if (obs.isCollision(this.player)) {
                this._gameOver();
                break;
            }
        }
        const to_delete = [];
        for (let col of this.collectables) {
            if (col.isCollision(this.player)) {
                this.score += col.getCoinValue();
                to_delete.push(col);
                const sound = this.coin_pickup_sound.cloneNode();
                sound.volume = 0.5;
                sound.play();
            }
        }
        this.collectables = this.collectables.filter((col) => !to_delete.includes(col));
    }
    _gameOver() {
        this.player.die();
        this.speed = 0;
        this.gameEnding = true;
        this.gameOverSound.volume = 0.5;
        this.gameOverSound.play();
        if (this.scoreInterval) {
            clearInterval(this.scoreInterval);
            this.scoreInterval = null;
        }
        setTimeout(() => {
            this.stop();
            this.gameEnding = false;
        }, 2000);
    }
    _render(timeDelta) {
        const accSpeed = this.speed * timeDelta * 1;
        this.canvas.clearContext();
        let ctx = this.canvas.getContext();
        this.background.draw(ctx, this.gameEnding);
        // this.middleground.draw(ctx, this.gameEnding, accSpeed);
        this.ground.draw(ctx, this.gameEnding, accSpeed);
        this.player.draw(ctx);
        this.canvas.drawScore(this.score, this.highScore);
        this.obstacles.forEach((obs) => obs.draw(ctx));
        this.collectables.forEach((obs) => obs.draw(ctx));
        if (this.gameEnding) {
            this.canvas.drawGameOver();
        }
    }
    updateScoreIntervalAndSpeed(speedToHave, intervalToHave) {
        this.speed = speedToHave;
        if (this.scoreInterval) {
            clearInterval(this.scoreInterval);
        }
        this.scoreInterval = setInterval(this._keepScore, intervalToHave, this);
    }
    start() {
        if (this.running)
            return;
        this.running = true;
        this.scoreInterval = setInterval(this._keepScore, 50, this);
        requestAnimationFrame(() => this._gameLoop());
    }
    saveHighScore(score) {
        this.highScore = score;
        localStorage.setItem("highScore", score.toString());
    }
    loadHighScore() {
        let highScore = localStorage.getItem("highScore");
        if (!highScore)
            return 0;
        return parseInt(highScore);
    }
}
