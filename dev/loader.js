import SourceManager from "./managers/sourceManager.js";
import GameManager from "./managers/gameManager.js";

export default class Loader {
    constructor() {
        this.imageLoaded = false;
    }

    load() {
        let backgroundPicture = "./images/brck.png";
        let image = new Image();
        image.src = backgroundPicture;

        image.onload = () => {
            this.imageLoaded = true;
            console.log('loaded');
            GameManager.getInstance().sourceManager.backroundPicture = image;
            GameManager.getInstance().sourceManager.backroundPattern = GameManager.getInstance().ctx.createPattern(image, 'repeat');
        };

    }
}