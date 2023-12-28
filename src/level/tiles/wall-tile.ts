import Tile from "./tile";

export class WallTile extends Tile {

    private _spriteIndex: number;

    public get spriteIndex() {
        return this._spriteIndex;
    }

    constructor(spriteIndex: number) {
        super();
        this._spriteIndex = spriteIndex;
    }

    public override get canWalk(): boolean {
        return false;
    }

    public override get transparent(): boolean {
        return false;
    }
}