import { GameObject } from "../GameObject.js";

export abstract class BaseCollectable extends GameObject {
  abstract coinValue: number;
  frameIndex: number = 0;
  frameTimer: number = 0;

  getCoinValue(): number {
    return this.coinValue;
  }

  isObstacleCollision(obj: GameObject) {
    return (
      obj.x - 40 <= this.x && obj.x + obj.width + 40 >= this.x
      // obj.y + obj.height >= this.y - this.height
    );
  }
}
