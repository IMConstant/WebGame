import GameManager from "../managers/gameManager.js";
import {Position, Vector} from "../basics/basics.js";

export class Weapon {
    constructor() {
        this.reloadingTime = 0;
        this.bulletCount = 0;
        this.maxBulletCount = 0;
        this.maxReloadingTime = 0;
        this.reloading = false;

        this.shootingDelay = 0;
        this.shootingDelayCounter = 0;

        this.texture = null;
    }

    shoot() {
        let res = !this.checkReload() && this.checkShootingDelay();

        if (res) {
            this.bulletCount += 1;
            this.shootingDelayCounter = 0;
        }

        return res;
    }

    update() {
        if (this.shootingDelayCounter < this.shootingDelay) {
            this.shootingDelayCounter += 1;
            return false;
        }
        else {
            return true;
        }
    }

    checkShootingDelay() {
        return this.shootingDelayCounter >= this.shootingDelay;
    }

    checkReload() {
        if (this.bulletCount === this.maxBulletCount) {
            this.reloading = true;
        }

        if (this.reloadingTime === this.maxReloadingTime) {
            this.bulletCount = 0;
            this.reloadingTime = 0;
            this.reloading = false;
        }

        return this.reloading;
    }

    reload() {
        this.reloadingTime += 1;
    }
}

export class ShellGun extends Weapon {
    constructor(color='yellow') {
        super();

        this.color = color;
        this.maxBulletCount = 30;
        this.maxReloadingTime = 200;
        this.shootingDelay = 8;

        this.texture = new Image();
        this.texture.src = "../images/AK.png";
    }

    shoot(currentPosition, directionVector, radius) {
        if (!super.shoot()) {
            return;
        }

        let bullet = GameManager.getInstance().ammoFactory.createStandartBullet(this.color, 30);

        directionVector.randomDeviation();

        bullet.getComponent('position').position.x = currentPosition.x + 3 * radius * directionVector.x;
        bullet.getComponent('position').position.y = currentPosition.y + 3 * radius * directionVector.y;
        bullet.getComponent('move').directionVector.x = directionVector.x;
        bullet.getComponent('move').directionVector.y = directionVector.y;

        return [bullet];
    }
}

export class ShotGun extends Weapon {
    constructor(color='black') {
        super();

        this.color = color;
        this.maxBulletCount = 8;
        this.maxReloadingTime = 90;
        this.shootingDelay = 30;

        this.texture = new Image();
        this.texture.src = "../images/shotgun.png";
    }

    shoot(currentPosition, directionVector, radius) {
        if (!super.shoot()) {
            return;
        }

        let bullets = [];

        for (let i = 0; i < 5; i++) {
            bullets.push(GameManager.getInstance().ammoFactory.createStandartBullet(this.color, 24 + 5 * Math.random()));
        }

        for (let bullet of bullets) {
            let direction = new Vector(directionVector.x, directionVector.y).randomDeviation(0.06);

            bullet.getComponent('position').position.x = currentPosition.x + 2 * radius * direction.x;
            bullet.getComponent('position').position.y = currentPosition.y + 2 * radius * direction.y;
            bullet.getComponent('move').directionVector.x = direction.x;
            bullet.getComponent('move').directionVector.y = direction.y;
        }

        return bullets;
    }
}