import { Geometry } from "../geometry/Geometry";
import { Vector3 } from "../math/Vector3";
import { Material } from "../materials/Basematerial";
export declare class Model {
    geometry: Geometry;
    material: Material;
    position: Vector3;
    rotation: Vector3;
    scale: Vector3;
}
