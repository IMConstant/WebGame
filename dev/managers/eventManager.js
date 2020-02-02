import GameManager from "./gameManager.js";
import {Position} from "../basics/basics.js";
import {SpriteAnimation, OneCycleSpriteAnimation} from "./animationManager.js";

export class Event {
    constructor(eventType, args) {
        this.eventType = eventType;
        this.args = args;
    }
}

export default class EventManager {
    constructor() {
        this.gameManager = GameManager.getInstance();
        this.events = new Map();
        this.eventsToUpdate = [];

        this.initKeyboardAndMouseEvents();
        this.initGameEvents();

        this.keyDirection = new Map([
            ['d', 'right'],
            ['s', 'down'],
            ['a', 'left'],
            ['w', 'up'],
        ]);
    }

    update() {
        for (let event of this.eventsToUpdate) {
            let eventUpdaters = this.events.get(event.eventType);

            if (eventUpdaters) {
                for (let update of eventUpdaters) {
                    update(...event.args);
                }
            }
        }

        this.eventsToUpdate = [];
    }

    clear() {
        this.eventsToUpdate = [];
    }

    initKeyboardAndMouseEvents() {
        this.addEventListener('keyup', (event) => {
            if (this.keyDirection.has(event.key)) {
                this.gameManager.player.getComponent('move').stop(this.keyDirection.get(event.key));
            }
        });

        this.addEventListener('mousedown', (event) => {
            let mousePosition = new Position(event.x - this.gameManager.viewManager.worldOffset.x, event.y - this.gameManager.viewManager.worldOffset.y);

            this.gameManager.player.getComponent('shooting').shootingOn(mousePosition);
        });

        this.addEventListener('mouseup', (event) => {
            this.gameManager.player.getComponent('shooting').shootingOff();
        });

        this.addEventListener('mousemove', (event) => {
            this.gameManager.mousePosition.x = event.x;
            this.gameManager.mousePosition.y = event.y;

            let mousePosition = new Position(event.x - this.gameManager.viewManager.worldOffset.x, event.y - this.gameManager.viewManager.worldOffset.y);

            this.gameManager.player.getComponent('shooting').setTarget(mousePosition);
        });

        document.addEventListener('keypress', (event) => {
            if (this.gameManager.player && this.gameManager.player.getComponent('move').currentDirection) {
                return;
            }

            switch(event.key) {
                case 'd':
                    this.gameManager.player.getComponent('move').moveRight();
                    break;
                case 's':
                    this.gameManager.player.getComponent('move').moveDown();
                    break;
                case 'a':
                    this.gameManager.player.getComponent('move').moveLeft();
                    break;
                case 'w':
                    this.gameManager.player.getComponent('move').moveUp();
                    break;
                case 'r':
                    this.gameManager.player.getComponent('shooting').weapon.reload();
                    break;
            }
        }, false);
    }

    initGameEvents() {
        this.events.set('reloadingOn', [(entity) => {
            this.gameManager.animationManager.addBasicAnimation('reloading', entity);
        }]);

        this.events.set('reloadingOff', [(entity) => {
            this.gameManager.animationManager.removeAnimation(entity.id, 'reloading');
        }]);

        this.events.set('moveRight', [(entity) => {
            if (entity.hasComponent('sprite')) {
                console.log(entity.getComponent('sprite').assetName);

                this.gameManager.animationManager.addAnimation(
                    entity.id,
                    'character',
                    new SpriteAnimation(entity,
                        this.gameManager.sourceManager.getAssetByName(entity.getComponent('sprite').assetName),
                        5,
                        'moveRight'
                    )
                );
            }
        }]);

        this.events.set('moveDown', [(entity) => {
            if (entity.hasComponent('sprite')) {
                console.log(entity.getComponent('sprite').assetName);

                this.gameManager.animationManager.addAnimation(
                    entity.id,
                    'character',
                    new SpriteAnimation(entity,
                        this.gameManager.sourceManager.getAssetByName(entity.getComponent('sprite').assetName),
                        5,
                        'moveDown'
                    )
                );
            }
        }]);

        this.events.set('moveLeft', [(entity) => {
            if (entity.hasComponent('sprite')) {

                this.gameManager.animationManager.addAnimation(
                    entity.id,
                    'character',
                    new SpriteAnimation(entity,
                        this.gameManager.sourceManager.getAssetByName(entity.getComponent('sprite').assetName),
                        5,
                        'moveLeft'
                    )
                );
            }
        }]);

        this.events.set('moveUp', [(entity) => {
            if (entity.hasComponent('sprite')) {

                this.gameManager.animationManager.addAnimation(
                    entity.id,
                    'character',
                    new SpriteAnimation(entity,
                        this.gameManager.sourceManager.getAssetByName(entity.getComponent('sprite').assetName),
                        5,
                        'moveUp'
                    )
                );
            }
        }]);

        this.events.set('moveStop', [(entity) => {
            if (entity.hasComponent('sprite')) {

                this.gameManager.animationManager.addAnimation(
                    entity.id,
                    'character',
                    new SpriteAnimation(entity,
                        this.gameManager.sourceManager.getAssetByName(entity.getComponent('sprite').assetName),
                        5,
                        'stand'
                    )
                );
            }
        }]);

        this.events.set('destruction', [(entity) => {
            if (entity.killedBy && entity.killedBy.hasGroup('player')) {
                GameManager.getInstance().deathCount++;

                console.log('killed count = ', GameManager.getInstance().deathCount);
            }

            this.gameManager.animationManager.removeAnimation(entity.id);

            if (entity.hasComponent('sprite')) {
                let sprite = this.gameManager.objectFactory.createEmptySprite(entity);

                this.gameManager.animationManager.addAnimation(sprite.id,
                    'destruction',
                    new OneCycleSpriteAnimation(sprite,
                        this.gameManager.sourceManager.getAssetByName(sprite.getComponent('sprite').assetName),
                        2,
                        'destruction',
                        200));

                this.gameManager.entitiesManager.addEntity(sprite);
            }
        }]);
    }

    addEvent(eventType, ...args) {
        this.eventsToUpdate.push(new Event(eventType, args));
    }

    addGameEventListener(eventType, callBack) {
        if (this.events.has(eventType)) {
            this.events.get(eventType).push(callBack);
        }
    }

    addEventListener(eventType, callBack, options=false) {
        document.addEventListener(eventType, callBack, options);
    }
}