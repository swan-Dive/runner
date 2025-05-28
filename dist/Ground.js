import { GameObject } from "./GameObjects/GameObject.js";
class Pebble extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.width = parseInt((Math.random() * 4).toFixed(0));
        this.height = 3;
    }
    draw(ctx) {
        if (!ctx) {
            throw new Error("No context provided");
        }
        ctx.fillStyle = "#ccc";
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    isCollision(player) {
        return false;
    }
}
export class Ground {
    constructor(y, width, height = 2) {
        this.y = y;
        this.x = 0;
        this.width = width;
        this.height = height;
        this.pebbles = [
            new Pebble(width - 10, y + 10),
            new Pebble(width - 20, y + 10),
            new Pebble(width - 30, y + 10),
            new Pebble(width - 10, y + 10),
        ];
        this.spawnTimer = 0;
    }
    update(speed) {
        this.spawnTimer++;
        if (this.spawnTimer > 100 + Math.random() * 1000) {
            this.pebbles.push(new Pebble(this.width - 12, this.y + Math.random() * 10));
            this.pebbles.push(new Pebble(this.width - 10, this.y + Math.random() * 10));
            this.pebbles.push(new Pebble(this.width - 14, this.y + Math.random() * 10));
            this.spawnTimer = 0;
        }
        this.pebbles.forEach((pebble) => {
            pebble.move(speed);
        });
        this.pebbles = this.pebbles.filter((pebble) => pebble.isOOB());
    }
    draw(ctx) {
        if (!ctx) {
            throw new Error("No context provided");
        }
        ctx.fillStyle = "#ccc";
        ctx.fillRect(this.x, this.y, this.width, this.height);
        this.pebbles.forEach((pebble) => {
            pebble.draw(ctx);
        });
    }
}
