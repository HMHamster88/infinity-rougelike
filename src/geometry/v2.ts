import * as Phaser from 'phaser';

export default class V2 {
    x: number;
    y: number;

    public static DIRECTIONS: V2[] = [
        new V2(0, 1),
        new V2(1, 0),
        new V2(0, -1),
        new V2(-1, 0)
    ];

    constructor(x: number = 0, y: number = 0) {
        this.x = x
        this.y = y
    }

    public add(v: V2): V2 {
        return new V2(this.x + v.x, this.y + v.y);
    }

    public scale(factor: number): V2 {
        return new V2(this.x * factor, this.y * factor);
    }

    public toVector2(): Phaser.Math.Vector2 {
        return new Phaser.Math.Vector2(this.x, this.y);
    }

    public equals(v: V2): boolean {
        return this.x == v.x && this.y == v.y;
    }

    public static iterate2D(toX: number, toY: number, fun: (v: V2) => void, fromX: number = 0, fromY: number = 0, stepX: number = 1, stepY: number = 1) {
        for (var y = fromY; y < toY; y += stepY) {
            for(var x = fromX; x < toX; x += stepX) {
                fun(new V2(x, y));
            }
        } 
    }

    public static fromVector2Like(v: Phaser.Types.Math.Vector2Like) {
        return new V2(v.x, v.y);
    }
}