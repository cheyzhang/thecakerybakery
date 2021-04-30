import * as THREE from 'three';
import { Group, Mesh, BoxBufferGeometry, MeshLambertMaterial } from 'three';

class Strawberry extends Group {
    constructor(x, y, z) {
        // Call parent Group() constructor
        super();

        this.name = 'strawberry';

        // const plate = THREE.Group();
        const main = new THREE.Mesh(
            new THREE.BoxBufferGeometry(15, 15, 1),
            // new THREE.MeshLambertMaterial(0x7ec022)
            new THREE.MeshLambertMaterial({color: 0xffb6c1})
        );
        main.position.z = x;
        main.position.y = y;
        main.position.x = z;
        main.castShadow = true;
        main.receiveShadow = true;
        this.add(main);
        return this;
    }
}

export default Strawberry;
