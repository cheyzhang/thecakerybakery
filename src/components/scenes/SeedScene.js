import * as Dat from 'dat.gui';
import * as THREE from 'three';
import { Scene, Color, PlaneBufferGeometry, MeshLambertMaterial, Mesh, TextureLoader, Sprite, SpriteMaterial } from 'three';
import { Flower, Land, Plate } from 'objects';
import { BasicLights } from 'lights';

class SeedScene extends Scene {
    constructor() {
        // Call parent Scene() constructor
        super();

        // Init state
        this.state = {
            gui: new Dat.GUI(), // Create GUI for scene
            rotationSpeed: 0,
            updateList: [],
        };

        // Set background to a nice color
        this.background = new Color(0x7ec0ee);

        // Add meshes to scene
        const land = new Land();
        const flower = new Flower(this);
        const lights = new BasicLights();
        const plate = new Plate();
        // this.add(land, flower, lights);
        this.add(lights);
        this.add(plate);

        const planeGeometry = new THREE.PlaneBufferGeometry(200, 150);
        // const planeMaterial = new THREE.MeshLambertMaterial(0x7ec022);
        var texture = new THREE.TextureLoader().load('https://lh5.googleusercontent.com/1XehE2sya1WA9hxERrobAgDjtwvzx1hVX3W11yF0B1Iq1BDzvCB1z72Sz2Gg4IClrwockBFnga_-gWSwumLupcxTi4AGDJYlHkckIU3yEQQ9PnMMNu535ejz57k3-bhNBiBUuHgC');
        const planeMaterial = new THREE.MeshLambertMaterial({
            map: texture
        });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.position.z = 0;
        // const plane = new THREE.Mesh(planeGeometry);
        plane.receiveShadow = true;
        plane.matrixAutoUpdate = false;
        this.add(plane);

        // Populate GUI
        this.state.gui.add(this.state, 'rotationSpeed', -5, 5);
    }

    addToUpdateList(object) {
        this.state.updateList.push(object);
    }

    update(timeStamp) {
        const { rotationSpeed, updateList } = this.state;
        this.rotation.y = (rotationSpeed * timeStamp) / 10000;

        // Call update for each object in the updateList
        for (const obj of updateList) {
            obj.update(timeStamp);
        }
    }
}

export default SeedScene;
