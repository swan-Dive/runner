import { Player } from "../../Player.js";
import { GameObject } from "../GameObject.js";

export class DefaultObstacle extends GameObject {
  height: number;
  width: number;
  image: HTMLImageElement;

  constructor(x: number, y: number) {
    super(x, y);

    this.image = new Image();
    this.image.src = "./dist/assets/cactus.png";

    this.height = 57;
    this.width = 32;
  }

  draw(ctx: CanvasRenderingContext2D | null) {
    if (!ctx) {
      throw new Error("No context provided");
    }
    ctx.fillStyle = "green";

    ctx.drawImage(
      this.image,
      this.x,
      this.y - this.height + 10,
      this.width,
      this.height
    );
  }

  isCollision(player: Player) {
    return (
      player.state.x < this.x &&
      player.state.x + player.state.width - 25 > this.x &&
      player.state.y < this.y - this.height + 40 &&
      player.state.y + player.state.height > this.y - this.height + 10
    );
  }
}
