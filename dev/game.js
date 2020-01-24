import ObjectManager from "./managers/objectManager.js";
import ObjectFactory from "./ObjectFactory.js";
import AmmoFactory from "./weapons/ammoFactory.js"
import {Position, Vector} from "./basics/basics.js";
import GameManager from './managers/gameManager.js';
import ViewManager from "./managers/viewManager.js";
import SourceManager from "./managers/sourceManager.js";
import Map from "./map.js";
import Loader from "./loader.js";
import AnimationManager from "./managers/animationManager.js";
import {NonSpriteDynamicColorAnimation} from "./managers/animationManager.js";


let canvas = document.getElementById("canvi");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let ctx = canvas.getContext("2d");
let loader = new Loader();
loader.load();

class Game {
    constructor() {
        this.gameManager = GameManager.getInstance();
        this.spawnDelay = 5000;

        GameManager.getInstance().ctx = ctx;
        GameManager.getInstance().animationManager = new AnimationManager();
        GameManager.getInstance().sourceManager = new SourceManager();
        GameManager.getInstance().entitiesManager = new ObjectManager();
        GameManager.getInstance().objectFactory = new ObjectFactory(ctx, GameManager.getInstance().entitiesManager);
        GameManager.getInstance().ammoFactory = new AmmoFactory(GameManager.getInstance().objectFactory);
        GameManager.getInstance().entitiesManager.activateObjectFactory(GameManager.getInstance().objectFactory);
        GameManager.getInstance().player = GameManager.getInstance().objectFactory.createShip(new Position(canvas.width / 2, canvas.height / 2), 100);
        GameManager.getInstance().entitiesManager.addEntity(GameManager.getInstance().player);
        GameManager.getInstance().viewManager = new ViewManager(canvas.width, canvas.height);
        GameManager.getInstance().viewManager.setViewOn(GameManager.getInstance().player);
        GameManager.getInstance().map = new Map(2000, 2000);

        //GameManager.getInstance().animationManager.addAnimation(GameManager.getInstance().player.id, new NonSpriteDynamicColorAnimation(GameManager.getInstance().player, 2, 15));
    }

    loadMap() {
        //this.gameManager.entitiesManager.addEntity(this.gameManager.objectFactory.createPlanet(new Position(800, 300) , 0.22));
        //this.gameManager.entitiesManager.addEntity(this.gameManager.objectFactory.createPlanet(new Position(500, 300), 0.11));

        for (let i = 0; i < 0; i++) {
            this.gameManager.entitiesManager.addEntity(this.gameManager.objectFactory.createRandomAsteroid(new Vector(250, 1000)));
        }
    }

    spawnCycle(game) {
        game.gameManager.entitiesManager.addEntity(game.gameManager.objectFactory.createRandomAsteroid(new Vector(1000 - game.gameManager.viewManager.worldOffset.x, 1000 - game.gameManager.viewManager.worldOffset.y)));

        if (game.spawnDelay > 500) {
            game.spawnDelay -= 200;
        }

        let timer = setTimeout(game.spawnCycle, game.spawnDelay, game);
    }

    updatePlayer() {
        let player = this.gameManager.player;

        if (player.hasComponent('shooting')) {
            let targetPosition = new Position(GameManager.getInstance().mousePosition.x - GameManager.getInstance().viewManager.worldOffset.x,
                GameManager.getInstance().mousePosition.y - GameManager.getInstance().viewManager.worldOffset.y);

            player.getComponent('shooting').setTarget(targetPosition);
        }
    }

    update() {
        this.updatePlayer();

        if (GameManager.getInstance().player.isAlive()) {
            this.gameManager.entitiesManager.refresh();
            this.gameManager.entitiesManager.update();
            this.gameManager.viewManager.update();
        }
        else {
            GameManager.getInstance().entitiesManager.resetAll();
        }
    }

    render() {
        if (loader.imageLoaded) {
            this.gameManager.map.draw(ctx);
        }

        this.gameManager.entitiesManager.draw();
        this.gameManager.animationManager.update();
    }
}

let game = new Game();
game.loadMap();
game.spawnCycle(game);

let run = function() {
    window.requestAnimationFrame(run);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.update();
    game.render();
};

run();

document.addEventListener('keyup', function (event) {
    console.log(event.keyCode);
    game.gameManager.player.getComponent('move').stop();
});

document.addEventListener('mousedown', function (event) {
    let mousePosition = new Position(event.x - game.gameManager.viewManager.worldOffset.x, event.y - game.gameManager.viewManager.worldOffset.y);

    game.gameManager.player.getComponent('shooting').shootingOn(mousePosition);
});

document.addEventListener('mouseup', function (event) {
    game.gameManager.player.getComponent('shooting').shootingOff();
});

document.addEventListener('mousemove', function (event) {
    console.log('mouse move');

    game.gameManager.mousePosition.x = event.x;
    game.gameManager.mousePosition.y = event.y;

    let mousePosition = new Position(event.x - game.gameManager.viewManager.worldOffset.x, event.y - game.gameManager.viewManager.worldOffset.y);

    game.gameManager.player.getComponent('shooting').setTarget(mousePosition);
});

document.addEventListener('keypress', function (event) {
    console.log(event.keyCode);

    if (game.gameManager.player.getComponent('move').currentDirection) {
        return;
    }

    switch(event.keyCode) {
        case 100:
            game.gameManager.player.getComponent('move').right();
            break;
        case 115:
            game.gameManager.player.getComponent('move').down();
            break;
        case 97:
            game.gameManager.player.getComponent('move').left();
            break;
        case 119:
            game.gameManager.player.getComponent('move').up();
            break;
    }
}, false);