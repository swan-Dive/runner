import { PlayerState } from "./types";

export const DEFAULT_PLAYER_HEIGHT = 64;
export const DEFAULT_PLAYER_WIDTH = 64;
export const DEFAULT_PLAYER_Y = 110;
export const DEFAULT_PLAYER_X = 16;
export const DEFAULT_PLAYER_DUCKING_HEIGHT = 32;
export const DEFAULT_PLAYER_DUCKING_WIDTH = 32;
export const DEFAULT_PLAYER_DUCKING_Y = 144;
export const DEFAULT_PLAYER_DUCKING_X = 32;
export const PLAYER_SPRITE_IMAGES_COUNT = 8;
export const SHRINK_SPRITE_IMAGES_COUNT = 7;
export const PLAYER_SOURCE_WIDTH = 58;
export const PLAYER_SOURCE_HEIGHT = 60;
export const PLAYER_SOURCE_Y_OFFSET = 0;
export const PLAYER_SOURCE_X_OFFSET = 0;

const PLAYER_SPRITE_X_MAPPER = [0, 65, 130, 195, 260, 325, 390, 455];
const SHRINK_SPRITE_X_MAPPER = [0, 480, 960, 1440, 1920, 2400, 2880];

const INITIAL_PLAYER_STATE = {
  x: DEFAULT_PLAYER_X,
  y: DEFAULT_PLAYER_Y,
  width: DEFAULT_PLAYER_WIDTH, // Canvas display size
  height: DEFAULT_PLAYER_HEIGHT,
  vy: 0,
  jumping: true,
  ducking: false,
  images: {
    run: new Image(),
    jump: new Image(),
    shrink: new Image(),
  },
  frameIndex: 0,
  frameTimer: 0,
  shrinkFrameIndex: 7,
  shrinkFrameTimer: 0,
  is_plumiting: false,
};

export class Player {
  state: PlayerState;
  jumpStrength: number;
  groundY: number;
  jump_sound: HTMLAudioElement;
  shrink_sound: HTMLAudioElement;
  constructor(groundY: number) {
    this.state = { ...INITIAL_PLAYER_STATE };
    this.groundY = groundY;
    this.jumpStrength = -12;
    this.state.images.run.src = "./dist/assets/player/sprite.png";
    this.state.images.jump.src = "./dist/assets/player/sprite.png";
    this.state.images.shrink.src = "./dist/assets/player/explosion.png";
    this.jump_sound = new Audio("./dist/assets/player/jump.mp3");
    this.shrink_sound = new Audio("./dist/assets/player/shrink.mp3");
    this.jump_sound.volume = 0.1;
    this.shrink_sound.volume = 0.1;
  }

  is_jumping() {
    return this.state.jumping;
  }

  is_ducking() {
    return this.state.ducking;
  }

  duck(musicOn: boolean) {
    this.state.height = DEFAULT_PLAYER_DUCKING_HEIGHT;
    this.state.width = DEFAULT_PLAYER_DUCKING_WIDTH;
    this.state.x = DEFAULT_PLAYER_DUCKING_X;
    this.state.y = DEFAULT_PLAYER_DUCKING_Y;
    if (!this.is_ducking()) {
      this.state.shrinkFrameIndex = 0;
      this.state.shrinkFrameTimer = 0;
      if (musicOn) {
        this.shrink_sound.volume = 0.5;
        this.shrink_sound.play();
      }
    }

    this.state.ducking = true;
  }

  plumit() {
    this.state.is_plumiting = true;
  }

  unduck() {
    this.state.height = DEFAULT_PLAYER_HEIGHT;
    this.state.width = DEFAULT_PLAYER_WIDTH;
    this.state.x = DEFAULT_PLAYER_X;
    this.state.y = DEFAULT_PLAYER_Y;
    this.state.ducking = false;
    this.state.shrinkFrameIndex = 7;
    this.state.shrinkFrameTimer = 0;
  }

  jump(play_sound: boolean = false) {
    this.state.vy = this.jumpStrength;
    this.state.jumping = true;
    if (play_sound) {
      const sound: any = this.jump_sound.cloneNode() as HTMLAudioElement; // Create a fresh copy
      sound.volume = 0.4;
      sound.play();
    }
  }

  reset() {
    this.state = { ...INITIAL_PLAYER_STATE };
  }

  update(
    gameGravity: number,
    gameEnding: boolean,
    timeDelta: number,
    jumpStrength: number,
    musicOn: boolean
  ) {
    this.jumpStrength = jumpStrength;
    if (this.state.jumping) {
      this.state.y += (this.state.vy / 4) * 3;
      this.state.vy += gameGravity;
      this._jump_animation(gameEnding, musicOn);
    } else {
      this._update_animation(timeDelta);
    }
  }

  getCurrentImage(): HTMLImageElement {
    const p = this.state;
    return p.jumping ? p.images.jump : p.images.run;
  }

  getX() {
    return this.state.x;
  }
  getY() {
    return this.state.y;
  }

  getWidth() {
    return this.state.width;
  }

  getHeight() {
    return this.state.height;
  }

  drawExplosion(ctx: CanvasRenderingContext2D): void {
    ctx.drawImage(
      this.state.images.shrink,
      SHRINK_SPRITE_X_MAPPER[this.state.shrinkFrameIndex],
      0,
      480,
      480,
      this.getX() - 20,
      this.getY() - 12,
      this.getWidth() + 40,
      this.getHeight() + 40
    );
  }

  draw(ctx: CanvasRenderingContext2D | null): void {
    if (!ctx) {
      throw new Error("No context provided");
    }
    ctx.drawImage(
      this.getCurrentImage(),
      PLAYER_SPRITE_X_MAPPER[this.state.frameIndex],
      PLAYER_SOURCE_Y_OFFSET,
      PLAYER_SOURCE_WIDTH,
      PLAYER_SOURCE_HEIGHT,
      this.getX(),
      this.getY() + 8,
      this.getWidth(),
      this.getHeight()
    );
    if (this.state.shrinkFrameIndex < SHRINK_SPRITE_IMAGES_COUNT) {
      this.drawExplosion(ctx);
    }
  }

  _update_animation(timeDelta: number) {
    this.state.frameTimer++;
    if (this.state.frameTimer > 1 / timeDelta / 8) {
      this.state.frameTimer = 0;
      this.state.frameIndex =
        (this.state.frameIndex + 1) % PLAYER_SPRITE_IMAGES_COUNT;
    }
    if (this.state.shrinkFrameIndex < SHRINK_SPRITE_IMAGES_COUNT) {
      this.state.shrinkFrameTimer++;
      if (this.state.shrinkFrameTimer > 24) {
        this.state.shrinkFrameTimer = 0;
        this.state.shrinkFrameIndex = this.state.frameIndex + 1;
      }
    }
  }

  _jump_animation(gameEnding: boolean, musicOn: boolean) {
    if (gameEnding) return;
    if (this.state.y >= this.groundY - this.state.height) {
      this.state.y = this.groundY - this.state.height;
      this.state.vy = 0;
      this.state.jumping = false;
      if (this.state.is_plumiting) {
        this.state.is_plumiting = false;
        this.duck(musicOn);
      }
    }
  }

  die() {
    this.jump();
    this.plumit();
    setTimeout(() => {
      this.state.jumping = false;
    }, 1000);
  }
}
