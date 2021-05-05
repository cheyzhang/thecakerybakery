import * as THREE from 'three';
import { Scene, Color, PlaneBufferGeometry, MeshLambertMaterial, Mesh, TextureLoader, Sprite, SpriteMaterial } from 'three';
import { Plate, ChocolateCake, VanillaCake, ChocolateFrosting, MatchaFrosting, StrawberryFrosting, Candles, Sprinkles, Strawberry } from 'objects';
// import { BasicLights, DimLights } from 'lights';

const START = 0;
const INSTR = 1;
const CONTROLS = 2;
const NONE = 3;

class KitchenScene extends Scene {
    constructor(width, height) {
        // Call parent Scene() constructor
        super(width, height);

        // Init state
        this.state = {
            rotationSpeed: 0,
            updateList: [],
            draggable: [],
            order: [],
            atEnd: false,
            submitted: false, // 0 = not submitted, 1 = submitted but moving along still, 2
            menu: []
        };

        // Set background to a nice color
        this.background = new Color(0xE8D4E2);

        // Add meshes to scene
        // const lights = new DimLights();
        // // const lights = new BasicLights();
        // this.add(lights);

        let map = new THREE.TextureLoader().load('src/assets/bg_with_menu.png');
        map.minfilter = THREE.LinearMipMapLinearFilter
        let material = new THREE.SpriteMaterial({ map: map });
        let sprite = new THREE.Sprite(material);
        console.log(sprite);;
        let aspectRatio = width / height;
        sprite.scale.set(width * 0.57, height * 0.58, 1);
        // sprite.scale.set(width * 0.57, height * 0.58, 1);
        sprite.position.z = -1;
        this.add(sprite);

        this.toggleOverlay(width, height, START);

        // const planeGeometry = new THREE.PlaneBufferGeometry(width * 0.58, height * 0.7);
        // var texture = new THREE.TextureLoader().load('https://i.imgur.com/szuOOo2.png');
        // const planeMaterial = new THREE.MeshLambertMaterial({
        //     map: texture
        // });
        // const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        // // const plane = new THREE.Mesh(planeGeometry);
        // plane.position.z = 100;
        // plane.receiveShadow = true;
        // plane.matrixAutoUpdate = false;
        // this.add(plane);

        // Populate GUI
        // this.state.gui.add(this.state, 'rotationSpeed', -5, 5);
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
            this.addIngredientLayer(width, height);
        }
    }

    // adds a layer of ingredients....as the game goes on there will be too many. modify later.
    addIngredientLayer(width, height) {
        let chocolate_cake = new ChocolateCake(-180, -220, width, height);
        this.add(chocolate_cake);
        this.state.draggable.push(chocolate_cake);

        let vanilla_cake = new VanillaCake(-180, -160, width, height);
        this.add(vanilla_cake);
        this.state.draggable.push(vanilla_cake);

        let matcha_frosting = new MatchaFrosting(15, -143, width, height);
        this.add(matcha_frosting);
        this.state.draggable.push(matcha_frosting);

        let chocolate_frosting = new ChocolateFrosting(15, -175, width, height);
        this.add(chocolate_frosting);
        this.state.draggable.push(chocolate_frosting);

        let strawberry_frosting = new StrawberryFrosting(15, -215, width, height);
        this.add(strawberry_frosting);
        this.state.draggable.push(strawberry_frosting);

        let sprinkles = new Sprinkles(270, -178, width, height);
        this.add(sprinkles);
        this.state.draggable.push(sprinkles);

        let candles = new Candles(198, -178, width, height);
        this.add(candles);
        this.state.draggable.push(candles);

        let strawberry = new Strawberry(144, -178, width, height);
        this.add(strawberry);
        this.state.draggable.push(strawberry);
    }

    clearOrder(width, height) {
        const map = new THREE.TextureLoader().load('src/assets/plate.png');
        let material = new THREE.SpriteMaterial({ map: map });
        this.state.updateList[0].children[0].material = material;
        this.state.updateList[0].children[0].material.needsUpdate = true;
        this.state.updateList[0].children[0].scale.set(width * 0.1, height * 0.1, 1);
        this.state.updateList[0].children[0].scale.needsUpdate = true;
        this.state.updateList[0].children[0].position.y -= 10;
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

    toggleOverlay(width, height, value) {
        for (const obj of this.children) {
            if (obj.type == "overlay") {
                this.remove(obj);
                break;
            }
        }
        let file;
        if (value == START) {
            file = 'src/assets/overlays/welcome_page.png'
        }
        else if (value == INSTR) {
            file = 'src/assets/overlays/instructions.png';
        }
        else if (value == CONTROLS) {
            file = 'src/assets/overlays/controls.png';
        }
        else if (value == NONE) {
            return;
        }

        const map = new THREE.TextureLoader().load(file);
        map.minfilter = THREE.LinearMipMapLinearFilter
        const material = new THREE.SpriteMaterial({ map: map });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(width * 0.2, height * 0.24, 1);
        sprite.position.z = -1;
        sprite.type = "overlay";
        this.add(sprite);
    }
}

export default KitchenScene;
