import { Player } from "../../Player.js";
import { BaseCollectable } from "./BaseCollectable.js";

const WIDTH = 48;
const HEIGHT = 48;

export class PizzaCollectable extends BaseCollectable {
  width: number = WIDTH;
  height: number = HEIGHT;

  coinValue: number = 75;
  image: HTMLImageElement;

  constructor(x: number, y: number) {
    super(x, y);

    this.image = new Image();
    this.image.src = "./dist/assets/collectables/pizza_slice.png";
  }

  draw(ctx: CanvasRenderingContext2D | null) {
    if (!ctx) {
      throw new Error("No context provided");
    }

    ctx.drawImage(
      this.image,

      this.x,
      this.y,
      this.width,
      this.height
    );
  }

  isCollision(player: Player) {
    return (
      player.state.x < this.x &&
      player.state.x + player.state.width > this.x &&
      player.state.y < this.y - this.height + 60 &&
      player.state.y + player.state.height > this.y - this.height + 10
    );
  }
}
