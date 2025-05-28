export class GameObject {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    move(speed) {
        this.x -= speed;
    }
    isOOB() {
        return this.x + this.width > 0;
    }
}
