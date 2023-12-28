import Tile from "./tile";

export class FloorTile extends Tile {
    private _spriteIndex: number;

    public get spriteIndex() {
        return this._spriteIndex;
    }

    constructor(spriteIndex: number) {
        super();
        this._spriteIndex = spriteIndex;
    }
}