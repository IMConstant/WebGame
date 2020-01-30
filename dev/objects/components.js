import {Position, Vector} from "../basics/basics.js";
import GameManager from "../managers/gameManager.js";
import eventManager from "../managers/eventManager.js";

let imageRotate = function(image, angle) {
    image.style.transform = `rotate(${angle}deg)`;

    return image;
};

export class Component {
    constructor() {
        this.entity = null;
    }

    init() {
        return this;
    }

    update() {

    }

    draw() {

    }

    reset() {

    }
}

export class CPosition extends Component {
    constructor(position=new Position(0, 0)) {
        super();

        this.position = position;
    }
}

export class CMovable extends Component {
    constructor(velocity=0, directionVector=new Vector(0, 0)) {
        super();

        this.directionVector = directionVector;
        this.velocity = velocity;

        this.currentDirection = 0;
        this.previousDirection = "stand";
        this.previusPosition = new Position(0, 0);
    }

    init() {
        super.init();

        this.cPosition = this.entity.getComponent('position');
    }

    update() {
        super.update();

        this.previusPosition.x = this.cPosition.position.x;
        this.previusPosition.y = this.cPosition.position.y;

        let cCircleShape = this.entity.getComponent('circleShape');
        let currentDirection = 'stand';
        let directionVectorAngle = 180 * Math.atan2(this.directionVector.y, this.directionVector.x) / Math.PI;

        if (directionVectorAngle > -45 && directionVectorAngle < 45) {
            currentDirection = 'moveRight';
        }
        else if (directionVectorAngle > -135 && directionVectorAngle < -45) {
            currentDirection = 'moveUp';
        }
        else if (directionVectorAngle > 45 && directionVectorAngle < 135) {
            currentDirection = 'moveDown';
        }
        else {
            currentDirection = 'moveLeft';
        }

        if (this.previousDirection !== currentDirection) {
            this.previousDirection = currentDirection;

            GameManager.getInstance().eventManager.addEvent(currentDirection, this.entity);
        }

        this.cPosition.position.x += this.directionVector.x * this.velocity;
        this.cPosition.position.y += this.directionVector.y * this.velocity;

        if (this.entity.hasComponent('hp')) {

            if (this.cPosition.position.x + cCircleShape.radius > GameManager.getInstance().map.width) {
                this.cPosition.position.x = GameManager.getInstance().map.width - cCircleShape.radius;
            }

            if (this.cPosition.position.x - cCircleShape.radius < 0) {
                this.cPosition.position.x = cCircleShape.radius;
            }

            if (this.cPosition.position.y + cCircleShape.radius > GameManager.getInstance().map.height) {
                this.cPosition.position.y = GameManager.getInstance().map.height - cCircleShape.radius;
            }

            if (this.cPosition.position.y - cCircleShape.radius < 0) {
                this.cPosition.position.y = cCircleShape.radius;
            }
        }
    }

    moveRight() {
        this.currentDirection = 100;
        this.directionVector.x = 1;
        this.directionVector.y = 0;
    }

    moveLeft() {
        this.currentDirection = 97;
        this.directionVector.x = -1;
        this.directionVector.y = 0;
    }

    moveUp() {
        this.currentDirection = 119;
        this.directionVector.x = 0;
        this.directionVector.y = -1;
    }

    moveDown() {
        this.currentDirection = 115;
        this.directionVector.x = 0;
        this.directionVector.y = 1;
    }

    stop(direction=null) {
        this.currentDirection = 0;
        this.directionVector.x = 0;
        this.directionVector.y = 0;
    }
}

export class CSmoothMove extends CMovable {
    constructor(velocity=0, directionVector=new Vector(0, 0)) {
        super(velocity, directionVector);

        this.directionVelocities = new Map([
            ['up', [false, 0]],
            ['right', [false, 0]],
            ['down', [false, 0]],
            ['left', [false, 0]]
        ]);
    }

    update() {
        this.previusPosition.x = this.cPosition.position.x;
        this.previusPosition.y = this.cPosition.position.y;

        let deltaX = this.directionVelocities.get('right')[1] - this.directionVelocities.get('left')[1];
        let deltaY = this.directionVelocities.get('down')[1] - this.directionVelocities.get('up')[1];
        let currentDirection = null;

        if (deltaX >= 0 && Math.abs(deltaY) < deltaX) {
            currentDirection = 'moveRight';
        }
        else if (deltaY >= 0 && Math.abs(deltaX) < deltaY) {
            currentDirection = 'moveDown';
        }
        else if (deltaX < 0 && Math.abs(deltaY) < -deltaX) {
            currentDirection = 'moveLeft';
        }
        else {
            currentDirection = 'moveUp';
        }

        if (deltaY === 0 && deltaX === 0) {
            currentDirection = 'moveStop';
        }

        if (currentDirection !== this.previousDirection) {
            this.previousDirection = currentDirection;

            GameManager.getInstance().eventManager.addEvent(currentDirection, this.entity);
        }

        this.cPosition.position.x += this.directionVelocities.get('right')[1] - this.directionVelocities.get('left')[1];
        this.cPosition.position.y += this.directionVelocities.get('down')[1] - this.directionVelocities.get('up')[1];

        for (let direction of this.directionVelocities.keys()) {
            if (this.directionVelocities.get(direction)[0]) {
                this.updateDirection(direction);
            }
        }
    }

    updateDirection(direction) {
        let velocity = this.directionVelocities.get(direction)[1];
        velocity += 0.07 * (this.velocity - velocity);
        this.directionVelocities.get(direction)[1] = velocity;
    }

    moveUp() {
        this.directionVelocities.get('up')[0] = true;
    }

    moveRight() {
        this.directionVelocities.get('right')[0] = true;
    }

    moveDown() {
        this.directionVelocities.get('down')[0] = true;
    }

    moveLeft() {
        this.directionVelocities.get('left')[0] = true;
    }

    stop(direction) {
        let velocityState = this.directionVelocities.get(direction);

        velocityState[0] = false;
        velocityState[1] = 0;
    }
}

export class CCircleShape extends Component {
    constructor(ctx=GameManager.getInstance().ctx, radius=0, style='transparent') {
        super();

        this.ctx = ctx;
        this.style = style;

        this.position = null;
        this.radius = radius;
    }

    init() {
        super.init();

        this.position = this.entity.getComponent('position').position;
    }

    draw() {
        let cMove = this.entity.getComponent('move');

        if (this.entity.hasGroup('bullet')) {
            let startPosition = new Position(this.position.x + GameManager.getInstance().viewManager.worldOffset.x,
                this.position.y + GameManager.getInstance().viewManager.worldOffset.y);
            let endPosition = new Position(this.position.x + GameManager.getInstance().viewManager.worldOffset.x - cMove.directionVector.x * 5 * cMove.velocity,
                this.position.y + GameManager.getInstance().viewManager.worldOffset.y - cMove.directionVector.y * 5 * cMove.velocity);

            let gradient = this.ctx.createLinearGradient(startPosition.x, startPosition.y, endPosition.x, endPosition.y);

            gradient.addColorStop(.0, this.style);
            gradient.addColorStop(.6, 'rgba(' + 255 + ',' + 255 + ',' + 0 + ',' + 0.3 + ')');
            gradient.addColorStop(.8, 'rgba(' + 155 + ',' + 155 + ',' + 0 + ',' + 0.01 + ')');
            gradient.addColorStop(1, 'transparent');

            this.ctx.save();
            this.ctx.strokeStyle = gradient;
            this.ctx.beginPath();
            this.ctx.moveTo(startPosition.x, startPosition.y);
            this.ctx.lineWidth = 3;
            this.ctx.lineCap = 'round';
            this.ctx.lineTo(endPosition.x, endPosition.y);
            this.ctx.closePath();
            this.ctx.stroke();
            this.ctx.restore();
        }
        else {
            this.ctx.fillStyle = this.style;
            this.ctx.beginPath();
            this.ctx.arc(this.position.x + GameManager.getInstance().viewManager.worldOffset.x, this.position.y + GameManager.getInstance().viewManager.worldOffset.y, this.radius, 0, 2 * Math.PI, false);
            this.ctx.closePath();
            this.ctx.fill();
        }
    }
}

export class CTimeDestroy extends Component {
    constructor(timeToDeath) {
        super();

        this.timeToDeath = timeToDeath;
        this.counter = 0;
    }

    update() {
        super.update();

        this.counter++;

        if (this.counter === this.timeToDeath) {
            this.entity.destroy();
        }
    }
}

export class CShootable extends Component {
    constructor(weapon, shootingRate) {
        super();

        this.reloading = weapon.reloading;
        this.shooting = false;
        this.targetPosition = null;
        this.weapon = weapon;

        this.trigger = new Audio("../audio/kurock.mp3");
    }

    update() {
        if (this.weapon.checkReload()) {
            if (!this.reloading) {
                GameManager.getInstance().eventManager.addEvent('reloadingOn', this.entity);
                this.reloading = true;
            }

            if (this.shooting) {
                this.trigger.volume = 0.45;
                this.trigger.play();
            }

            this.weapon.reload();
        }
        else {
            if (this.reloading) {
                GameManager.getInstance().eventManager.addEvent('reloadingOff', this.entity);
                this.reloading = false;
            }

            if (this.shooting) {
                this.shoot();
            }

            this.weapon.update();
        }

    }

    draw() {
        if (!this.targetPosition) {
            return;
        }

        let cMove = this.entity.getComponent('move');
        let image = new Image();
        image.src = "../images/shotgun.png";
            let ctx = GameManager.getInstance().ctx;

            ctx.save();
            ctx.translate(this.cPosition.position.x + GameManager.getInstance().viewManager.worldOffset.x,
                this.cPosition.position.y + GameManager.getInstance().viewManager.worldOffset.y);
            let angle = Math.atan2(this.targetPosition.x - this.cPosition.position.x,
                this.targetPosition.y - this.cPosition.position.y);
            ctx.rotate(-angle + Math.PI / 2);
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, 20, 2);
            let width = 50;
            let height = 15;
            ctx.drawImage(this.weapon.texture, -30, -8, width, height);
            ctx.restore();
    }

    init() {
        this.cPosition = this.entity.getComponent('position');
    }

    setTarget(targetPosition) {
        this.targetPosition = targetPosition;
    }

    shoot() {
        let bulletStartPosition = new Position(this.cPosition.position.x, this.cPosition.position.y);
        let bulletDirection = new Vector(this.targetPosition.x - bulletStartPosition.x, this.targetPosition.y - bulletStartPosition.y).normalized();

        let bullets = this.weapon.shoot(bulletStartPosition, bulletDirection, this.entity.getComponent('circleShape').radius)

        if (bullets) {
            let audio = new Audio(this.weapon.shootSound);
            audio.volume = 0.15;
            audio.play();

            if (this.entity.hasGroup('enemy')) {
                for (let bullet of bullets) {
                    bullet.addGroup('enemy');
                }
            }

            this.entity.manager.addEntities(bullets);
        }
    }

    shootingOn(targetPosition) {
        this.targetPosition = targetPosition;

        this.shooting = true;
    }

    shootingOff() {
        this.shooting = false;
    }

    reset() {
        this.shootingOff();

        super.reset();
    }
}

export class CHasGravity extends Component {
    constructor(mass=1) {
        super();
        this.mass = mass;
    }

    init() {
        this.cPosition = this.entity.getComponent('position');
    }

    update() {
        let subjectToGravityGroup = this.entity.manager.getGroup('subjectToGravity');

        if (subjectToGravityGroup) {
            for (let entity of subjectToGravityGroup) {
                this.correctDirection(entity);
            }
        }
    }

    correctDirection(entity) {
        let entityPosition = entity.getComponent('position').position;
        let cEntityMove = entity.getComponent('move');
        let vector = new Vector(cEntityMove.directionVector.x * cEntityMove.velocity, cEntityMove.directionVector.y * cEntityMove.velocity);
        let radiusVector = new Vector(this.cPosition.position.x - entityPosition.x, this.cPosition.position.y - entityPosition.y);
        let length = Math.sqrt(Math.pow(radiusVector.x, 2) + Math.pow(radiusVector.y, 2));
        radiusVector.x /= length;
        radiusVector.y /= length;
        let acceleration = 10000.11 * this.mass / Math.pow(length, 2);

        vector = new Vector(vector.x + radiusVector.x * acceleration, vector.y + radiusVector.y * acceleration);
        length = Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2));

        cEntityMove.velocity = length;
        cEntityMove.directionVector.x = vector.x / length;
        cEntityMove.directionVector.y = vector.y / length;
    }
}

export class CSubjectToGravity extends Component {
    constructor() {
        super();
    }
}

export class CSolid extends Component {
    constructor() {
        super();
    }

    init() {
        this.cPosition = this.entity.getComponent('position');
    }

    update() {
        let solidEntityGroup = this.entity.manager.getGroup('solid');
        let cMove = this.entity.getComponent('circleShape');

        for (let entity of solidEntityGroup) {
            if (this.entity.id !== entity.id) {
                let radius = cMove.radius;
                let position = this.cPosition.position;
                let entityRadius = entity.getComponent('circleShape').radius;
                let entityPosition = entity.getComponent('position').position;
                let directionVector = new Vector(position.x - entityPosition.x, position.y - entityPosition.y);

                let distance = Math.sqrt(Math.pow(position.x - entityPosition.x, 2) + Math.pow(position.y - entityPosition.y, 2));

                if (distance < radius + entityRadius) {
                    if (this.updateCollision(this.entity, entity) && this.entity.hasComponent('move')) {
                        let radiusVector = new Vector(directionVector.x / distance, directionVector.y / distance);
                        let offset = radius - (distance - entityRadius); //current entity offset
                        position.x += radiusVector.x * offset;
                        position.y += radiusVector.y * offset;
                    }
                }
            }
        }

        super.update();
    }

    updateCollision(e1, e2) {
        if (e1.hasGroup('bullet') && e2.hasGroup('bullet')) {
            return false;
        }

        if (e1.hasGroup('enemy') && e2.hasGroup('enemy')) {
            return false;
        }

        if (e1.hasComponent('hp') && e2.hasComponent('damage')) {
            e1.getComponent('hp').incomingDamage += e2.getComponent('damage').damage;
        }

        for (let e of arguments) {
            if (e.hasComponent('hitCount')) {
                e.getComponent('hitCount').hitCount -= 1;
            }
        }

        return !e1.hasGroup('bullet') && !e2.hasGroup('bullet');
    }
}

export class CHitPoints extends Component {
    constructor(hp) {
        super();

        this.hp = hp;
        this.incomingDamage = 0;
    }

    update() {
        this.hp -= this.incomingDamage;
        this.incomingDamage = 0;

        if (this.hp <= 0) {
            this.entity.destroy();
        }
    }
}

export class CDamage extends Component {
    constructor(damage) {
        super();

        this.damage = damage;
    }
}

export class CHitCounter extends Component {
    constructor(hitCount) {
        super();

        this.hitCount = hitCount;
    }

    update() {
        if (this.hitCount <= 0) {
            this.entity.destroy();
        }
    }
}

export class CEnemyAICore extends Component {
    constructor(target=GameManager.getInstance().player) {
        super();

        this.target = target;
    }

    init() {
        this.cShooting = this.entity.getComponent('shooting');
    }

    update() {
        if (this.target && this.target.isAlive()) {
            if (this.cShooting) {
                if (Math.random() < 0.05) {
                    this.cShooting.shootingOn(this.target.getComponent('position').position);
                } else {
                    this.cShooting.shootingOff();
                }
            }

            let cMove = this.entity.getComponent('move');
            let position = this.entity.getComponent('position').position;
            let targetPosition = this.target.getComponent('position').position;
            let directionVector = new Vector(targetPosition.x - position.x, targetPosition.y - position.y);
            let length = Math.sqrt(Math.pow(directionVector.x, 2) + Math.pow(directionVector.y, 2));
            let radiusVector = new Vector(directionVector.x / length, directionVector.y / length);

            cMove.directionVector = new Vector(radiusVector.x * cMove.velocity, radiusVector.y * cMove.velocity);

            if (this.cShooting && length > 400) {
                this.cShooting.shootingOff();
            }
        }
        else {
            this.cShooting.shootingOff();
        }
    }

    reset() {
    }
}

export class CTrack extends Component {
    constructor(trackSize=0) {
        super();

        this.trackSize = trackSize;
        this.points = [];
    }

    init() {
        this.cPosition = this.entity.getComponent('position');
        this.cCircle = this.entity.getComponent('circleShape');
    }

    updatePositions() {
        for (let i = 0; i < this.points.length - 1; i++) {
            this.points[i].x = this.points[i + 1].x;
            this.points[i].y = this.points[i + 1].y;
        }
    }

    update() {
        let position = new Position(
            this.cPosition.position.x + GameManager.getInstance().viewManager.worldOffset.x,
            this.cPosition.position.y + GameManager.getInstance().viewManager.worldOffset.y
        );

        if (this.points.length > 1) {
            this.updatePositions();
        }

        if (this.points.length < this.trackSize) {
            this.points.push(position);
        }
        else {
            this.points[this.points.length - 1] = position;
        }
    }

    draw() {
        let ctx = GameManager.getInstance().ctx;
        let startPosition = this.points[this.points.length - 1];

        ctx.strokeStyle = this.cCircle.style;
        ctx.beginPath();
        ctx.moveTo(startPosition.x, startPosition.y);

        for (let i = this.points.length - 2; i >= 0; i--) {
            let position = this.points[i];

            ctx.lineTo(position.x, position.y);
        }

        ctx.stroke();
    }
}

export class CSprite extends Component {
    constructor(assetName=null, staticImage=null) {
        super();

        this.assetName = assetName;
        this.staticImage = staticImage;
    }

    draw() {
        if (!this.staticImage) {
            GameManager.getInstance().animationManager.update(this.entity.id);
        }
        else {
            let manager = GameManager.getInstance();
            let position = this.entity.getComponent('position').position;

            manager.map.drawTile(manager.ctx,
                manager.sourceManager.backroundPicture,
                this.staticImage.tile,
                this.staticImage.tileSize,
                position.x - this.staticImage.offsetX,
                position.y - this.staticImage.offsetY);
        }

        super.draw();
    }
}

