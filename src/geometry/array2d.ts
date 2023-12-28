import V2 from "./v2";

export default class Array2D<Type> {
    readonly width: number;
    readonly height: number;

    private internalArray: Type[][];

    constructor(width: number, height: number, defaultValueGenerator: () => Type) {
        this.width = width;
        this.height = height;
        this.internalArray = new Array(height)
        .fill(false)
        .map(() => 
            new Array(width).fill(defaultValueGenerator())
        );
    }

    public get(v: V2): Type {
        return this.internalArray[v.y][v.x];
    }

    public safeGet(v: V2) {
        if (v.x < 0 || v.x >= this.width || v.y < 0 || v.y >= this.height) {
            return null;
        }
        return this.get(v);
    }

    public put(v: V2, item: Type) {
        this.internalArray[v.y][v.x] = item;
    }

    public iterate(fun: (v: V2, item: Type) => void) {
        for (var y = 0; y < this.height; y++) {
            for(var x = 0; x < this.width; x++) {
                fun(new V2(x, y), this.internalArray[y][x]);
            }
        }
    }

    public iterateSet(setFun: (v: V2) => Type) {
        for (var y = 0; y < this.height; y++) {
            for(var x = 0; x < this.width; x++) {
                this.internalArray[y][x] =  setFun(new V2(x, y));
            }
        }
    }
}