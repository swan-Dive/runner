import { BaseCollectable } from "./BaseCollectable.js";
const COIN_WIDTH = 30;
const COIN_HEIGHT = 30;
export class GoldenCollectable extends BaseCollectable {
    constructor(x, y) {
        super(x, y);
        this.height = COIN_HEIGHT;
        this.width = COIN_WIDTH;
        this.coinValue = 50;
        this.spriteImagesCount = 5;
        this.spriteMapper = [
            [30, 40],
            [64, 40],
            [96, 40],
            [132, 40],
            [166, 40],
        ];
        this.image = new Image();
        this.image.src = "./dist/assets/game/coins_sprite.png";
        this.height = COIN_WIDTH;
        this.width = COIN_HEIGHT;
    }
    draw(ctx) {
        if (!ctx) {
            throw new Error("No context provided");
        }
        this.frameTimer++;
        const coords = this.getCurrentImageCoords();
        if (this.frameTimer > 20) {
            this.frameTimer = 0;
            this.updateFrameIndex();
        }
        ctx.drawImage(this.image, coords[0], coords[1], this.width, this.height, this.x, this.y, this.width, this.height);
    }
    isCollision(player) {
        return (player.state.x < this.x &&
            player.state.x + player.state.width - 25 > this.x &&
            player.state.y < this.y - this.height + 40 &&
            player.state.y + player.state.height > this.y - this.height + 10);
    }
}
