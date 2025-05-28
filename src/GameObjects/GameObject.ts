import { Player } from "../Player.js";

export abstract class GameObject {
  abstract width: number;
  abstract height: number;
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  move(speed: number) {
    this.x -= speed;
  }

  abstract draw(ctx: CanvasRenderingContext2D | null): void;

  isOOB() {
    return this.x + this.width > 0;
  }

  abstract isCollision(player: Player): boolean;
}
