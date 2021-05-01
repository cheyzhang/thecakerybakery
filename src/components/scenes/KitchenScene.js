import * as Dat from 'dat.gui';
import * as THREE from 'three';
import { Scene, Color, PlaneBufferGeometry, MeshLambertMaterial, Mesh, TextureLoader, Sprite, SpriteMaterial } from 'three';
import { Plate, Strawberry } from 'objects';
import { BasicLights } from 'lights';

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
        const lights = new BasicLights();
        this.add(lights);
        let plate = new Plate(-350, -90, undefined, width, height);
        this.add(plate);
        this.addToUpdateList(plate);
        // this.state.draggable.push(curr_plate);
        // plate = new Plate(-150, -90, undefined, WIDTH, HEIGHT);
        // scene.add(plate);
        // objects.push(plate);
        let strawberry = new Strawberry(-43, 25, undefined, width, height);
        this.add(strawberry);
        this.state.draggable.push(strawberry);

        var loader = new THREE.TextureLoader(); 
        loader.setCrossOrigin('anonymous'); 
        const map = new THREE.TextureLoader().load( 'https://lh4.googleusercontent.com/GUbzlKdBTI6k0VPbFZbNw0Y-CGMaGOcUsj23MJ2r83ytkA608-2O2odMh4dxru_A-53_7VciTkEstu9mH9s_5URoIebUI2Y2RACvxPKn' );
        map.minfilter = THREE.LinearMipMapLinearFilter
        const material = new THREE.SpriteMaterial( { map: map } );
        const sprite = new THREE.Sprite( material );
        sprite.scale.set( width* 0.58, height* 0.7, 1 );
        sprite.position.z = -1;
        this.add(sprite)

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
}

export default KitchenScene;
