import { BaseCollectable } from "./BaseCollectable.js";
const WIDTH = 64;
const HEIGHT = 64;
export class EnergyCollectable extends BaseCollectable {
    constructor(x, y) {
        super(x, y);
        this.width = WIDTH;
        this.height = HEIGHT;
        this.coinValue = 50;
        this.image = new Image();
        this.image.src = "./dist/assets/collectables/energy.png";
    }
    draw(ctx) {
        if (!ctx) {
            throw new Error("No context provided");
        }
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
    isCollision(player) {
        return (player.state.x < this.x &&
            player.state.x + player.state.width > this.x &&
            player.state.y < this.y - this.height + 100 &&
            player.state.y + player.state.height > this.y - this.height);
    }
}
