import { Background } from "./Background/Background.js";
import { Canvas } from "./Canvas.js";
import { Ground } from "./Ground.js";
import { ObstacleBug } from "./GameObjects/Obstacles/ObstacleBug.js";
import { GameObject } from "./GameObjects/GameObject.js";
import {
  DEFAULT_PLAYER_DUCKING_HEIGHT,
  DEFAULT_PLAYER_HEIGHT,
  Player,
} from "./Player.js";
import { Obstacle404 } from "./GameObjects/Obstacles/Obstacle404.js";
import { BaseCollectable } from "./GameObjects/Collectables/BaseCollectable.js";
import { EnergyCollectable } from "./GameObjects/Collectables/EnergyCollectable.js";
import { CoffeeCollectable } from "./GameObjects/Collectables/CoffeeCollectable.js";
import { BagelCollectable } from "./GameObjects/Collectables/BagelCollectable.js";

const SPEED = 500;
const GROUND_HEIGHT = 20;
const DEFAULT_GRAVITY = 0.15;

export class Game {
  gravity: number = DEFAULT_GRAVITY;
  canvas: Canvas;
  player: Player;
  obstacles: GameObject[] = [];
  ground: Ground;
  background: Background;
  running: boolean = false;
  obstacleSpawnTimer: number = 0;
  collectableSpawnTimer: number = 0;
  score: number = 0;
  scoreInterval: ReturnType<typeof setInterval> | null = null;
  timers: ReturnType<typeof setTimeout>[] = [];
  speed: number = SPEED;
  highScore: number;
  gameEnding: boolean = false;
  gameOverSound: HTMLAudioElement;
  collectables: BaseCollectable[] = [];
  coin_pickup_sound: HTMLAudioElement;
  lastTime: number = Date.now();
  paused: boolean = false;
  musicOn: boolean = true;
  constructor(container: HTMLDivElement) {
    this.canvas = new Canvas(container, { width: 800, height: 200 });
    this.ground = new Ground(
      this.canvas.getHeight() - GROUND_HEIGHT,
      this.canvas.getWidth()
    );
    this.background = new Background(
      this.canvas.getWidth(),
      this.canvas.getHeight() - GROUND_HEIGHT
    );

    this.player = new Player(this.ground.y);
    this.highScore = this.loadHighScore();
    this._bindEvents();

    this.gameOverSound = new Audio("./dist/assets/game/game_over.mp3");
    this.coin_pickup_sound = new Audio("./dist/assets/game/coin_pickup.wav");
    let font = new FontFace(
      "main_font",
      "url(./dist/assets/fonts/press_start/PressStart2P-Regular.ttf)"
    );

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
    if (this.score > this.highScore) this.saveHighScore(this.score);
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

    this.canvas.container.addEventListener("click", (ev) => {
      if (
        ev.offsetX > 0 &&
        ev.offsetX < 48 &&
        ev.offsetY > 0 &&
        ev.offsetY <= 32
      ) {
        this.musicOn = !this.musicOn;
      }
    });

    window.addEventListener("keydown", (e) => {
      if (this.gameEnding) return;
      if (
        (e.code === "Space" ||
          e.key === "ArrowUp" ||
          e.key === "W" ||
          e.key === "w") &&
        !this.player.is_jumping() &&
        !this.player.is_ducking() &&
        this.running
      ) {
        this.player.jump(this.musicOn);
      }
      if ((e.code === "Space" || e.key === " ") && !this.running) {
        this._restart();
      }
      if (
        (e.code === "ArrowDown" || e.key === "S" || e.key === "s") &&
        !this.player.is_jumping() &&
        this.running
      ) {
        this.player.duck(this.musicOn);
      }
      if (
        (e.code === "ArrowDown" || e.key === "S" || e.key === "s") &&
        this.player.is_jumping()
      ) {
        this.gravity = 0.5;
        this.player.state.is_plumiting = true;
      }
    });
    window.addEventListener("keyup", (e) => {
      if (this.gameEnding || !this.running) return;
      if (e.code === "ArrowDown" || e.key === "S" || e.key === "s") {
        if (!this.player.state.is_plumiting) this.player.unduck();
        this.gravity = DEFAULT_GRAVITY;
        this.player.state.is_plumiting = false;
      }
    });
  }

  _keepScore(cls: Game) {
    cls.score += 1;
  }

  chosenCollectable(collectablesToChoseFrom: any[], weights: number[]) {
    const total = weights.reduce((a, b) => a + b, 0);
    const r = Math.random() * total;
    let sum = 0;
    for (let i = 0; i < collectablesToChoseFrom.length; i++) {
      sum += weights[i];
      if (r < sum) return collectablesToChoseFrom[i];
    }
  }

  _handleSpawnCollectables(timeDelta: number) {
    const collectablesToChoseFrom = [
      CoffeeCollectable,
      EnergyCollectable,
      BagelCollectable,
    ];
    const weights = [0.2, 0.5, 0.3]; // 30% chance for Bitcoin, 70% for Energy

    this.collectableSpawnTimer++;
    if (
      this.obstacleSpawnTimer >
      (1 / timeDelta / 8) * 5 + Math.random() * 3000
    ) {
      const r = parseInt((Math.random() * 2).toFixed(0));
      const collectable = this.chosenCollectable(
        collectablesToChoseFrom,
        weights
      );
      switch (r) {
        case 0:
          this.collectables.push(
            new collectable(
              this.canvas.getWidth(),
              this.ground.y - DEFAULT_PLAYER_HEIGHT + 20
            )
          );
          break;
        case 1:
          this.collectables.push(
            new collectable(
              this.canvas.getWidth(),
              this.ground.y - DEFAULT_PLAYER_HEIGHT - 30
            )
          );
          break;
        default:
          break;
      }
      this.collectableSpawnTimer = 0;
    }
  }

  _handleSpawnObstacle(timeDelta: number) {
    this.obstacleSpawnTimer++;
    if (
      this.obstacleSpawnTimer >
      (1 / timeDelta / 8) * 5 + Math.random() * 1000
    ) {
      if (this.score < 100) {
        this.obstacles.push(
          new ObstacleBug(this.canvas.getWidth(), this.ground.y)
        );
      } else {
        const r = parseInt((Math.random() * 4).toFixed(0));

        switch (r) {
          case 2:
            this.obstacles.push(
              new ObstacleBug(this.canvas.getWidth() + 150, this.ground.y)
            );
            break;
          case 1:
            this.obstacles.push(
              new Obstacle404(
                this.canvas.getWidth() + 150,
                this.ground.y - DEFAULT_PLAYER_DUCKING_HEIGHT / 4
              )
            );
            break;
          case 3:
            this.obstacles.push(
              new Obstacle404(
                this.canvas.getWidth() + 150,
                this.ground.y - (DEFAULT_PLAYER_HEIGHT * 3) / 2
              )
            );
            break;
          default:
            break;
        }
      }

      this.obstacleSpawnTimer = 0;
    }
  }

  interpolate(
    v: number,
    iMin: number,
    iMax: number,
    oMin: number,
    oMax: number
  ) {
    return oMin + ((v - iMin) * (oMax - oMin)) / (iMax - iMin);
  }

  _gameLoop() {
    if (!this.running || this.paused) return;
    const timeStamp = Date.now();
    const deltaTime = Math.max(
      Math.min((timeStamp - this.lastTime) / 1000, 0.1),
      0.006
    );
    this.lastTime = timeStamp;

    this._update(deltaTime);
    this._render(deltaTime);
    requestAnimationFrame(() => this._gameLoop());
  }

  _update(timeDelta: number) {
    if (this.score >= 1000 && this.speed != SPEED + 250 && !this.gameEnding) {
      this.updateScoreIntervalAndSpeed(SPEED + 250, 30);
    } else if (
      this.score >= 500 &&
      this.score < 1000 &&
      this.speed != SPEED + 150 &&
      !this.gameEnding
    ) {
      this.updateScoreIntervalAndSpeed(SPEED + 150, 40);
    } else if (
      this.score >= 200 &&
      this.score < 500 &&
      this.speed != SPEED + 100 &&
      !this.gameEnding
    ) {
      this.updateScoreIntervalAndSpeed(SPEED + 100, 45);
    } else if (this.scoreInterval == null && !this.gameEnding) {
      this.updateScoreIntervalAndSpeed(SPEED, 50);
    }

    const accSpeed = this.speed * timeDelta * 1;

    this.player.update(
      this.interpolate(accSpeed, 2.8, 11, 0.2, 1.1) +
        (this.player.state.is_plumiting ? 0.3 : 0) +
        (this.gameEnding ? (SPEED * timeDelta) / 10 : 0),
      this.gameEnding,
      timeDelta,
      this.interpolate(accSpeed, 2.8, 11, -8, -17),
      this.musicOn
    );
    this.ground.update(accSpeed);

    this._handleSpawnObstacle(timeDelta);
    this._handleSpawnCollectables(timeDelta);
    if (this.gameEnding) return;

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

    const to_delete: BaseCollectable[] = [];
    for (let col of this.collectables) {
      if (col.isCollision(this.player)) {
        this.score += col.getCoinValue();
        to_delete.push(col);
        if (this.musicOn) {
          const sound: HTMLAudioElement =
            this.coin_pickup_sound.cloneNode() as HTMLAudioElement;
          sound.volume = 0.5;
          sound.play();
        }
      }
    }

    this.collectables = this.collectables.filter(
      (col) => !(to_delete.indexOf(col) !== -1)
    );
  }

  _gameOver() {
    this.player.die();
    this.speed = 0;
    this.gameEnding = true;
    if (this.musicOn) {
      this.gameOverSound.volume = 0.5;
      this.gameOverSound.play();
    }
    if (this.scoreInterval) {
      clearInterval(this.scoreInterval);
      this.scoreInterval = null;
    }
    setTimeout(() => {
      this.stop();
      this.gameEnding = false;
    }, 2000);
  }

  _render(timeDelta: number) {
    const accSpeed = this.speed * timeDelta * 1;
    this.canvas.clearContext();

    let ctx = this.canvas.getContext();
    this.background.draw(ctx, this.gameEnding);
    // this.middleground.draw(ctx, this.gameEnding, accSpeed);
    this.ground.draw(ctx, this.gameEnding, accSpeed);
    this.player.draw(ctx);
    this.canvas.drawMusicIcon(this.musicOn);
    this.canvas.drawScore(this.score, this.highScore);

    this.obstacles.forEach((obs) => obs.draw(ctx));
    this.collectables.forEach((obs) => obs.draw(ctx));
    if (this.gameEnding) {
      this.canvas.drawGameOver();
    }
  }

  updateScoreIntervalAndSpeed(speedToHave: number, intervalToHave: number) {
    this.speed = speedToHave;
    if (this.scoreInterval) {
      clearInterval(this.scoreInterval);
    }
    this.scoreInterval = setInterval(this._keepScore, intervalToHave, this);
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.scoreInterval = setInterval(this._keepScore, 50, this);

    requestAnimationFrame(() => this._gameLoop());
  }

  saveHighScore(score: number) {
    this.highScore = score;
    localStorage.setItem("highScore", score.toString());
  }

  loadHighScore() {
    let highScore = localStorage.getItem("highScore");
    if (!highScore) return 0;
    return parseInt(highScore);
  }
}
