
export default class EventManager {
    constructor(canvas, gameManager) {
        this.canvas = canvas;
        this.gameManager = gameManager;
        console.log(this.gameManager);

        this.events = [];
    }
}