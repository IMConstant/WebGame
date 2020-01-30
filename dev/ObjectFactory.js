import {Entity} from "./objects/objects.js";
import {CPosition,
    CMovable,
    CCircleShape,
    CTimeDestroy,
    CShootable,
    CHasGravity,
    CSubjectToGravity,
    CSolid,
    CHitPoints,
    CDamage,
    CEnemyAICore,
    CSmoothMove,
    CSprite} from "./objects/components.js";
import {Position, Vector} from "./basics/basics.js";
import {ShellGun, ShotGun} from "./weapons/weapons.js";

export default class ObjectFactory {
    constructor(ctx, entityManager) {
        this.entityManager = entityManager;
        this.ctx = ctx;

        this.enemiesStats = new Map([
            ['body', {
                'hp': 100,
                'damage': 500,
                'radius': 32,
                'speed': 1,
                'weapon': ShellGun.prototype
            }],
            ['orc', {
                'hp': 30,
                'damage': 200,
                'radius': 32,
                'speed': 1.5,
                'weapon': ShellGun.prototype
            }],
            ['skeleton', {
                'hp': 150,
                'damage': 1000,
                'radius': 32,
                'speed': 0.5,
                'weapon': ShellGun.prototype
            }]
        ]);
    }

    createEnemy(enemyType, position) {
        let enemy = new Entity(this.entityManager);
        let enemyStats = this.enemiesStats.get(enemyType);

        enemy.addComponent('position', CPosition.prototype, position);
        enemy.addComponent('move', CMovable.prototype, enemyStats['speed']);
        enemy.addComponent('solid', CSolid.prototype);
        enemy.addComponent('damage', CDamage.prototype, enemyStats['damage']);
        enemy.addComponent('hp', CHitPoints.prototype, enemyStats['hp']);
        enemy.addComponent('circleShape', CCircleShape.prototype, this.ctx, enemyStats['radius'], 'transparent');
        enemy.addComponent('shooting', CShootable.prototype, new enemyStats['weapon'].constructor(), 2000);
        enemy.addComponent('enemy', CEnemyAICore.prototype);
        enemy.addComponent('sprite', CSprite.prototype, enemyType);

        enemy.addGroup('solid');

        return enemy;
    }

    createEmptySprite(copyEntity) {
        let sprite = new Entity(this.entityManager);

        let cPosition = copyEntity.getComponent('position');
        let cCircle = copyEntity.getComponent('circleShape');
        let cSprite = copyEntity.getComponent('sprite');

        sprite.addComponent('position', CPosition.prototype, new Position(cPosition.position.x, cPosition.position.y));
        sprite.addComponent('circleShape', CCircleShape.prototype, this.ctx, cCircle.radius, 'transparent');
        sprite.addComponent('sprite', CSprite.prototype, cSprite.assetName);

        return sprite;
    }

    createSimpleObject() {
        let object = new Entity(this.entityManager);

        object.addComponent('position', CPosition.prototype);
        object.addComponent('solid', CSolid.prototype);

        object.addGroup('solid');

        return object;
    }

    createShip(position, shootingRate) {
        let ship = new Entity(this.entityManager);

        ship.addComponent('position', CPosition.prototype, position);
        ship.addComponent('move', CSmoothMove.prototype, 2);
        ship.addComponent('circleShape', CCircleShape.prototype, this.ctx, 32);
        ship.addComponent('shooting', CShootable.prototype, new ShotGun(), shootingRate);
        ship.addComponent('solid', CSolid.prototype);
        ship.addComponent('hp', CHitPoints.prototype, 30000);
        ship.addComponent('sprite', CSprite.prototype, 'elf');

        ship.addGroup('solid');

        return ship;
    }

    createPlanet(position, mass) {
        let planet = new Entity(this.entityManager);

        planet.addComponent('position', CPosition.prototype, new Position(position.x, position.y));
        planet.addComponent('circleShape', CCircleShape.prototype, this.ctx, 20, 'green');
        planet.addComponent('hasGravity', CHasGravity.prototype, mass);
        planet.addComponent('solid', CSolid.prototype);

        planet.addGroup('solid');

        return planet;
    }
}