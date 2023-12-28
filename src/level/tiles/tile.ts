export default class Tile {
    public get spriteIndex() {
        return 0;
    }

    public get transparent(): boolean {
        return true;
    }

    public get canWalk(): boolean {
        return true;
    }

    public interact(): boolean {
        return false;
    }
}