import * as Phaser from 'phaser';

export default class Rect {
    x: number;
    y: number;
    width: number;
    height: number;

    constructor(
        x: number,
        y: number,
        width: number,
        height: number
    ) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
    }

    get right(): number {
        return this.x + this.width;
    }

    get bottom(): number {
        return this.y + this.height;
    }

    get position(): Phaser.Types.Math.Vector2Like {
        return {x: this.x, y: this.y};
    }

    get center(): Phaser.Math.Vector2 {
        return new Phaser.Math.Vector2(this.x + this.width /2 , this.y + this.height / 2);
    }

    overlaps(rect: Rect): boolean {
        return this.x <= rect.right && rect.x <= this.right && this.y <= rect.bottom && rect.y <= this.bottom;
    }

    contains(point: Phaser.Types.Math.Vector2Like) {
        return point.x >= this.x && point.x <= this.right && point.y >= this.y && point.y <= this.bottom;
    }
}