import * as Phaser from 'phaser';
import V2 from '../geometry/v2';
import Level from './level';
import TilemapHelper from '../geometry/tilemap-helper';

export default class LevelController {
    readonly tileMap: Phaser.Tilemaps.Tilemap;
    readonly level: Level;

    constructor(tileMap: Phaser.Tilemaps.Tilemap, level: Level) {
        this.tileMap = tileMap
        this.level = level
    }

    public click(worldPoint: V2) {
        var position = this.toTilePosition(worldPoint);
        const tile = this.level.tiles.get(position);
        if(tile.interact()) {
            this.tileMap.putTileAt(tile.spriteIndex, position.x, position.y, true, 0);
        }
    }

    public toTilePosition(worldPoint: V2): V2 {
        return new V2(this.tileMap.worldToTileX(worldPoint.x), this.tileMap.worldToTileY(worldPoint.y));
    }

    public updateFogOfWar(worldPoint: V2) {
        var tilePosition = this.toTilePosition(worldPoint);
        var radius = 6;
        var fadeRadius = 2;
        var withoutFadeRadius = radius - fadeRadius;

        var circelPoints = TilemapHelper.getCircle(tilePosition, radius)

        var allPoints = [...new Set(circelPoints.flatMap(circelPoint => TilemapHelper.raycast(tilePosition, circelPoint,
            testTilePos => {
                var tile = this.level.tiles.safeGet(testTilePos);
                return tile == null || !tile.transparent;
            }
        )))];

        allPoints.forEach(pos => {
            var tile = this.tileMap.getTileAt(pos.x, pos.y, true, 'fow');
            if (tile == null) {
                return;
            }
            var distance = Phaser.Math.Distance.Between(worldPoint.x, worldPoint.y, this.tileMap.tileToWorldX(pos.x), this.tileMap.tileToWorldY(pos.y));
            var tileDistance = distance / this.tileMap.tileWidth;
            var newAlpha = (tileDistance < withoutFadeRadius) ? 0 : 1 - (radius - tileDistance) / fadeRadius;
            if (newAlpha < tile.alpha) {
                tile.alpha = newAlpha;
            }
        })
    }

}