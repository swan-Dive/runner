import { GameObject } from "../GameObject.js";
export class BaseCollectable extends GameObject {
    constructor() {
        super(...arguments);
        this.frameIndex = 0;
        this.frameTimer = 0;
    }
    getCoinValue() {
        return this.coinValue;
    }
    updateFrameIndex() {
        this.frameIndex = (this.frameIndex + 1) % this.spriteImagesCount;
    }
    getCurrentImageCoords() {
        return this.spriteMapper[this.frameIndex];
    }
    isObstacleCollision(obj) {
        return (obj.x <= this.x &&
            obj.x + obj.width >= this.x &&
            obj.y + obj.height >= this.y - this.height);
    }
}
