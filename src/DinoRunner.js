const SPEED = 2.5;

export class DinoRunner {
  constructor(container, options = {}) {
    this.initialPlayerState = {
      x: 50,
      y: 150,
      width: 64, // Canvas display size
      height: 64,
      vy: 0,
      jumping: false,
      images: {
        run: [new Image(), new Image()],
        jump: new Image(),
      },
      frameIndex: 0,
      frameTimer: 0,
    };

    this.container = container;
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.canvas.width = options.width || 800;
    this.canvas.height = options.height || 200;
    this.container.appendChild(this.canvas);

    // Game state
    this.running = false;
    this.player = this.initialPlayerState;

    this.player.images.run[0].src = "./assets/run-1.png";
    this.player.images.run[1].src = "./assets/run-2.png";
    this.player.images.jump.src = "./assets/run-1.png";
    this.gravity = 0.15;
    this.jumpStrength = -6;
    this.groundY = this.canvas.height - 40;
    this.obstacles = [];
    this.speed = SPEED;
    this.spawnTimer = 0;
    this.score = 0;
    this.interval = null;
    this.timers = [];

    // Event
    this._bindEvents();
  }

  _bindEvents() {
    window.addEventListener("keydown", (e) => {
      if (
        (e.code === "Space" || e.key === " ") &&
        !this.player.jumping &&
        this.running
      ) {
        this.player.vy = this.jumpStrength;
        this.player.jumping = true;
      }
      if ((e.code === "Space" || e.key === " ") && !this.running) {
        this.restart();
      }
    });
  }

  _keepScore(cls) {
    cls.score += 1;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.interval = setInterval(this._keepScore, 50, this);
    let t1 = setTimeout(() => {
      this.speed = SPEED + 0.5;
    }, 10000);
    let t2 = setTimeout(() => {
      this.speed = SPEED + 1;
    }, 40000);

    let t3 = setTimeout(() => {
      this.speed = SPEED + 1.5;
    }, 50000);

    this.timers.push(t1, t2, t3);
    console.log(this.timers);
    this._keepScore(this);
    requestAnimationFrame(() => this._gameLoop());
  }

  restart() {
    this.stop();
    this.score = 0;
    this.player = this.initialPlayerState;
    this.speed = SPEED;
    this.obstacles = [];

    this.start();
  }

  stop() {
    this.running = false;
    if (this.interval) {
      clearInterval(this.interval);
    }
    for (let item in this.timers) {
      clearTimeout(item);
    }
    this.timers = [];
  }

  _gameLoop() {
    if (!this.running) return;
    this._update();
    this._render();
    requestAnimationFrame(() => this._gameLoop());
  }

  _update() {
    // Player physics
    this.player.y += this.player.vy / 2;
    this.player.vy += this.gravity;

    if (!this.player.jumping) {
      this.player.frameTimer++;
      if (this.player.frameTimer > 20) {
        this.player.frameTimer = 0;
        this.player.frameIndex =
          (this.player.frameIndex + 1) % this.player.images.run.length;
      }
    }

    if (this.player.y >= this.groundY - this.player.height) {
      this.player.y = this.groundY - this.player.height;
      this.player.vy = 0;
      this.player.jumping = false;
    }

    // Obstacle spawning
    this.spawnTimer++;
    if (this.spawnTimer > 100 + Math.random() * 2000) {
      this.obstacles.push({
        x: this.canvas.width,
        y: this.groundY - 30,
        width: 20,
        height: 30,
      });
      this.spawnTimer = 0;
    }

    // Move obstacles
    this.obstacles.forEach((obs) => (obs.x -= this.speed));
    this.obstacles = this.obstacles.filter((obs) => obs.x + obs.width > 0);

    // Collision
    for (let obs of this.obstacles) {
      if (
        this.player.x < obs.x + obs.width - 10 &&
        this.player.x + this.player.width - 20 > obs.x &&
        this.player.y < obs.y + obs.height &&
        this.player.y + this.player.height > obs.y
      ) {
        this.stop(); // game over
      }
    }
  }

  _render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const p = this.player;
    let img = p.jumping ? p.images.jump : p.images.run[p.frameIndex];

    this.ctx.drawImage(img, p.x, p.y + 8, p.width, p.height);

    // Ground
    ctx.fillStyle = "#ccc";
    ctx.fillRect(0, this.groundY, this.canvas.width, 2);

    // Player
    // ctx.fillStyle = "#000";
    // ctx.fillRect(
    //   this.player.x,
    //   this.player.y,
    //   this.player.width,
    //   this.player.height
    // );

    // Obstacles
    ctx.fillStyle = "green";
    for (let obs of this.obstacles) {
      ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    }

    // Score
    ctx.fillStyle = "#333";
    ctx.font = "16px sans-serif";
    ctx.fillText(`Score: ${this.score}`, 10, 20);
  }
}
