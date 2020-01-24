import {CPosition, CMovable, CCircle, CTimeDestroy, CShootable, CHasGravity, CSubjectToGravity, CSolid, CHitCounter, CDamage} from "../objects/components.js";
import {NonSpriteDynamicColorAnimation} from "../managers/animationManager.js";
import GameManager from "../managers/gameManager.js";

export default class AmmoFactory {
    constructor(objectFactory) {
        this.objectFactory = objectFactory;
        this.timeDestroy = 2000;
    }

    createStandartBullet(color='black', speed=20) {
        let bullet = this.objectFactory.createSimpleObject();

        bullet.addComponent('circleShape', CCircle.prototype, this.objectFactory.ctx, 5, 'black');
        bullet.addComponent('move', CMovable.prototype, speed);
        bullet.addComponent('timeDestroy', CTimeDestroy.prototype, this.timeDestroy);
        bullet.addComponent('subjectToGravity', CSubjectToGravity.prototype);
        bullet.addComponent('damage', CDamage.prototype, 10);
        bullet.addComponent('hitCount', CHitCounter.prototype, 1);

        bullet.addGroup('bullet');

        //GameManager.getInstance().animationManager.addAnimation(bullet.id, new NonSpriteDynamicColorAnimation(bullet, 2, 2));

        return bullet;
    }
}