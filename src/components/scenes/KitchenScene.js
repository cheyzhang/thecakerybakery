import * as Dat from 'dat.gui';
import * as THREE from 'three';
import { Scene, Color, PlaneBufferGeometry, MeshLambertMaterial, Mesh, TextureLoader, Sprite, SpriteMaterial } from 'three';
import { Plate, Strawberry, ChocolateCake } from 'objects';
// import { BasicLights, DimLights } from 'lights';

class KitchenScene extends Scene {
    constructor(width, height) {
        // Call parent Scene() constructor
        super(width, height);

        // Init state
        this.state = {
            // gui: new Dat.GUI(), // Create GUI for scene
            rotationSpeed: 0,
            updateList: [],
            draggable: []
        };

        // Set background to a nice color
        this.background = new Color(0xE8D4E2);

        // Add meshes to scene
        // const lights = new DimLights();
        // // const lights = new BasicLights();
        // this.add(lights);

        let map = new THREE.TextureLoader().load( 'src/assets/bgpink.png' );
        map.minfilter = THREE.LinearMipMapLinearFilter
        let material = new THREE.SpriteMaterial( { map: map } );
        let sprite = new THREE.Sprite( material );
        sprite.scale.set( width* 0.58, height* 0.7, 1 );
        sprite.position.z = -1;
        this.add(sprite);

        map = new THREE.TextureLoader().load( 'src/assets/start.png' );
        map.minfilter = THREE.LinearMipMapLinearFilter
        material = new THREE.SpriteMaterial( { map: map } );
        sprite = new THREE.Sprite( material );
        sprite.scale.set( width* 0.2, height* 0.24, 1 );
        sprite.position.z = -1;
        sprite.type = "start";
        this.add(sprite);

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
        // const { rotationSpeed, updateList } = this.state;
        // this.rotation.y = (rotationSpeed * timeStamp) / 10000;

        // Call update for each object in the updateList
        for (const obj of this.state.updateList) {
            obj.update(timeStamp, stepSize, WIDTH);
        }
    }

    addIngredients(width, height) {
        let plate = new Plate(-width / 3, -90, undefined, width, height);
        this.add(plate);
        this.addToUpdateList(plate);
        // this.state.draggable.push(curr_plate);
        // plate = new Plate(-150, -90, undefined, WIDTH, HEIGHT);
        // scene.add(plate);
        // objects.push(plate);
        let strawberry = new Strawberry(-43, 25, undefined, width, height);
        this.add(strawberry);
        this.state.draggable.push(strawberry);

        let chocolate_cake = new ChocolateCake(0, 40, undefined, width, height);
        this.add(chocolate_cake);
        this.state.draggable.push(chocolate_cake);
    }
}

export default KitchenScene;
