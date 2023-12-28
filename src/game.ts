import * as Phaser from 'phaser';
import V2 from './geometry/v2';
import DungeonLevelGenerator from './level/dungeon-level-generator';
import LevelController from './level/level-controller';

export default class Demo extends Phaser.Scene
{
    tileMap: Phaser.Tilemaps.Tilemap;
    levelController: LevelController;

    player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

    keyUp: Phaser.Input.Keyboard.Key;
    keyDown: Phaser.Input.Keyboard.Key;
    keyLeft: Phaser.Input.Keyboard.Key;
    keyRight: Phaser.Input.Keyboard.Key;

    marker: Phaser.GameObjects.Graphics;

    constructor ()
    {
        super('demo');
    }

    preload ()
    {
        this.load.image('tiles0', 'assets/map-tiles/DungeonTiles32px.png');
        this.load.image('fow-tile', 'assets/map-tiles/fow.png');
        this.load.image('player',  'assets/warrior.png');
    }

    create ()
    {

       

        this.keyLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyDown = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keyRight = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keyUp = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);

        var mapGenerator = new DungeonLevelGenerator();
        var level = mapGenerator.generateMap();


        var tileMapData: number[][] = [];

        for (var y = 0; y < level.width; y++) {
            tileMapData[y] = [];
            for (var x = 0; x < level.height; x++) {
                tileMapData[y][x] = level.tiles.get(new V2(x, y)).spriteIndex;
            }
        }

        this.tileMap = this.make.tilemap({ tileWidth: 32, tileHeight: 32, width: level.width, height: level.height, data: tileMapData});
        const tiles = this.tileMap.addTilesetImage('tiles0');
        const fowTiles = this.tileMap.addTilesetImage('fow-tile');
        
        const layer = this.tileMap.createLayer(0, tiles);


        const fogOfWarLayer = this.tileMap.createBlankLayer('fow', fowTiles);
        fogOfWarLayer.setDepth(10);
        fogOfWarLayer.fill(0);

        this.marker = this.add.graphics();
        this.marker.lineStyle(2, 0x000000, 1);
        this.marker.strokeRect(0, 0, this.tileMap.tileWidth * layer.scaleX, this.tileMap.tileHeight * layer.scaleY);

        /*level.tiles.iterate((pos, tile) => {
            layer.putTileAt(tile.spriteIndex, pos.x, pos.y);
            //fogOfWarLayer.putTileAt(0, pos.x, pos.y);
        });*/

        var startPoint = new Phaser.Math.Vector2(level.startPoint).scale(this.tileMap.tileWidth);
        this.player = this.physics.add.sprite(startPoint.x, startPoint.y, 'player');

        this.tileMap.setCollision(level.collisionSpriteIndexes, true, true, 0);
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setZoom(2, 2);

        this.physics.add.collider(this.player, layer);

        this.levelController = new LevelController(this.tileMap, level);


        this.input.on('pointerdown', function (pointer)
        {
            const worldPoint = this.input.activePointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2;
    
            if (this.input.manager.activePointer.isDown) {
                this.levelController.click(V2.fromVector2Like(worldPoint));
            }
        }, this);
    }


    update (time, delta) 
    {
        this.player.body.setVelocity(0);

        // Horizontal movement
        if (this.keyLeft.isDown)
        {
            this.player.body.setVelocityX(-500);
        }
        else if (this.keyRight.isDown)
        {
            this.player.body.setVelocityX(500);
        }

        // Vertical movement
        if (this.keyUp.isDown)
        {
            this.player.body.setVelocityY(-500);
        }
        else if (this.keyDown.isDown)
        {
            this.player.body.setVelocityY(500);
        }

        const worldPoint = this.input.activePointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2;

        // Rounds down to nearest tile
        const pointerTileX = this.tileMap.worldToTileX(worldPoint.x);
        const pointerTileY = this.tileMap.worldToTileY(worldPoint.y);

        // Snap to tile coordinates, but in world space
        this.marker.x = this.tileMap.tileToWorldX(pointerTileX);
        this.marker.y = this.tileMap.tileToWorldY(pointerTileY);

        //this.updateMap();
        this.levelController.updateFogOfWar(new V2(this.player.x, this.player.y));
    }

    /*updateMap ()
    {
        const origin = this.tileMap.getTileAtWorldXY(this.player.x, this.player.y);

        this.tileMap.forEachTile(tile =>
        {
            const dist = Phaser.Math.Distance.Chebyshev(
                origin.x,
                origin.y,
                tile.x,
                tile.y
            );

            tile.setAlpha(1 - 0.3 * dist);
        });
    }*/
}

const config = {
    type: Phaser.AUTO,
    backgroundColor: '#000000',
    width: 800,
    height: 600,
    scene: Demo,
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }
        }
    },
};

const game = new Phaser.Game(config);
