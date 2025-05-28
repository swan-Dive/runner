import { Background } from "./Background.js";
import { Canvas } from "./Canvas.js";
import { Ground } from "./Ground.js";
import { DefaultObstacle } from "./GameObjects/Obstacles/DefaultObstacle.js";
import { GameObject } from "./GameObjects/GameObject.js";
import {
  DEFAULT_PLAYER_DUCKING_HEIGHT,
  DEFAULT_PLAYER_HEIGHT,
  Player,
} from "./Player.js";
import { FlyingObstacle } from "./GameObjects/Obstacles/FlyingObstacle.js";
import { CanvasOptions } from "./types";
import { BaseCollectable } from "./GameObjects/Collectables/BaseCollectable.js";
import { GoldenCollectable } from "./GameObjects/Collectables/CoinCollectables.js";

const SPEED = 3.5;
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
  interval: ReturnType<typeof setInterval> | null = null;
  timers: ReturnType<typeof setTimeout>[] = [];
  speed: number = SPEED;
  highScore: number;
  gameEnding: boolean = false;
  gameOverSound: HTMLAudioElement;
  collectables: BaseCollectable[] = [];
  coin_pickup_sound: HTMLAudioElement;

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
    if (this.interval) {
      clearInterval(this.interval);
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
        this.player.jump(true);
      }
      if ((e.code === "Space" || e.key === " ") && !this.running) {
        this._restart();
      }
      if (
        (e.code === "ArrowDown" || e.key === "S" || e.key === "s") &&
        !this.player.is_jumping() &&
        this.running
      ) {
        this.player.duck();
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
        this.player.unduck();
        this.gravity = DEFAULT_GRAVITY;
        this.player.state.is_plumiting = false;
      }
    });
  }

  _keepScore(cls: Game) {
    cls.score += 1;
  }

  _handleSpawnCollectables() {
    this.collectableSpawnTimer++;
    if (this.collectableSpawnTimer > 100 + Math.random() * 2000) {
      console.log("here");
      const r = parseInt((Math.random() * 2).toFixed(0));
      switch (r) {
        case 0:
          this.collectables.push(
            new GoldenCollectable(
              this.canvas.getWidth(),
              this.ground.y - DEFAULT_PLAYER_HEIGHT + 30
            )
          );
          break;
        case 1:
          this.collectables.push(
            new GoldenCollectable(
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

  _handleSpawnObstacle() {
    this.obstacleSpawnTimer++;
    if (this.obstacleSpawnTimer > 100 + Math.random() * 1000) {
      if (this.score < 100) {
        this.obstacles.push(
          new DefaultObstacle(this.canvas.getWidth(), this.ground.y)
        );
      } else {
        const r = parseInt((Math.random() * 4).toFixed(0));

        switch (r) {
          case 0:
            this.obstacles.push(
              new DefaultObstacle(this.canvas.getWidth(), this.ground.y)
            );
            break;
          case 1:
            this.obstacles.push(
              new FlyingObstacle(
                this.canvas.getWidth(),
                this.ground.y - (DEFAULT_PLAYER_HEIGHT / 4) * 3
              )
            );
            break;
          case 2:
            this.obstacles.push(
              new FlyingObstacle(
                this.canvas.getWidth(),
                this.ground.y - (DEFAULT_PLAYER_DUCKING_HEIGHT / 4) * 1
              )
            );
            break;
          case 3:
            this.obstacles.push(
              new FlyingObstacle(
                this.canvas.getWidth(),
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

  _gameLoop() {
    if (!this.running) return;
    this._update();
    this._render();
    requestAnimationFrame(() => this._gameLoop());
  }

  _update() {
    this.player.update(this.gravity, this.gameEnding);
    this.ground.update(this.speed);
    this._handleSpawnObstacle();
    this._handleSpawnCollectables();
    if (this.gameEnding) return;

    // Move obstacles
    this.obstacles.forEach((obs) => obs.move(this.speed));
    this.obstacles = this.obstacles.filter((obs) => obs.isOOB());
    // Move collectables
    this.collectables.forEach((col) => col.move(this.speed));

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
        const sound: any = this.coin_pickup_sound.cloneNode(); // Create a fresh copy

        sound.play();
      }
    }

    this.collectables = this.collectables.filter(
      (col) => !to_delete.includes(col)
    );
  }

  _gameOver() {
    this.player.die();
    this.speed = 0;
    this.gameEnding = true;
    this.gameOverSound.play();
    if (this.interval) {
      clearInterval(this.interval);
    }
    setTimeout(() => {
      this.stop();
      this.gameEnding = false;
    }, 1000);
  }

  _render() {
    this.canvas.clearContext();
    let ctx = this.canvas.getContext();
    this.background.draw(ctx, this.gameEnding);
    this.ground.draw(ctx);
    this.player.draw(ctx);
    this.canvas.drawScore(this.score, this.highScore);

    this.obstacles.forEach((obs) => obs.draw(ctx));
    this.collectables.forEach((obs) => obs.draw(ctx));
    if (this.gameEnding) {
      this.canvas.drawGameOver();
    }
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.interval = setInterval(this._keepScore, 50, this);
    let t1 = setTimeout(() => {
      this.speed = SPEED + 0.5;
      if (this.interval) {
        clearInterval(this.interval);
        this.interval = setInterval(this._keepScore, 45, this);
      }
    }, 10000);
    let t2 = setTimeout(() => {
      this.speed = SPEED + 1;
      if (this.interval) {
        clearInterval(this.interval);
        this.interval = setInterval(this._keepScore, 40, this);
      }
    }, 40000);

    let t3 = setTimeout(() => {
      this.speed = SPEED + 1.5;
      if (this.interval) {
        clearInterval(this.interval);
        this.interval = setInterval(this._keepScore, 30, this);
      }
    }, 50000);

    this.timers.push(t1, t2, t3);
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
