import {Position, Vector} from "../basics/basics.js";
import GameManager from "./gameManager.js";

export default class ViewManager {
    constructor(width, height) {
        this.worldOffset = new Vector(0, 0);
        this.viewOn = null;
        this.center = new Position(width / 2, height / 2);
        this.width = width;
        this.height = height;
    }

    setViewOn(target) {
        this.viewOn = target;

        let targetPosition = this.viewOn.getComponent('position').position;
        this.worldOffset.x = this.center.x - targetPosition.x;
        this.worldOffset.y = this.center.y - targetPosition.y;
    }

    update() {
        if (this.viewOn && this.viewOn.isAlive()) {
            console.log(this.worldOffset);
            let targetPosition = this.viewOn.getComponent('position').position;
            let mapWidth = GameManager.getInstance().map.width;
            let mapHeight = GameManager.getInstance().map.height;

            if (mapWidth - targetPosition.x > this.width / 2 && targetPosition.x > this.width / 2) {
                this.worldOffset.x = this.center.x - targetPosition.x;
            }

            if (mapHeight - targetPosition.y > this.height / 2 && targetPosition.y > this.height / 2) {
                this.worldOffset.y = this.center.y - targetPosition.y;
            }
        }
    }
}