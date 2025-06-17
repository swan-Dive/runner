import { GameObject } from "../GameObject.js";
export class Obstacle500 extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.image = new Image();
        this.image.src = "./dist/assets/obstacles/bug.png";
        this.height = 64;
        this.width = 64;
    }
    draw(ctx) {
        if (!ctx) {
            throw new Error("No context provided");
        }
        ctx.fillStyle = "green";
        ctx.drawImage(this.image, this.x, this.y - this.height + 10, this.width, this.height);
    }
    isCollision(player) {
        return (player.state.x - this.width / 2 < this.x &&
            player.state.x + player.state.width - 40 > this.x &&
            player.state.y < this.y - this.height + 40 &&
            player.state.y + player.state.height > this.y - this.height + 10);
    }
}
