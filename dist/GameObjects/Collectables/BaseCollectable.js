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
    isObstacleCollision(obj) {
        return (obj.x - 40 <= this.x && obj.x + obj.width + 40 >= this.x
        // obj.y + obj.height >= this.y - this.height
        );
    }
}
