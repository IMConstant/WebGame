import GameManager from "../managers/gameManager.js";

export class Entity {
    constructor(manager) {
        this.manager = manager;
        this.components = new Map();
        this.alive = true;

        this.explosion = [new Audio("./audio/body1.mp3"), new Audio('./audio/body2.mp3'), new Audio('./audio/body3.mp3')];
        this.shootSound = new Audio("./audio/lazer.mp3");
        this.sprite = new Image();
        this.sprite.src = "./images/beam.png";

        this.id = Entity.getPersonalID();
        this.groups = new Map();
    }

    static personalID = 0;

    static getPersonalID() {
        return Entity.personalID++;
    }

    update() {
        for ( let value of this.components.values() ) {
            value.update();
        }
    }

    draw() {
        for ( let value of this.components.values() ) {
            value.draw();
        }
    }

    isAlive() {
        return this.alive;
    }

    reset() {
        for (let component of this.components.values()) {
            component.reset();
        }

        this.components.clear();
    }

    destroy() {
        this.explosion[Math.floor(this.explosion.length * Math.random())].play();
        this.alive = false;

        GameManager.getInstance().animationManager.removeAnimation(this.id);
    }

    addComponent(componentName, ComponentType, ...args) {
        let component = new ComponentType.constructor(...args);
        component.entity = this;
        component.init();

        this.components.set(componentName, component);
    }

    getComponent(componentName) {
        return this.components.get(componentName);
    }

    hasComponent(componentName) {
        return this.components.has(componentName);
    }

    hasGroup(groupName) {
        return this.groups.has(groupName) && this.groups.get(groupName);
    }

    addGroup(groupName) {
        this.groups.set(groupName, true);
        this.manager.addToGroup(groupName, this);
    }

    delGroup(groupName) {
        this.groups.set(groupName, false);
    }
}

// export class Bullet extends Entity {
//     constructor(manager) {
//         super(manager);
//
//         this.explosionSound =
//     }
// }