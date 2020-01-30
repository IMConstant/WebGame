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
import EventManager from "./managers/eventManager.js";
import {SpriteAnimation} from "./managers/animationManager.js";


let canvas = document.getElementById("canvi");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let ctx = canvas.getContext("2d");
let loader = new Loader();
loader.load();

let background = new Audio("./audio/forest.mp3");
background.volume = 0.35;
background.play();

class Game {
    constructor() {
        this.gameManager = GameManager.getInstance();
        this.spawnDelay = 5000;
        this.gameOver = false;
        this.restart = false;

        GameManager.getInstance().map = new Map();
        GameManager.getInstance().ctx = ctx;
        GameManager.getInstance().animationManager = new AnimationManager();
        GameManager.getInstance().sourceManager = new SourceManager();
        GameManager.getInstance().entitiesManager = new ObjectManager();
        loader.loadAssets();
        loader.loadMap('./maps/map1/map1.json');
        GameManager.getInstance().objectFactory = new ObjectFactory(ctx, GameManager.getInstance().entitiesManager);
        GameManager.getInstance().ammoFactory = new AmmoFactory(GameManager.getInstance().objectFactory);
        GameManager.getInstance().entitiesManager.activateObjectFactory(GameManager.getInstance().objectFactory);
        GameManager.getInstance().player = GameManager.getInstance().objectFactory.createShip(new Position(canvas.width / 2, canvas.height / 2), 100);
        GameManager.getInstance().entitiesManager.addEntity(GameManager.getInstance().player);
        GameManager.getInstance().viewManager = new ViewManager(canvas.width, canvas.height);
        GameManager.getInstance().viewManager.setViewOn(GameManager.getInstance().player);
        GameManager.getInstance().eventManager = new EventManager();
    }

    init() {
        this.gameManager.eventManager.addGameEventListener('destruction', (entity) => {
            if (entity.id === this.gameManager.player.id) {
                background.pause();

                this.gameOver = true;

                let audio = new Audio('./audio/death.mp3');
                audio.volume = 1;
                audio.play();
            }
        });

        this.gameManager.eventManager.addEventListener('keypress', (event) => {
            if (this.gameOver) {
                if (event.key === 'r') {
                    this.gameOver = false;
                    this.restart = true;
                }
            }
        });

        this.gameManager.animationManager.addAnimation(this.gameManager.player.id,
            'character',
            new SpriteAnimation(this.gameManager.player,
                this.gameManager.sourceManager.getAssetByName(this.gameManager.player.getComponent('sprite').assetName),
                5,
                'moveRight'));
    }

    reload() {
        this.gameManager.entitiesManager.resetAll();
        loader.loadMap('./maps/map1/map1.json');
        this.gameManager.animationManager.clear();
        this.gameManager.player = GameManager.getInstance().objectFactory.createShip(new Position(canvas.width / 2, canvas.height / 2), 100);
        this.gameManager.entitiesManager.addEntity(this.gameManager.player);
        this.gameManager.viewManager.setViewOn(this.gameManager.player);
        this.gameManager.eventManager.clear();
        this.restart = false;
    }

    run() {
        if (this.restart) {
            this.reload();
        }

        if (loader.imageLoaded) {
            this.update();
            this.render();
        }

        window.requestAnimationFrame(() => {
            this.run();
        });
    }

    spawnCycle(game) {
        let enemy = null;
        let p = Math.random();
        let enemyPosition = new Position(Math.random() * game.gameManager.map.width,
            Math.random() * game.gameManager.map.height);

        if (p < 0.7) {
            enemy = game.gameManager.objectFactory.createEnemy('orc', enemyPosition);
        }
        else if (p < 0.95) {
            enemy = game.gameManager.objectFactory.createEnemy('body', enemyPosition);
        }
        else {
            enemy = game.gameManager.objectFactory.createEnemy('skeleton', enemyPosition);
        }

        enemy.addGroup('enemy');

        game.gameManager.entitiesManager.addEntity(enemy);
        game.gameManager.animationManager.addAnimation(enemy.id,
            'character',
            new SpriteAnimation(enemy,
                game.gameManager.sourceManager.getAssetByName(enemy.getComponent('sprite').assetName),
                5,
                'moveRight'));

        if (game.spawnDelay > 500) {
            game.spawnDelay -= 100;
        }

        //game.gameManager.viewManager.setViewOn(enemy);
        //game.gameManager.player = enemy;

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

        this.gameManager.entitiesManager.refresh();
        this.gameManager.entitiesManager.update();
        this.gameManager.viewManager.update();
        this.gameManager.eventManager.update();
        this.gameManager.animationManager.update();
    }

    render() {
        this.gameManager.map.draw(ctx);
    }
}

let game = new Game();

game.init();
game.spawnCycle(game);
game.run();