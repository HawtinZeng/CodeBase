import { Matrix4 } from "../math/Matrix4";
import { Object3D } from "../objects/object3D";
export declare class Camera extends Object3D {
    projectionMatrix: Matrix4;
    get matrixWorldInverse(): Matrix4;
}
