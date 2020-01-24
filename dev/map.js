import GameManager from "./managers/gameManager.js";

export default class Map {
    constructor(width, height) {
        this.width = width;
        this.height = height;

        this.map = [];
        this.background = new Image();
        this.background.src = './images/background.jpg';
    }

    draw(ctx) {
        // ctx.fillStyle = GameManager.getInstance().sourceManager.backroundPattern;
        // ctx.fillRect(0 + GameManager.getInstance().viewManager.worldOffset.x,
        //     0 + GameManager.getInstance().viewManager.worldOffset.y,
        //     this.width,
        //     this.height);

        console.log('hehehehehehheheh');

        let picture = GameManager.getInstance().sourceManager.backroundPicture;
        console.log(this.width, this.height);

        for (let i = 0; i < this.height; i += picture.height) {
            for (let j = 0; j < this.width; j += picture.width) {
                ctx.drawImage(picture,
                    j + GameManager.getInstance().viewManager.worldOffset.x,
                    i + GameManager.getInstance().viewManager.worldOffset.y
                );
            }
        }

        console.log('aaaaaaaaaaaaaaa');
    }
}