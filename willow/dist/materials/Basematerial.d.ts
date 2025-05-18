import { MaterialType } from "../renderers/ShaderLib";
export declare class Material {
    color: string;
    userData: Object;
    isMaterial: true;
    opacity: number;
    id: number;
    uuid: string;
    type: MaterialType;
    constructor(color?: string);
}
