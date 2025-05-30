import { GameObject } from "../GameObject.js";
export class Obstacle404 extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.height = 19;
        this.width = 62;
        this.img = new Image();
        this.img.src = "./dist/assets/obstacles/404.png";
    }
    draw(ctx) {
        if (!ctx) {
            throw new Error("No context provided");
        }
        ctx.drawImage(this.img, this.x, this.y - this.height + 10, this.width, this.height);
    }
    isCollision(player) {
        return (player.state.x < this.x + this.width &&
            player.state.x + player.state.width - 20 > this.x &&
            player.state.y < this.y - this.height + 25 &&
            player.state.y + player.state.height > this.y - this.height + 10);
    }
}
