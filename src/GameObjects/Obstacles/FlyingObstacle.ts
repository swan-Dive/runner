import { Player } from "../../Player.js";
import { GameObject } from "../GameObject.js";

export class FlyingObstacle extends GameObject {
  height: number;
  width: number;
  images: HTMLImageElement[];
  frameIndex: number;
  frameTimer: number;
  constructor(x: number, y: number) {
    super(x, y);
    this.height = 38;
    this.width = 62;
    this.images = [new Image(), new Image()];
    this.images[0].src = "./dist/assets/pter-1.png";
    this.images[1].src = "./dist/assets/pter-2.png";
    this.frameIndex = 0;
    this.frameTimer = 0;
  }

  getCurrentImage() {
    return this.images[this.frameIndex];
  }

  draw(ctx: CanvasRenderingContext2D | null) {
    this.frameTimer++;
    if (this.frameTimer > 40) {
      this.frameTimer = 0;
      this.frameIndex = (this.frameIndex + 1) % this.images.length;
    }
    if (!ctx) {
      throw new Error("No context provided");
    }

    ctx.drawImage(
      this.getCurrentImage(),
      this.x,
      this.y - this.height + 10,
      this.width,
      this.height
    );
  }

  isCollision(player: Player) {
    return (
      player.state.x < this.x + this.width &&
      player.state.x + player.state.width - 20 > this.x &&
      player.state.y < this.y - this.height + 25 &&
      player.state.y + player.state.height > this.y - this.height + 10
    );
  }
}
