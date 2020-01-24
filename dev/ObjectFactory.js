import {Entity} from "./objects/objects.js";
import {CPosition, CMovable, CCircle, CTimeDestroy, CShootable, CHasGravity, CSubjectToGravity, CSolid, CHitPoints, CDamage, CEnemyAICore} from "./objects/components.js";
import {Position, Vector} from "./basics/basics.js";
import {ShellGun, ShotGun} from "./weapons/weapons.js";

export default class ObjectFactory {
    constructor(ctx, entityManager) {
        this.entityManager = entityManager;
        this.ctx = ctx;
    }

    createRandomAsteroid(borders) {
        let asteroid = new Entity(this.entityManager);
        let asteroidPosition = new Position(Math.random() * borders.x, Math.random() * borders.y);
        let vectorXComponent = 2 * Math.random() - 1;
        let vectorYComponent = Math.sqrt(1 - Math.pow(vectorXComponent, 2));
        let asteroidVelocity = 0.5 + Math.random();
        let asteroidDirectionVector = new Vector(vectorXComponent, vectorYComponent);

        asteroid.addComponent('position', CPosition.prototype, asteroidPosition);
        asteroid.addComponent('move', CMovable.prototype, asteroidVelocity, asteroidDirectionVector);
        asteroid.addComponent('solid', CSolid.prototype);
        asteroid.addComponent('subjectToGravity', CSubjectToGravity.prototype);
        asteroid.addComponent('damage', CDamage.prototype, 300);
        asteroid.addComponent('hp', CHitPoints.prototype, 50);
        asteroid.addComponent('circleShape', CCircle.prototype, this.ctx, 20, 'red');
        asteroid.addComponent('shooting', CShootable.prototype, new ShotGun('cyan'), 2000);
        asteroid.addComponent('enemy', CEnemyAICore.prototype);

        asteroid.addGroup('solid');

        return asteroid;
    }

    createEnemy() {
        let enemy = this.createShip();

        enemy.addComponent('enemy');
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
        ship.addComponent('move', CMovable.prototype, 5);
        ship.addComponent('circleShape', CCircle.prototype, this.ctx, 15, 'purple');
        ship.addComponent('shooting', CShootable.prototype, new ShotGun(), shootingRate);
        ship.addComponent('solid', CSolid.prototype);
        ship.addComponent('hp', CHitPoints.prototype, 100);

        ship.addGroup('solid');

        return ship;
    }

    createBullet(startPosition, directionVector) {
        let bullet = new Entity(this.entityManager);

        bullet.addComponent('position', CPosition.prototype, new Position(startPosition.x, startPosition.y));
        bullet.addComponent('move', CMovable.prototype, 10, directionVector);
        bullet.addComponent('circleShape', CCircle.prototype, this.ctx, 1, 'yellow');
        bullet.addComponent('timeDestroy', CTimeDestroy.prototype, 2000);
        bullet.addComponent('subjectToGravity', CSubjectToGravity.prototype);
        bullet.addComponent('solid', CSolid.prototype);

        return bullet;
    }

    createPlanet(position, mass) {
        let planet = new Entity(this.entityManager);

        planet.addComponent('position', CPosition.prototype, new Position(position.x, position.y));
        planet.addComponent('circleShape', CCircle.prototype, this.ctx, 20, 'green');
        planet.addComponent('hasGravity', CHasGravity.prototype, mass);
        planet.addComponent('solid', CSolid.prototype);

        return planet;
    }
}