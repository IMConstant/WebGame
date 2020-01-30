import GameManager from "./gameManager.js";
import {Position} from "../basics/basics.js";
import {Vector} from "../basics/basics.js";

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

    addToDeathList(entityId) {
        this.deadList.push(entityId);
    }

    update() {
        for (let entity of this.entities.values()) {
            entity.update();

            this.checkMapCollisions(entity);
        }
    }

    checkMapCollisions(entity) {
        if (!entity.hasComponent('move') || entity.hasGroup('bullet')) {
            return;
        }

        let map = GameManager.getInstance().map;
        let entityPosition = entity.getComponent('position').position;
        let tileInfo = map.getTileInfoByPosition(entityPosition);

        if (!tileInfo.walkable) {
            let prevPosition = entity.getComponent('move').previusPosition;

            entityPosition.x = prevPosition.x;
            entityPosition.y = prevPosition.y;
        }
    }

    resetAll() {
        for (let entity of this.entities.values()) {
            entity.reset();
            GameManager.getInstance().animationManager.removeAnimation(entity.id);
        }

        this.entities.clear();
        this.groupedEntities.clear();
        console.log(this.entities);
    }

    clear() {
        for (let entity of this.entities) {
            entity.destroy();
        }

        this.entities = [];
    }

    draw(sorted=false, comparator=null) {
        if (sorted) {
            let entities = [];

            for (let entity of this.entities.values()) {
                entities.push(entity);
            }

            entities.sort(comparator);

            for (let entity of entities) {
                entity.draw();
            }

            return;
        }

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
        for (let key of this.deadList) {
            let entity = this.entities.get(key);
            //entity.reset();
            this.entities.delete(key);
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