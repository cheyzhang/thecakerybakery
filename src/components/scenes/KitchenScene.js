import * as THREE from 'three';
import { Scene, Color} from 'three';
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
            menu: [],
            flip: false,
            count: 0,
        };

        // Set background to a nice color
        this.background = new Color(0xF4E8AE);

        // add background
        // let map = new THREE.TextureLoader().load('src/assets/bg_longer.png');
        let map = new THREE.TextureLoader().load('src/assets/bg_no_dots.png');
        map.minfilter = THREE.LinearMipMapLinearFilter;
        map.generateMipmaps = false;
        map.wrapS = map.wrapT = THREE.ClampToEdgeWrapping;
        map.minFilter = THREE.LinearFilter;
        let material = new THREE.SpriteMaterial({ map: map });
        let sprite = new THREE.Sprite(material);
        let ratio = height / width;
        let new_width = width * 0.7;
        sprite.scale.set(new_width, ratio * new_width, 1);
        sprite.position.z = -1;
        this.add(sprite);

        // add steam
        map = new THREE.TextureLoader().load('src/assets/bg_components/steam1.png');
        map.minfilter = THREE.LinearMipMapLinearFilter;
        map.generateMipmaps = false;
        map.wrapS = map.wrapT = THREE.ClampToEdgeWrapping;
        map.minFilter = THREE.LinearFilter;
        material = new THREE.SpriteMaterial({ map: map });
        sprite = new THREE.Sprite(material);
        sprite.scale.set(width*0.05, height*0.12, 1);
        sprite.position.x = width*0.265;
        sprite.position.y = height*0.035; 
        sprite.position.z = -1;
        sprite.type = "steam"; 
        this.add(sprite);

        // add dots
        map = new THREE.TextureLoader().load('src/assets/bg_components/dots2.png');
        map.minfilter = THREE.LinearMipMapLinearFilter;
        map.generateMipmaps = false;
        map.wrapS = map.wrapT = THREE.ClampToEdgeWrapping;
        map.minFilter = THREE.LinearFilter;
        material = new THREE.SpriteMaterial({ map: map });
        sprite = new THREE.Sprite(material);
        sprite.scale.set(new_width, ratio * new_width, 1);
        sprite.position.z = -1;
        sprite.type = "dots"; 
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
            this.state.atEnd = true;
            this.state.updateList[0].update(timeStamp, stepSize, WIDTH);
        }
        else {
            this.state.atEnd = false;
            for (const obj of this.state.updateList) {
                // only notifications updated when not playing
                if (playing == PLAYING || obj.type == 'notification') {
                    if (obj.update(timeStamp, stepSize, WIDTH) == 1) {
                        this.remove(obj);
                        this.state.updateList.splice(this.state.updateList.indexOf(obj), 1);
                    }
                }
            }
        }
        // if (this.state.count%10 == 0) {
        //     this.addDots(WIDTH, HEIGHT); 
        // }
        // this.state.count += 1; 
    }

    addDots(width, height) {      
        // add dots 
        let map; 
        if (this.state.flip) {
            map = new THREE.TextureLoader().load('src/assets/bg_components/dots1.png');
        }
        else {
            map = new THREE.TextureLoader().load('src/assets/bg_components/dots2.png');
        }

        for (const obj of this.children) {
            if (obj.type == "dots") {
                map.minfilter = THREE.LinearMipMapLinearFilter;
                map.magFilter = THREE.NearestFilter;
                let material = new THREE.SpriteMaterial({ map: map });
                obj.material = material;
                obj.needsUpdate = true;
                break;
            }
        }

        this.state.flip = !this.state.flip; 
    }

    addIngredients(width, height) {
        // not the first time playing = move plate to beginning
        if (this.state.updateList.length != 0) {
            this.state.updateList[0].children[0].position.x = -width / 3;
            this.clearOrder(width, height);
        }
        // first time playing = create plate
        else {
            let plate = new Plate(-width / 3, -0.07 * height, width, height);
            this.add(plate);
            this.addToUpdateList(plate);
            this.state.order.push('plate');   
        }

        console.log(this.state.updateList);

        for (let i = 0; i < 2; i++) {
            this.replenishIngredients(width, height, ALL_INGREDIENTS);
        }
    }

    replenishIngredients(width, height, ingredients) {
        let new_item;
        for (const item of ingredients) {
            switch (item) {
                case ALL_INGREDIENTS[0]:
                    new_item = new ChocolateCake(-0.1325 * width, -0.255 * height, width, height);
                    break;
                case ALL_INGREDIENTS[1]:
                    new_item = new VanillaCake(-0.1325 * width, -0.18 * height, width, height);
                    break;
                case ALL_INGREDIENTS[2]:
                    new_item = new ChocolateFrosting(0.01 * width, -0.23 * height, width, height);
                    break;
                case ALL_INGREDIENTS[3]:
                    new_item = new MatchaFrosting(0.01 * width, -0.18 * height, width, height);
                    break;
                case ALL_INGREDIENTS[4]:
                    new_item = new StrawberryFrosting(0.01 * width, -0.275 * height, width, height);
                    break;
                case ALL_INGREDIENTS[5]:
                    new_item = new Candles(0.138 * width, -0.215 * height, width, height);
                    break;
                case ALL_INGREDIENTS[6]:
                    new_item = new Sprinkles(0.178 * width, -0.215 * height, width, height);
                    break;
                case ALL_INGREDIENTS[7]:
                    new_item = new Strawberry(0.107 * width, -0.21 * height, width, height);
                    break;
            }
            this.add(new_item);
            this.state.draggable.push(new_item);
        }
    }

    clearOrder(width, height) {
        const map = new THREE.TextureLoader().load('src/assets/plate.png');
        map.minFilter = THREE.NearestMipmapNearestFilter;
        map.magFilter = THREE.NearestFilter;
        let material = new THREE.SpriteMaterial({ map: map });
        this.state.updateList[0].children[0].material = material;
        this.state.updateList[0].children[0].material.needsUpdate = true;
        if (this.state.updateList[0].type != "plate") {
            this.state.updateList[0].children[0].position.y = -0.07 * height;
            this.state.updateList[0].children[0].scale.set(width * 0.105, height * 0.06, 1);
            this.state.updateList[0].children[0].scale.needsUpdate = true;
        }
        this.state.updateList[0].type = "plate";
        this.state.order = ["plate"];
    }

    addOrder(width, height) {
        let map = new THREE.TextureLoader().load('src/assets/ingredients/cake_combos/p_yc.png');
        map.magFilter = THREE.NearestFilter;
        let material = new THREE.SpriteMaterial({ map: map });
        let sprite = new THREE.Sprite(material);
        sprite.scale.set(width * 0.06, height * 0.06, 1);
        sprite.position.x = -0.2 * width;
        sprite.position.y = 0.11 * height;
        sprite.position.z = -1;
        this.add(sprite);
        this.state.menu.push(sprite);
    }

    // toggle the title screens
    toggleOverlay(width, height, value) {
        let file;
        switch (value) {
            case START:
                file = 'src/assets/overlays/welcome_page_blink.png';
                break;
            case INSTR:
                file = 'src/assets/overlays/instructions_blink.png';
                break;
            case CONTROLS:
                file = 'src/assets/overlays/controls_blink.png';
                break;
            case PAUSED_TITLE:
                file = 'src/assets/overlays/paused_blink.png';
                break;
            case GAME_OVER_TITLE:
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
