import Rect from "../geometry/rect";
import Level from "./level";
import Tile from "./tiles/tile";
import Array2D from "../geometry/array2d";
import V2 from "../geometry/v2";
import * as Phaser from 'phaser';
import { FloorTile } from "./tiles/floor-tile";
import { WallTile } from "./tiles/wall-tile";
import { DoorTile } from "./tiles/door-tile";

export default class DungeonLevelGenerator {
    width: number = 64 + 1;
    height: number = 64 + 1;
    roomSize: number = 2;
    roomTries: number = 100;
    windingPercent: number = 50;
    extraConnectorChance: number = 1;


    bounds: Rect;
    rooms: Rect[] = [];
    doors: V2[] = [];
    currentRegion: number = 0;
    grid: Array2D<boolean>; // false means wall
    regions: Array2D<number>;

    wallTileIndex = [0, 1, 2, 3];
    floorTileIndex = [4, 5, 6, 7];
    openDoorTileIndex = 9;
    closedDoorTileIndex = 8;

    collisionTileIndexes = this.wallTileIndex.concat(this.closedDoorTileIndex);

    generateMap() : Level {

        this.bounds = new Rect(0, 0, this.width, this.height);

        this.grid = new Array2D(this.width, this.height, () => false);

        this.regions = new Array2D(this.width, this.height, () => 0);

        this.createRooms();
        
        V2.iterate2D(this.width, this.height, v => {
            if (!this.grid.get(v)) {
                this.growMaze(v);
            }
        }, 1, 1, 2, 2);

        this.connectRegions();

        this.removeDeadEnds();

        const tiles = new Array2D<Tile>(this.width, this.height, () => new Tile());

        tiles.iterateSet((pos) => {
            if (this.grid.get(pos))
            {
                return new FloorTile(Phaser.Utils.Array.GetRandom(this.floorTileIndex));
            }
            return new WallTile(Phaser.Utils.Array.GetRandom(this.wallTileIndex));
        })

        this.doors.forEach(doorPos => {
            tiles.put(doorPos, new DoorTile(this.openDoorTileIndex, this.closedDoorTileIndex));
        })

        var startPoint = this.rooms[0].center;
        return new Level(tiles, startPoint, this.collisionTileIndexes);
    }

    private removeDeadEnds()
        {
            var done = false;
            while (!done)
            {
                done = true;
                V2.iterate2D(this.width - 1, this.height - 1, pos => {
                    if (!this.grid.get(pos)) {
                        return;
                    }

                    var exits = 0;
                    V2.DIRECTIONS.forEach(dir => {
                        var p = pos.add(dir);
                        if (this.grid.get(p))
                        {
                            exits++;
                        }
                    });

                    if (exits != 1) {
                        return;
                    }

                    done = false;
                    this.grid.put(pos, false);
                }, 1, 1)
            }
        }

    private connectRegions()
        {
            var connectorRegions = new Map<V2, Set<number>>(); // new Dictionary<PointInt, HashSet<int>>();

            V2.iterate2D(this.width - 1, this.height - 1, pos => {
                if (this.grid.get(pos)) {
                        return;
                }

                var regs = new Set<number>(); // new HashSet<int>();
                V2.DIRECTIONS.forEach(dir => {
                    var p = pos.add(dir);
                    var region = this.regions.get(p);
                    if (region != 0)
                    {
                        regs.add(region);
                    }
                });

                if (regs.size < 2) {
                    return;
                }

                connectorRegions.set(pos, regs);
            }, 1, 1);

            var connectors = Array.from(connectorRegions.keys());

            var merged = new Map<number, number>();
            var openRegions = new Set<number>();
            for (var i = 0; i <= this.currentRegion; i++) {
                merged[i] = i;
                openRegions.add(i);
            }

            while (openRegions.size > 1 && connectors.length > 0)
            {
                var connector = connectors[Phaser.Math.Between(0, connectors.length - 1)];
                this.addJunction(connector);

                var mregs: number[] = Array.from(connectorRegions.get(connector).values()).map(r => merged[r]);

                var dest = mregs[0];
                var sources = mregs.slice(1);

                for (var i = 0; i <= this.currentRegion; i++)
                {
                    if (sources.includes(merged[i]))
                    {
                        merged[i] = dest;
                    }
                }

                for (var i = 0; i < sources.length; i++)
                {
                    openRegions.delete(sources[i]);
                }

                var connectorsToRemove = connectors.filter(pos => {
                    if (Phaser.Math.Distance.BetweenPoints(connector, pos) < 2)
                    {
                        return true;
                    }

                    var longSpanRegions = new Set(Array.from(connectorRegions.get(pos).values()).map((region) => merged[region]));

                    if (longSpanRegions.size > 1)
                    {
                        return false;
                    }

                    

                    return true;
                });

                connectorsToRemove.forEach(pos => {
                    if (Phaser.Math.Between(0, 99) < this.extraConnectorChance)
                    {
                        this.addJunction(pos);
                    }
                });

                connectors = connectors.filter(c => !connectorsToRemove.includes(c));
            }
        }
    
        private addJunction(pos: V2)
        {
            this.grid.put(pos, true);
            this.doors.push(pos);
        }

    growMaze(pos: V2)
        {
            const cells: V2[] = [];
            this.startRegion();
            cells.push(pos);
            this.carve(pos);

            var lastDir = new V2();

            while (cells.length > 0)
            {
                var cell = cells[cells.length - 1];
                var unmadeCells: V2[] = [];
                V2.DIRECTIONS.forEach(dir => {
                    if (this.canCarve(cell, dir))
                    {
                        unmadeCells.push(dir);
                    }
                })

                if (unmadeCells.length > 0)
                {
                    var dir: V2;
                    if (unmadeCells.find(v => lastDir.equals(v)) && Phaser.Math.Between(0, 99) > this.windingPercent)
                    {
                        dir = lastDir;
                    }
                    else
                    {
                        dir = Phaser.Utils.Array.GetRandom(unmadeCells);
                    }

                    this.carve(cell.add(dir));
                    this.carve(cell.add(dir.scale(2)));

                    cells.push(cell.add(dir.scale(2)));

                    lastDir = dir;
                }
                else
                {
                    cells.pop()
                    lastDir = new V2();
                }
            }
        }

        private canCarve(pos: V2,  dir: V2): boolean
        {
            if (!this.bounds.contains(pos.add(dir.scale(3)))) {
                return false;
            }

            var p = pos.add(dir.scale(2));
            return this.grid.get(p) == false;
        }

    private createRooms() {
        this.rooms = [];

            for (var i = 0; i < this.roomTries; i++)
            {
                var roomWidth = Phaser.Math.Between(1, 2 + this.roomSize) * 2 + 1;
                var roomHeight = Phaser.Math.Between(1, 2 + this.roomSize) * 2 + 1;

                var roomX = Phaser.Math.Between(0, (this.width - roomWidth) / 2 - 1) * 2 + 1;
                var roomY = Phaser.Math.Between(0, (this.height - roomHeight) / 2 - 1) * 2 + 1;

                var room = new Rect(roomX, roomY, roomWidth, roomHeight);

                var overlaps = this.rooms.find(r => r.overlaps(room));

                if (overlaps && overlaps.width > 0)
                {
                    continue;
                }

                this.rooms.push(room);

                this.startRegion();
                V2.iterate2D(room.right, room.bottom, pos => {
                    this.carve(pos);
                }, room.x, room.y);
            }
    }

    carve(pos: V2) {
        this.grid.put(pos, true);
        this.regions.put(pos, this.currentRegion);
    }

    startRegion() {
        this.currentRegion++;
    }
}