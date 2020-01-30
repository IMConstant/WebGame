import GameManager from "./gameManager.js";

export class AssetRowInfo {
    constructor(name, num, length) {
        this.name = name;
        this.num = num;
        this.length = length;
    }
}

export class Asset {
    constructor(assetPath, columnSeparator, rowSeparator) {
        this.ready = false;
        this.asset = null;
        this.rowInfoList = new Map();

        this.assetPath = assetPath;
        this.rowSeparator = rowSeparator;
        this.columnSeparator = columnSeparator;
    }

    isReady() {
        return this.ready;
    }

    getRowLengthByRowName(rowName) {
        return this.rowInfoList.get(rowName).length;
    }

    load(data) {
        this.asset = new Image();
        this.asset.src = this.assetPath;

        this.rowInfoList.set("stand", new AssetRowInfo("stand", 6, 1));
        this.rowInfoList.set("moveUp", new AssetRowInfo("moveUp", 8, 9));
        this.rowInfoList.set("moveLeft", new AssetRowInfo("moveLeft", 9, 9));
        this.rowInfoList.set("moveDown", new AssetRowInfo("moveDown", 10, 9));
        this.rowInfoList.set("moveRight", new AssetRowInfo("moveRight", 11, 9));
        this.rowInfoList.set("destruction", new AssetRowInfo("destruction", 20, 6));

        this.asset.onload = () => {
            this.ready = true;
        }
    }

    getRowByName(rowName) {
        return this.rowInfoList.get(rowName).num;
    }

    params(rowName, j, dx, dy, w, h) {
        return [this.asset,
            (j % this.getRowLengthByRowName(rowName)) * this.columnSeparator,
            this.getRowByName(rowName) * this.rowSeparator,
            this.columnSeparator,
            this.rowSeparator,
            dx - w / 2,
            dy - h / 2,
            w,
            h];
    }
}

export class Animation {
    constructor(entity, framesCount, frameDelay) {
        this.entity = entity;

        this.framesCount = framesCount;
        this.frameDelay = frameDelay;
        this.delayCounter = 0;
        this.frameCounter = 0;
        this.isOver = false;
    }

    update() {
        if (!this.entity) {
            return;
        }

        this.animate();

        if (this.delayCounter === 0) {
            this.frameCounter = (this.frameCounter + 1) % this.framesCount;
        }

        this.delayCounter = (this.delayCounter + 1) % this.frameDelay;
    }

    setEntity(entity) {
        this.entity = entity;
    }

    animate() {

    }
}

export class SpriteAnimation extends Animation {
    constructor(entity, asset, frameDelay, assetRowName) {
        super(entity, asset.getRowLengthByRowName(assetRowName), frameDelay);

        this.asset = asset;
        this.assetRowName = assetRowName;
    }

    animate() {
        let ctx = GameManager.getInstance().ctx;
        let radius = this.entity.getComponent('circleShape').radius;
        let position = this.entity.getComponent('position').position;

        ctx.drawImage(...this.asset.params(this.assetRowName,
            this.frameCounter,
            position.x + GameManager.getInstance().viewManager.worldOffset.x,
            position.y + GameManager.getInstance().viewManager.worldOffset.y,
            2 * radius,
            2 * radius));
    }
}

export class OneCycleSpriteAnimation extends SpriteAnimation {
    constructor(entity, asset, frameDelay, assetRowName, lastFrameDelay=0) {
        super(entity, asset, frameDelay, assetRowName);

        this.lastFrameDelay = lastFrameDelay + frameDelay;
        this.isOver = false;
    }

    update() {
        if (this.frameCounter === this.framesCount - 1) {
            this.frameDelay = this.lastFrameDelay;
        }

        super.update();

        if (this.frameDelay === this.lastFrameDelay && this.delayCounter === this.frameDelay - 1) {
            this.isOver = true;
        }
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
        this.basicAnimations.set('reloading', (entity) => {
            let ctx = GameManager.getInstance().ctx;
            let position = entity.getComponent('position').position;
            let cCircle = entity.getComponent('circleShape');
            let weapon = entity.getComponent('shooting').weapon;
            let p = weapon.reloadingTime / weapon.maxReloadingTime;

            if (p === 1) {
                p = 0.9999999;
            }

            ctx.save();
            ctx.strokeStyle = 'rgba(' + 255 + ',' + 255 + ',' + 0 + ',' + (p / 1.4) + ')';
            ctx.lineWidth = 6;
            ctx.shadowColor = 'red';
            ctx.shadowBlur = 5;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.ellipse(position.x + GameManager.getInstance().viewManager.worldOffset.x,
                position.y + GameManager.getInstance().viewManager.worldOffset.y,
                cCircle.radius + 10,
                cCircle.radius + 10,
                -0.5 * Math.PI,
                 0,
                p * 2 * Math.PI,
                true);
            //ctx.closePath();
            ctx.stroke();
            ctx.restore();
        });
    }

    update(ID) {
        if (this.activeAnimvations.has(ID)) {
            let animations = this.activeAnimvations.get(ID);

            for (let animation of animations.values()) {
                animation.update();

                if (animation.isOver) {
                    GameManager.getInstance().entitiesManager.addToDeathList(ID);
                    this.activeAnimvations.delete(ID);
                }
            }
        }
    }

    addAnimation(ID, animationType, animation) {
        if (!this.activeAnimvations.has(ID)) {
            this.activeAnimvations.set(ID, new Map([[animationType, animation]]));
        }
        else {
            this.activeAnimvations.get(ID).set(animationType, animation);
        }
    }

    addBasicAnimation(animationName, entity) {
        let animation = new NonSpriteFreeAnimation(this.basicAnimations.get(animationName));
        animation.setEntity(entity);

        this.addAnimation(entity.id, animationName, animation);
    }

    clear() {
        this.activeAnimvations.clear();
    }

    removeAnimation(ID, type=null) {
        if (!type) {
            this.activeAnimvations.delete(ID);
        }
        else {
            let animations = this.activeAnimvations.get(ID);
            console.log('im here', type);

            if (animations && animations.has(type)) {
                animations.delete(type);
            }
        }
    }
}