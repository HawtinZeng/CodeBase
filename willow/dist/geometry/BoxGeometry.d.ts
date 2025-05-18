import { Geometry } from "./Geometry";
export declare class BoxGeometry extends Geometry {
    constructor(width: number, height: number, depth: number);
    getPlaneVertices(u: any, v: any, w: any, udir: any, vdir: any, width: any, height: any, depth: any, gridX: any, gridY: any, materialIndex: any): number[];
}
