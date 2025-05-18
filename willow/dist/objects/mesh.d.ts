import { Geometry } from "../geometry/Geometry";
import { Material } from "../materials/Basematerial";
import { Object3D } from "./object3D";
export declare class Mesh extends Object3D {
    material: Material;
    geometry: Geometry;
    constructor(material: Material, geometry: Geometry);
}
