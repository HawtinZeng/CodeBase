import { MaterialType } from "../renderers/ShaderLib";
import { Material } from "./Basematerial";
export declare class MeshLambertMaterial extends Material {
    type: MaterialType;
    emissive: string;
    constructor(color: string);
}
