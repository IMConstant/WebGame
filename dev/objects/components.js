import {Position, Vector} from "../basics/basics.js";
import GameManager from "../managers/gameManager.js";

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
        this.cPosition = null;

        this.currentDirection = 0;
        this.cCircleShape = null;
    }

    init() {
        super.init();

        this.cPosition = this.entity.getComponent('position');
    }

    update() {
        super.update();
        let cCircleShape = this.entity.getComponent('circleShape');

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

    right() {
        this.currentDirection = 100;
        this.directionVector.x = 1;
        this.directionVector.y = 0;
    }

    left() {
        this.currentDirection = 97;
        this.directionVector.x = -1;
        this.directionVector.y = 0;
    }

    up() {
        this.currentDirection = 119;
        this.directionVector.x = 0;
        this.directionVector.y = -1;
    }

    down() {
        this.currentDirection = 115;
        this.directionVector.x = 0;
        this.directionVector.y = 1;
    }

    stop() {
        this.currentDirection = 0;
        this.directionVector.x = 0;
        this.directionVector.y = 0;
    }
}

export class CAbleToHaveTarget extends CMovable {
    constructor() {
        super();

        this.target = null;
    }

    update() {
        if (!this.target) {
            return;
        }

        let radiusVector = new Vector(this.target.x - this.cPosition.position.x, this.target.y - this.cPosition.position.y);
        let length = Math.sqrt(Math.pow(radiusVector.x, 2) + Math.pow(radiusVector.y, 2));

        this.directionVector.x = radiusVector.x / length;
        this.directionVector.y = radiusVector.y / length;

        super.update();
    }
}

export class CCircle extends Component {
    constructor(ctx, radius=2, style='red') {
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

            gradient.addColorStop(.0, 'black');
            gradient.addColorStop(.6, 'rgba(' + 255 + ',' + 255 + ',' + 0 + ',' + 0.1 + ')');
            gradient.addColorStop(.6, 'rgba(' + 155 + ',' + 155 + ',' + 0 + ',' + 0.01 + ')');
            gradient.addColorStop(1, 'transparent');

            this.ctx.strokeStyle = gradient;
            this.ctx.beginPath();
            this.ctx.moveTo(startPosition.x, startPosition.y);
            this.ctx.lineWidth = 3;
            this.ctx.lineCap = 'round';
            this.ctx.lineTo(endPosition.x, endPosition.y);
            this.ctx.closePath();
            this.ctx.stroke();
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
        setTimeout(function (component) {
            component.entity.alive = false;
        }, this.timeToDeath, this);
    }
}

export class CShootable extends Component {
    constructor(weapon, shootingRate) {
        super();

        this.timerID = null;
        this.shooting = false;
        this.targetPosition = null;
        this.shootingRate = shootingRate;
        this.weapon = weapon;

        this.trigger = new Audio("../audio/kurock.mp3");
    }

    update() {
        if (this.weapon.checkReload()) {
            GameManager.getInstance().animationManager.addBasicAnimation('reloading', this.entity);

            if (this.shooting) {
                this.trigger.volume = 0.45;
                this.trigger.play();
            }

            this.weapon.reload();
        }
        else {
            GameManager.getInstance().animationManager.removeAnimation(this.entity.id);

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
            let width = 100;
            let height = 30;
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
            let audio = new Audio("../audio/laser.mp3");
            audio.volume = 0.15;
            audio.play();

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

        for (let entity of subjectToGravityGroup) {
            this.correctDirection(entity);
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

                let distance = Math.sqrt(Math.pow(position.x - entityPosition.x, 2) + Math.pow(position.y - entityPosition.y, 2));

                if (distance <= radius + entityRadius) {
                    this.updateCollision(this.entity, entity);
                }
            }
        }

        super.update();
    }

    updateCollision(e1, e2) {
        if (e1.hasGroup('bullet') && e2.hasGroup('bullet')) {
            return;
        }

        if (e1.hasComponent('hp') && e2.hasComponent('damage')) {
            e1.getComponent('hp').incomingDamage += e2.getComponent('damage').damage;
        }

        for (let e of arguments) {
            if (e.hasComponent('hitCount')) {
                e.getComponent('hitCount').hitCount -= 1;
            }
        }
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
        if (this.target) {
            if (Math.random() < 0.05) {
                this.cShooting.shootingOn(this.target.getComponent('position').position);
            }
            else {
                this.cShooting.shootingOff();
            }

            let cMove = this.entity.getComponent('move');
            let position = this.entity.getComponent('position').position;
            let targetPosition = this.target.getComponent('position').position;
            let directionVector = new Vector(targetPosition.x - position.x, targetPosition.y - position.y);
            let length = Math.sqrt(Math.pow(directionVector.x, 2) + Math.pow(directionVector.y, 2));
            let radiusVector = new Vector(directionVector.x / length, directionVector.y / length);

            cMove.directionVector = new Vector(radiusVector.x * cMove.velocity, radiusVector.y * cMove.velocity);

            if (length > 400) {
                this.cShooting.shootingOff();
            }
        }
    }

    reset() {
        this.cShooting.shootingOff();
    }
}

