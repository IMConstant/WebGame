import GameManager from "./gameManager.js";

export class Animation {
    constructor(entity, framesCount, frameDelay) {
        this.entity = entity;

        this.framesCount = framesCount;
        this.frameDelay = frameDelay;
        this.delayCounter = 0;
        this.frameCounter = 0;
    }

    update() {
        if (!this.entity) {
            return;
        }

        if (this.delayCounter === 0) {
            this.frameCounter = (this.frameCounter + 1) % this.framesCount;

            this.animate();
        }

        this.delayCounter = (this.delayCounter + 1) % this.frameDelay;
    }

    setEntity(entity) {
        this.entity = entity;
    }

    animate() {

    }
}

export class NonSpriteDynamicColorAnimation extends Animation {
    constructor(entity, framesCount=0, frameDelay=0) {
        super(entity, framesCount, frameDelay);
    }

    animate() {
        let style = this.entity.getComponent('circleShape').style;

        if (this.frameCounter === 0) {
            this.entity.getComponent('circleShape').style = 'black';
        }
        else if (this.frameCounter === 1) {
            this.entity.getComponent('circleShape').style = 'yellow';
        }
    }
}

export class NonSpriteFreeAnimation extends Animation {
    constructor(animation, entity=null) {
        super(entity, 0, 0);

        this.animation = animation;
    }

    update() {
        this.animation(this.entity);
    }
}

export default class AnimationManager {
    constructor() {
        this.activeAnimvations = new Map(); //entity ID and Animation

        this.basicAnimations = new Map();
        this.initBasicAnimations();
    }

    initBasicAnimations() {
        this.basicAnimations.set('reloading', new NonSpriteFreeAnimation((entity) => {
            let ctx = GameManager.getInstance().ctx;
            let position = entity.getComponent('position').position;
            let cCircle = entity.getComponent('circleShape');
            let weapon = entity.getComponent('shooting').weapon;
            let p = weapon.reloadingTime / weapon.maxReloadingTime;

            if (p === 1) {
                p = 0.9999999;
            }

            console.log(p);

            ctx.strokeStyle = 'rgba(' + 255 + ',' + 0 + ',' + 0 + ',' + p + ')';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.ellipse(position.x + GameManager.getInstance().viewManager.worldOffset.x,
                position.y + GameManager.getInstance().viewManager.worldOffset.y,
                cCircle.radius + 6,
                cCircle.radius + 6,
                -0.5 * Math.PI,
                 0,
                p * 2 * Math.PI,
                true);
            //ctx.closePath();
            ctx.stroke();
        }));
    }

    update() {
        for (let animation of this.activeAnimvations.values()) {
            animation.update();
        }
    }

    addAnimation(ID, animation) {
        if (!this.activeAnimvations.has(ID)) {
            this.activeAnimvations.set(ID, animation);
        }
    }

    addBasicAnimation(animationName, entity) {
        let animation = this.basicAnimations.get(animationName);
        animation.setEntity(entity);

        this.addAnimation(entity.id, animation);
    }

    removeAnimation(ID) {
        this.activeAnimvations.delete(ID);
    }
}