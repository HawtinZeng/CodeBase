import { Camera } from "./camera";
export declare class OrthographicCamera extends Camera {
    left: number;
    right: number;
    top: number;
    bottom: number;
    near: number;
    far: number;
    zoom: number;
    constructor(left?: number, right?: number, top?: number, bottom?: number, near?: number, far?: number, zoom?: number);
    updateProjectionMatrix(): void;
}
