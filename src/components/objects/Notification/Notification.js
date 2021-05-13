import * as THREE from 'three';
import { Group } from 'three';
const a = 4;

class Notification extends Group {
    constructor(image, x, y, width, height) {
        // Call parent Group() constructor
        super();

        this.state = {
            startTime: undefined
        };

        this.type = 'notification';

        const map = new THREE.TextureLoader().load(image);
        map.minfilter = THREE.LinearMipMapLinearFilter;
        map.magFilter = THREE.NearestFilter;
        const material = new THREE.SpriteMaterial({ map: map });
        material.opacity = 0.9;
        const sprite = new THREE.Sprite(material);
        // 336 x 207
        sprite.scale.set(width * 0.1, width * 0.1, 1);
        sprite.position.x = x;
        sprite.position.y = y;
        sprite.position.z = 0;
        sprite.type = "notification";
        this.add(sprite);
        return this;
    }
    update(timeStamp, stepSize, width) {
        if (!this.state.startTime) {
            this.state.startTime = timeStamp;
        }
        const time = (timeStamp - this.state.startTime) / 1000;
        if (this.children[0].material.opacity < 0.04) {
            this.state.startTime = undefined;
            return 1;
        }
        this.children[0].material.opacity = 1 - (Math.pow(2, a * 0.75 * time) - 1)/(Math.pow(2, a) - 1);
        return 0;
    }
}

export default Notification;
