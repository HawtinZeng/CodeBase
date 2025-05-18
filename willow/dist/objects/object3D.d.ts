import { Vector3 } from "../math/Vector3";
import { Matrix4 } from "../math/Matrix4";
import { Quaternion } from "../math/Quaternion";
export declare class Object3D {
    position: Vector3;
    scale: Vector3;
    quaternion: Quaternion;
    constructor();
    get matrix(): Matrix4;
    get matrixWorld(): Matrix4;
}
