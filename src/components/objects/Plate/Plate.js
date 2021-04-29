import * as THREE from 'three';
import { Group, Mesh, BoxBufferGeometry, MeshLambertMaterial } from 'three';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
// import MODEL from './land.gltf';

class Plate extends Group {
    constructor() {
        // Call parent Group() constructor
        super();

        // const loader = new GLTFLoader();

        this.name = 'plate';

        // loader.load(MODEL, (gltf) => {
        //     this.add(gltf.scene);
        // });

        // const plate = THREE.Group();
        const main = new THREE.Mesh(
            new THREE.BoxBufferGeometry(1, 1, 1),
            new THREE.MeshLambertMaterial(0x7ec022)
        );
        main.position.z = 0;
        main.position.y = -30;
        main.position.x = -80;
        main.castShadow = true;
        main.receiveShadow = true;
        this.add(main);
        return this;
    }
}

export default Plate;
