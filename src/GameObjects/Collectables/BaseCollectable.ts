import { GameObject } from "../GameObject.js";

export abstract class BaseCollectable extends GameObject {
  abstract coinValue: number;
  frameIndex: number = 0;
  frameTimer: number = 0;
  abstract spriteImagesCount: number;
  abstract spriteMapper: number[][];

  getCoinValue(): number {
    return this.coinValue;
  }

  updateFrameIndex() {
    this.frameIndex = (this.frameIndex + 1) % this.spriteImagesCount;
  }

  getCurrentImageCoords() {
    return this.spriteMapper[this.frameIndex];
  }

  isObstacleCollision(obj: GameObject) {
    return (
      obj.x <= this.x &&
      obj.x + obj.width >= this.x &&
      obj.y + obj.height >= this.y - this.height
    );
  }
}
