import * as THREE from 'three';
import { Scene, Color, PlaneBufferGeometry, MeshLambertMaterial, Mesh, TextureLoader, Sprite, SpriteMaterial, FontLoader, TextGeometry } from 'three';
import { Notification, Plate, ChocolateCake, VanillaCake, ChocolateFrosting, MatchaFrosting, StrawberryFrosting, Candles, Sprinkles, Strawberry } from 'objects';
// import { BasicLights, DimLights } from 'lights';

//play status
const NOT_STARTED = 0;
const PAUSED = 1;
const PLAYING = 2;
const GAME_OVER = 3;

// overlays
const START = 0;
const INSTR = 1;
const CONTROLS = 2;
const PAUSED_TITLE = 3;
const GAME_OVER_TITLE = 4;
const NONE = 5;

const ALL_INGREDIENTS = [
    'chocolate_cake',
    'yellow_cake',
    'chocolate_frosting',
    'matcha_frosting',
    'strawberry_frosting',
    'candles',
    'sprinkles',
    'strawberry',];

class KitchenScene extends Scene {
    constructor(width, height) {
        // Call parent Scene() constructor
        super(width, height);

        // Init state
        this.state = {
            updateList: [],
            draggable: [],
            order: [],
            atEnd: false,
            submitted: false,
            menu: []
        };

        // Set background to a nice color
        this.background = new Color(0xF4E8AE);

        // add background
        let map = new THREE.TextureLoader().load('src/assets/bg_longer.png');
        map.minfilter = THREE.LinearMipMapLinearFilter;
        map.generateMipmaps = false;
        map.wrapS = map.wrapT = THREE.ClampToEdgeWrapping;
        map.minFilter = THREE.LinearFilter;
        // map.minfilter = THREE.LinearFilter;
        let material = new THREE.SpriteMaterial({ map: map });
        let sprite = new THREE.Sprite(material);
        console.log(sprite);
        // 16000 x 10400
        // let ratio = 0.65;
        let ratio = height / width;
        let new_width = width * 0.6;
        sprite.scale.set(new_width, ratio * new_width, 1);
        // sprite.scale.set(width / 16000, height / 10400, 1);
        console.log(sprite.scale);
        sprite.position.z = -1;
        this.add(sprite);

        // add start screen
        this.toggleOverlay(width, height, START);
    }

    addToUpdateList(object) {
        this.state.updateList.push(object);
    }

    update(timeStamp, stepSize, WIDTH, HEIGHT, playing) {
        if (this.state.updateList.length == 0) {
            return;
        }
        // if the plate is offscreen
        if (this.state.updateList[0].children[0].position.x >= WIDTH / 3) {
            // this.clearOrder(WIDTH, HEIGHT);
            this.state.atEnd = true;
            this.state.updateList[0].update(timeStamp, stepSize, WIDTH);
        }
        else {
            this.state.atEnd = false;
            for (const obj of this.state.updateList) {
                // only notifications updated when not playing
                if (playing == PLAYING || obj.type == 'notification') {
                    if (obj.type == 'notification') {
                        console.log('notif here')
                    }
                    if (obj.update(timeStamp, stepSize, WIDTH) == 1) {
                        console.log("removing notif");
                        this.remove(obj);
                        this.state.updateList.splice(this.state.updateList.indexOf(obj), 1);
                    }
                }
            }
        }
    }

    addIngredients(width, height) {
        let plate = new Plate(-width / 3, -90, width, height);
        this.add(plate);
        this.addToUpdateList(plate);
        // this.state.draggable.push(curr_plate);
        // plate = new Plate(-150, -90, undefined, WIDTH, HEIGHT);
        // scene.add(plate);
        // objects.push(plate);

        this.state.order.push('plate');

        for (let i = 0; i < 2; i++) {
            this.replenishIngredients(width, height, ALL_INGREDIENTS);
        }
    }

    replenishIngredients(width, height, ingredients) {
        let new_item;
        for (const item of ingredients) {
            switch (item) {
                case ALL_INGREDIENTS[0]:
                    new_item = new ChocolateCake(-0.114 * width, -0.26 * height, width, height);
                    break;
                case ALL_INGREDIENTS[1]:
                    new_item = new VanillaCake(-0.114 * width, -0.19 * height, width, height);
                    break;
                case ALL_INGREDIENTS[2]:
                    new_item = new ChocolateFrosting(0.01 * width, -0.22 * height, width, height);
                    break;
                case ALL_INGREDIENTS[3]:
                    new_item = new MatchaFrosting(0.01 * width, -0.18 * height, width, height);
                    break;
                case ALL_INGREDIENTS[4]:
                    new_item = new StrawberryFrosting(0.01 * width, -0.26 * height, width, height);
                    break;
                case ALL_INGREDIENTS[5]:
                    new_item = new Candles(0.124 * width, -0.215 * height, width, height);
                    break;
                case ALL_INGREDIENTS[6]:
                    new_item = new Sprinkles(0.17 * width, -0.215 * height, width, height);
                    break;
                case ALL_INGREDIENTS[7]:
                    new_item = new Strawberry(0.091 * width, -0.215 * height, width, height);
                    break;
            }
            this.add(new_item);
            this.state.draggable.push(new_item);
        }
    }

    clearOrder(width, height) {
        const map = new THREE.TextureLoader().load('src/assets/plate.png');
        let material = new THREE.SpriteMaterial({ map: map });
        this.state.updateList[0].children[0].material = material;
        this.state.updateList[0].children[0].material.needsUpdate = true;
        if (this.state.updateList[0].type != "plate") {
            this.state.updateList[0].children[0].position.y -= 17;
            this.state.updateList[0].children[0].scale.set(width * 0.105, height * 0.06, 1);
            this.state.updateList[0].children[0].scale.needsUpdate = true;
        }
        this.state.updateList[0].type = "plate";
        // this.state.updateList = this.state.updateList.splice(0, 1);
        this.state.order = ["plate"];
    }

    addOrder(width, height) {
        let map = new THREE.TextureLoader().load('src/assets/ingredients/cake_combos/p_yc.png');
        let material = new THREE.SpriteMaterial({ map: map });
        let sprite = new THREE.Sprite(material);
        sprite.scale.set(width * 0.06, height * 0.06, 1);
        sprite.position.x = -250;
        sprite.position.y = 70;
        sprite.position.z = -1;
        this.add(sprite);
        this.state.menu.push(sprite);
    }

    // toggle the title screens
    toggleOverlay(width, height, value) {
        // console.log(this.children);
        let file;
        switch (value) {
            case START:
            //     file = 'src/assets/overlays/welcome_page.png';
            //     break;
            // case START_BLINK:
                file = 'src/assets/overlays/welcome_page_blink.png';
                break;
            case INSTR:
            //     file = 'src/assets/overlays/instructions.png';
            //     break;
            // case INSTR_BLINK:
                file = 'src/assets/overlays/instructions_blink.png';
                break;
            case CONTROLS:
            //     file = 'src/assets/overlays/controls.png';
            //     break;
            // case CONTROLS_BLINK:
                file = 'src/assets/overlays/controls_blink.png';
                break;
            case PAUSED_TITLE:
            //     file = 'src/assets/overlays/paused.png';
            //     break;
            // case PAUSED_BLINK:
                file = 'src/assets/overlays/paused_blink.png';
                break;
            case GAME_OVER_TITLE:
            //     file = 'src/assets/overlays/game_over.png';
            //     break;
            // case GAME_OVER_BLINK:
                file = 'src/assets/overlays/game_over_blink.png';
                break;
            case NONE:
                for (const obj of this.children) {
                    if (obj.type == "overlay") {
                        this.remove(obj);
                        break;
                    }
                }
                return;
            default:
                return;
        }

        const map = new THREE.TextureLoader().load(file);
        map.minfilter = THREE.LinearMipMapLinearFilter
        const material = new THREE.SpriteMaterial({ map: map });
        for (const obj of this.children) {
            // if there's already an overlay, just replace its material
            if (obj.type == "overlay") {
                obj.material = material;
                obj.material.needsUpdate = true;
                return;
            }
        }
        // else make a completely new sprite
        const sprite = new THREE.Sprite(material);
        // console.log(sprite);
        console.log("new sprite");
        // 336 x 207 = ratio of 0.62
        const new_width = Math.max(350, width * 0.2);
        sprite.scale.set(new_width, 0.62 * new_width, 1);
        sprite.position.z = 0;
        sprite.type = "overlay";
        this.add(sprite);
    }

    showNotification(image, x, y, width, height) {
        const new_notif = new Notification(image, x, y, width, height);
        this.add(new_notif);
        this.addToUpdateList(new_notif);
    }
}

export default KitchenScene;
