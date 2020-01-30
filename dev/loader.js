import SourceManager from "./managers/sourceManager.js";
import GameManager from "./managers/gameManager.js";
import {Asset} from "./managers/animationManager.js";

let loadJSON = function(filePath, callBack) {
    const request = new XMLHttpRequest();

    request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status === 200) {
            callBack(JSON.parse(request.responseText));
        }
    };
    request.open("GET", filePath, false);
    request.send();
};

export default class Loader {
    constructor() {
        this.imageLoaded = false;
        this.assetsPath = "./image/assets/";
    }

    loadAssets() {
        let assets = new Map([
            ["./images/assets/orc.png", "orc"],
            ["./images/assets/character.png", "body"],
            ["./images/assets/skeleton.png", "skeleton"],
            ["./images/assets/drakelf.png", "elf"]
        ]);

        let assetPath = "./images/assets/orc.png";

        for (let [assetPath, name] of assets) {
            let asset = new Asset(assetPath, 64, 64);
            asset.load();

            GameManager.getInstance().sourceManager.addAsset(name, asset);
        }
    }

    loadMap(mapPath, assetPath='./maps/tileset.json') {
        const request = new XMLHttpRequest();
        let filesLoaded = 0;
        let responseFiles = [];

        request.onreadystatechange = () => {
            if (request.readyState === 4 && request.status === 200) {
                responseFiles.push(JSON.parse(request.response));
                filesLoaded++;

                if (filesLoaded === 2) {
                    GameManager.getInstance().map.parse(...responseFiles);
                }
            }
        };

        request.open("GET", mapPath, false);
        request.send();
        request.open("GET", assetPath, false);
        request.send();
    }

    load() {
        let backgroundPicture = "./images/assets/map/asset.png";
        let image = new Image();
        image.src = backgroundPicture;

        image.onload = () => {
            this.imageLoaded = true;
            GameManager.getInstance().sourceManager.backroundPicture = image;
            GameManager.getInstance().sourceManager.backroundPattern = GameManager.getInstance().ctx.createPattern(image, 'repeat');
        };

    }
}