import { Camera } from "../camera/camera";
import { Geometry } from "../geometry/Geometry";
import { Material } from "../materials/Basematerial";
import { Mesh } from "../objects/mesh";
import { Object3D } from "../objects/object3D";
import { Scene } from "../scene/scene";
import { WebGLClipping } from "./WebGLClipping";
export declare class WebGLRenderer {
    private currentState;
    private canvas;
    private gl;
    private static properties;
    private clipping;
    extensions: any;
    state: WebGLState;
    constructor(canvas: HTMLCanvasElement);
    render(scene: Scene, camera: Camera): void;
    renderObjects(scene: Scene, camera: Camera): void;
    renderObject(object: Mesh, camera: Camera, scene: Scene): void;
    getProgram(ca: Camera, scene: Scene, geo: Geometry, mat: Material, obj: Object3D): any;
    getParameters(material: Material, obj: Object3D, scn: Scene, lights: any, // TODO
    clipping: WebGLClipping): {
        shaderID: import("./ShaderLib").MaterialType;
        vertexColors: any;
        numDirLights: any;
        numPointLights: any;
        numSpotLights: any;
        numSpotLightMaps: any;
        numRectAreaLights: any;
        numHemiLights: any;
        numDirLightShadows: any;
        numPointLightShadows: any;
        numSpotLightShadows: any;
        numSpotLightShadowsWithMaps: any;
        numClippingPlanes: number;
        numClipIntersection: number;
    };
    getProgramCacheKey(material: Material): string;
    createProgram(material: Material): void;
}
