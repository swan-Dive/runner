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
const GROUND_SPRITE_HEIGHT = 46;
const GROUND_SPRITE_WIDTH = 1195;
export class Ground {
    constructor(y, width, height = GROUND_SPRITE_HEIGHT) {
        this.offset = 0;
        this.image = new Image();
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
        this.image.src = "./dist/assets/game/ground.png";
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
    getCurrentImage() {
        return this.image;
    }
    draw(ctx, gameEnding, speed) {
        if (!ctx) {
            throw new Error("No context provided");
        }
        if (!gameEnding) {
            this.offset += speed;
            if (this.offset >= GROUND_SPRITE_WIDTH - this.width) {
                this.offset = 0;
            }
        }
        ctx.drawImage(this.getCurrentImage(), this.offset, 0, this.width, this.height, 0, this.y - 25, this.width, this.height);
        ctx.fillStyle = "#ccc";
        // this.pebbles.forEach((pebble) => {
        //   pebble.draw(ctx);
        // });
    }
}
