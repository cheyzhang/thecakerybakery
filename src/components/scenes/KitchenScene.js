import * as THREE from 'three';
import { Scene, Color, PlaneBufferGeometry, MeshLambertMaterial, Mesh, TextureLoader, Sprite, SpriteMaterial } from 'three';
import { Plate, ChocolateCake, VanillaCake, ChocolateFrosting, MatchaFrosting, StrawberryFrosting, Candles, Sprinkles, Strawberry } from 'objects';
// import { BasicLights, DimLights } from 'lights';

const START = 0;
const INSTR = 1;
const NONE = 2;

class KitchenScene extends Scene {
    constructor(width, height) {
        // Call parent Scene() constructor
        super(width, height);

        // Init state
        this.state = {
            rotationSpeed: 0,
            updateList: [],
            draggable: [],
        };

        // Set background to a nice color
        this.background = new Color(0xE8D4E2);

        // Add meshes to scene
        // const lights = new DimLights();
        // // const lights = new BasicLights();
        // this.add(lights);

        let map = new THREE.TextureLoader().load( 'src/assets/background3.png' );
        map.minfilter = THREE.LinearMipMapLinearFilter
        let material = new THREE.SpriteMaterial( { map: map } );
        let sprite = new THREE.Sprite( material );
        sprite.scale.set( width * 0.57, height * 0.58, 1 );
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

    update(timeStamp, stepSize, WIDTH) {
        // Call update for each object in the updateList
        // console.log(this.state.updateList[0].children.x);
        if (this.state.updateList[0].children[0].position.x >= WIDTH / 3) {
            for (const obj of this.state.updateList) {
                if (obj.name != 'plate') {
                    this.remove(obj);
                }                
            }
            this.state.updateList = this.state.updateList.splice(0, 1);
            this.state.updateList[0].update(timeStamp, stepSize, WIDTH);
            // reset plate speed
            return 0;
        }
        for (const obj of this.state.updateList) {
            obj.update(timeStamp, stepSize, WIDTH);
        }
        return 1;
    }

    addIngredients(width, height) {
        let plate = new Plate(-width / 3, -90, width, height);
        this.add(plate);
        this.addToUpdateList(plate);
        // this.state.draggable.push(curr_plate);
        // plate = new Plate(-150, -90, undefined, WIDTH, HEIGHT);
        // scene.add(plate);
        // objects.push(plate);

        let chocolate_cake = new ChocolateCake(20, 120, width, height);
        this.add(chocolate_cake);
        this.state.draggable.push(chocolate_cake);

        let vanilla_cake = new VanillaCake(-40, 120, width, height);
        this.add(vanilla_cake);
        this.state.draggable.push(vanilla_cake);

        let strawberry = new Strawberry(97, -178, width, height);
        this.add(strawberry);
        this.state.draggable.push(strawberry);

        let matcha_frosting = new MatchaFrosting(10, -143, width, height);
        this.add(matcha_frosting);
        this.state.draggable.push(matcha_frosting);

        let candles = new Candles(132, -178, width, height);
        this.add(candles);
        this.state.draggable.push(candles);

        let sprinkles = new Sprinkles(188, -178, width, height);
        this.add(sprinkles);
        this.state.draggable.push(sprinkles);
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
            file = 'src/assets/start.png'
        }
        else if (value == INSTR) {
            file = 'src/assets/instructions.png';
        }
        else if (value == NONE) {
            return;
        }

        const map = new THREE.TextureLoader().load( file );
        map.minfilter = THREE.LinearMipMapLinearFilter
        const material = new THREE.SpriteMaterial( { map: map } );
        const sprite = new THREE.Sprite( material );
        sprite.scale.set( width* 0.2, height* 0.24, 1 );
        sprite.position.z = -1;
        sprite.type = "overlay";
        this.add(sprite);
    }
}

export default KitchenScene;
