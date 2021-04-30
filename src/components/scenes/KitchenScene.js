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
        this.background = new Color(0x7ec0ee);

        // Add meshes to scene
        const lights = new BasicLights();
        // const plate = new Plate();
        this.add(lights);
        // this.add(plate);
        let curr_plate = new Plate(-350, -90, undefined, width, height);
        this.add(curr_plate);
        this.addToUpdateList(curr_plate);
        this.state.draggable.push(curr_plate);
        // curr_plate = new Plate(-150, -90, undefined, WIDTH, HEIGHT);
        // scene.add(curr_plate);
        // objects.push(curr_plate);
        let strawberry = new Strawberry(-43, 25, undefined, width, height);
        this.add(strawberry);
        this.state.draggable.push(strawberry);

        const planeGeometry = new THREE.PlaneBufferGeometry(width * 0.58, height * 0.7);
        // const planeMaterial = new THREE.MeshLambertMaterial(0x7ec022);
        // var texture = new THREE.TextureLoader().load('https://lh3.googleusercontent.com/nCQ4_MhGCfIDk9SXkFeNje8jkoB3TPpCZNB71jAZhR_Ydpe4FZIVsPIz2dCsPDyvZy6NBEPEgRIu_2QeVYillbNgZFb9iJ4fxouknf7miVorEr6qlNjolu4k6PetQ3795EjWiD-P');
        var texture = new THREE.TextureLoader().load('https://i.imgur.com/szuOOo2.png');
        const planeMaterial = new THREE.MeshLambertMaterial({
            map: texture
        });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        // const plane = new THREE.Mesh(planeGeometry);
        plane.position.z = 100;
        // const plane = new THREE.Mesh(planeGeometry);
        plane.receiveShadow = true;
        plane.matrixAutoUpdate = false;
        this.add(plane);

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
