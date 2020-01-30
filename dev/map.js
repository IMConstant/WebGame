import GameManager from "./managers/gameManager.js";
import {Sprite} from "./objects/objects.js";
import {CSolid} from "./objects/components.js";

export default class Map {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.ready = false;

        this.map = [];
        this.unwalkableList = [];
        this.background = new Image();
        this.background.src = './images/background.jpg';
    }

    getTileInfoByPosition(position) {
        let x = Math.floor(position.x / 64);
        let y = Math.floor(position.y / 64);

        let tile = this.map.layers[0].data[y * this.map.width + x] - 1;

        return {
            walkable: !this.unwalkableList.includes(tile)
        }
    }

    parseObjects(assetData) {
        let manager = GameManager.getInstance().entitiesManager;

        for (let layer = 0; layer < this.map.layers.length; layer++) {
            let layerData = this.map.layers[layer];

            if (layerData.type === "objectgroup") {
                for (let object of layerData.objects) {
                    let tileId = object.gid - 1;

                    for (let tile of assetData.tiles) {
                        if (tile.properties && tile.properties[0].name === 'unwalkable' && tile.properties[0].value && !this.unwalkableList.includes(tile.id)) {
                            this.unwalkableList.push(tile.id);
                        }

                        if (tile.id === tileId) {
                            let sprite = new Sprite();
                            let collider = tile.objectgroup.objects[0];
                            let position = sprite.getComponent('position').position;
                            position.x = object.x + collider.x + collider.width / 2;
                            position.y = object.y - object.height + collider.y + collider.height / 2;
                            sprite.getComponent('circleShape').radius = collider.width / 2;
                            sprite.getComponent('sprite').staticImage = {
                                tile: tileId + 1,
                                tileSize: 64,
                                offsetX: position.x - object.x,
                                offsetY: position.y - (object.y - object.height)
                            };

                            if (collider.properties[0].value) {
                                sprite.addComponent('solid', CSolid.prototype);
                                sprite.addGroup('solid');
                            }

                            manager.addEntity(sprite);
                        }
                    }
                }
            }
        }
    }

    parse(data, assetData) {
        this.width = data.width * 64;
        this.height = data.height * 64;
        this.map = data;
        this.assetData = assetData;

        this.parseObjects(assetData);

        this.ready = true;
    }

    draw(ctx) {
        if (!this.ready) {
            return;
        }

        let picture = GameManager.getInstance().sourceManager.backroundPicture;

        for (let layer = 0; layer < this.map.layers.length; layer++) {
            let layerData = this.map.layers[layer];
            let tileSize = 64;

            if (layer === 1) {
                GameManager.getInstance().entitiesManager.draw(true, (e1, e2) => {
                    let p1 = e1.getComponent('position').position;
                    let p2 = e2.getComponent('position').position;
                    let r1 = e1.getComponent('circleShape').radius;
                    let r2 = e2.getComponent('circleShape').radius;

                    return (p1.y + r1) - (p2.y + r2);
                });
            }

            if (layerData.type === "tilelayer") {
                for (let i = 0; i < this.height; i += tileSize) {
                    for (let j = 0; j < this.width; j += tileSize) {
                        let tile = this.map.layers[layer].data[(i / tileSize) * (this.width / tileSize) + j / tileSize];

                        if (tile) {
                            this.drawTile(ctx, picture, tile, tileSize, j, i);
                        }
                    }
                }
            }
            else if (layerData.type === "objsdectgroup") {
                for (let object of this.map.layers[layer].objects) {
                    if (object.gid) {
                        this.drawTile(ctx, picture, object.gid, tileSize, object.x, object.y - tileSize);
                    }
                }
            }
        }

    }

    drawTile(ctx, picture, tile, tileSize, x, y) {
        ctx.drawImage(picture,
            ((tile - 1) % 20) * tileSize,
            (Math.floor((tile - 1) / 20)) * tileSize,
            tileSize,
            tileSize,
            x + Math.floor(GameManager.getInstance().viewManager.worldOffset.x),
            y + Math.floor(GameManager.getInstance().viewManager.worldOffset.y),
            tileSize,
            tileSize
        );
    }
}