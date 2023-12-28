import Tile from "./tile";

export class DoorTile extends Tile {

    private closedSpriteIndex: number;
    private openSpriteIndex: number;

    public isOpened: boolean = false;

    public get spriteIndex() {
        return this.isOpened ? this.openSpriteIndex : this.closedSpriteIndex
    }

    constructor(openSpriteIndex: number, closedSpriteIndex: number) {
        super();
        this.openSpriteIndex = openSpriteIndex;
        this.closedSpriteIndex = closedSpriteIndex;
    }

    public override get canWalk(): boolean {
        return this.isOpened;
    }

    public override get transparent(): boolean {
        return this.isOpened;
    }

    public override interact(): boolean {
        this.isOpened = !this.isOpened;
        return true;
    }
}