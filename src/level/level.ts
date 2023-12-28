import Tile from "./tiles/tile"
import Array2D from "../geometry/array2d";

export default class Level {
    width: integer;
    height: integer;
    readonly tiles: Array2D<Tile>;
    startPoint: Phaser.Math.Vector2;
    collisionSpriteIndexes: number[] = [];

    constructor(tiles: Array2D<Tile>, startPoint: Phaser.Math.Vector2, collisionSpriteIndexes: number[]) {
        this.tiles = tiles;
        this.height = tiles.height;
        this.width = tiles.width;
        this.startPoint = startPoint;
        this.collisionSpriteIndexes = collisionSpriteIndexes;
    }
}