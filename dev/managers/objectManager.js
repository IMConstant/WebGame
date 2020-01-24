import GameManager from "./gameManager.js";

export default class ObjectManager {
    constructor() {
        this.entities = new Map();
        this.deadList = [];

        this.groupedEntities = new Map(); //groupName: entity

        this.objectFactory = null;
        this.audio = new Audio("./audio/lazer.mp3");
        this.explosion = new Audio("./audio/explosion.mp3");
    }

    refresh() {
        for (let [groupName, entities] of this.groupedEntities) {
            for (let i = 0; i < entities.length; i++) {
                let entity = entities[i];

                if (!entity.isAlive() || !entity.hasGroup(groupName)) {
                    this.groupedEntities.get(groupName).splice(i, 1);
                    i--;
                }
            }
        }

        for (let [key, entity] of this.entities) {
            if (!entity.isAlive()) {
                this.deadList.push(key);
            }
        }

        this.killAllFromDeadList();
    }

    update() {
        for (let entity of this.entities.values()) {
            entity.update();
        }
    }

    resetAll() {
        for (let entity of this.entities.values()) {
            entity.reset();
            GameManager.getInstance().animationManager.removeAnimation(entity.id);
        }
    }

    clear() {
        for (let entity of this.entities) {
            entity.destroy();
        }

        this.entities = [];
    }

    draw() {
        for (let entity of this.entities.values()) {
            entity.draw();
        }
    }

    addEntity(entity) {
        this.entities.set(entity.id, entity);
    }

    addEntities(entities) {
        for (let entity of entities) {
            this.addEntity(entity);
        }
    }

    killAllFromDeadList() {
        for (let entity of this.deadList) {
            this.entities.get(entity).reset();
            this.entities.delete(entity);
        }

        this.deadList = [];
    }


    activateObjectFactory(objectFactory) {
        this.objectFactory = objectFactory;
    }

    addToGroup(groupName, entity) {
        if (!this.groupedEntities.has(groupName)) {
            this.groupedEntities.set(groupName, []);
        }

        this.groupedEntities.get(groupName).push(entity);
    }

    getGroup(groupName) {
        return this.groupedEntities.get(groupName);
    }
}