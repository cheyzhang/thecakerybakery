import * as THREE from 'three';
import { Scene, Color, PlaneBufferGeometry, MeshLambertMaterial, Mesh, TextureLoader, Sprite, SpriteMaterial, FontLoader, TextGeometry } from 'three';
import { Plate, ChocolateCake, VanillaCake, ChocolateFrosting, MatchaFrosting, StrawberryFrosting, Candles, Sprinkles, Strawberry } from 'objects';
// import { BasicLights, DimLights } from 'lights';

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
    'strawberry',
    'candles',
    'sprinkles'];

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
        this.background = new Color(0xE8D4E2);

        // add background
        let map = new THREE.TextureLoader().load('src/assets/bg_with_menu.png');
        map.minfilter = THREE.LinearMipMapLinearFilter
        let material = new THREE.SpriteMaterial({ map: map });
        let sprite = new THREE.Sprite(material);
        console.log(sprite);;
        let aspectRatio = width / height;
        sprite.scale.set(width * 0.57, height * 0.58, 1);
        sprite.position.z = -1;
        this.add(sprite);

        // add start screen
        this.toggleOverlay(width, height, START);
    }

    addToUpdateList(object) {
        this.state.updateList.push(object);
    }

    update(timeStamp, stepSize, WIDTH, HEIGHT) {
        if (this.state.updateList[0].children[0].position.x >= WIDTH / 3) {
            this.clearOrder(WIDTH, HEIGHT);
            this.state.atEnd = true;
            this.state.updateList[0].update(timeStamp, stepSize, WIDTH);
        }
        else {
            this.state.atEnd = false;
            for (const obj of this.state.updateList) {
                obj.update(timeStamp, stepSize, WIDTH);
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
                    new_item = new ChocolateCake(-180, -220, width, height);
                    break;
                case ALL_INGREDIENTS[1]:
                    new_item = new VanillaCake(-180, -160, width, height);
                    break;
                case ALL_INGREDIENTS[2]:
                    new_item = new MatchaFrosting(15, -143, width, height);
                    break;
                case ALL_INGREDIENTS[3]:
                    new_item = new ChocolateFrosting(15, -175, width, height);
                    break;
                case ALL_INGREDIENTS[4]:
                    new_item = new StrawberryFrosting(15, -215, width, height);
                    break;
                case ALL_INGREDIENTS[5]:
                    new_item = new Sprinkles(270, -178, width, height);
                    break;
                case ALL_INGREDIENTS[6]:
                    new_item = new Candles(198, -178, width, height);
                    break;
                case ALL_INGREDIENTS[7]:
                    new_item = new Strawberry(144, -178, width, height);
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
            this.state.updateList[0].children[0].position.y -= 10;
            this.state.updateList[0].children[0].scale.set(width * 0.08, height * 0.08, 1);
            this.state.updateList[0].children[0].scale.needsUpdate = true;
        }
        this.state.updateList[0].type = "plate";
        this.state.updateList = this.state.updateList.splice(0, 1);
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
        for (const obj of this.children) {
            if (obj.type == "overlay") {
                this.remove(obj);
                break;
            }
        }
        // console.log(this.children);
        let file;
        switch (value) {
            case START:
                file = 'src/assets/overlays/welcome_page.png';
                break;
            case INSTR:
                file = 'src/assets/overlays/instructions.png';
                break;
            case CONTROLS:
                file = 'src/assets/overlays/controls.png';
                break;
            case PAUSED_TITLE:
                file = 'src/assets/overlays/paused.png';
                break;
            case GAME_OVER_TITLE:
                file = 'src/assets/overlays/game_over.png';
                break;
            case NONE:
                return;
            default:
                return;
        }

        const map = new THREE.TextureLoader().load(file);
        map.minfilter = THREE.LinearMipMapLinearFilter
        const material = new THREE.SpriteMaterial({ map: map });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(width * 0.2, height * 0.24, 1);
        sprite.position.z = 0;
        sprite.type = "overlay";
        this.add(sprite);
    }
}

export default KitchenScene;
