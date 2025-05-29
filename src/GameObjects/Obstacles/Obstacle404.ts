import { Player } from "../../Player.js";
import { GameObject } from "../GameObject.js";

export class Obstacle404 extends GameObject {
  height: number;
  width: number;
  img: HTMLImageElement;

  constructor(x: number, y: number) {
    super(x, y);
    this.height = 19;
    this.width = 62;
    this.img = new Image();
    this.img.src = "./dist/assets/obstacles/404.png";
  }

  draw(ctx: CanvasRenderingContext2D | null) {
    if (!ctx) {
      throw new Error("No context provided");
    }

    ctx.drawImage(
      this.img,
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
