import {Position} from "../basics/basics.js";

export default class GameManager {
    static _instance;

    constructor() {
        if (GameManager._instance) {
            throw new Error("Instantiation failed: "+
                "use Singleton.getInstance() instead of new.");
        }

        GameManager._instance = this;

        this.ctx = null;
        this.mousePosition = new Position(0, 0);
        this.objectFactory = null;
        this.ammoFactory = null;

        this.animationManager = null;
        this.sourceManager = null;
        this.entitiesManager = null;
        this.viewManager = null;
        this.player = null;
        this.map = null;
    }

    static getInstance() {
        if (GameManager._instance) {
            return GameManager._instance;
        }

        GameManager._instance = new GameManager();
        return GameManager._instance;
    }
}