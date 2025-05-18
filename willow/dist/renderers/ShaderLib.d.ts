export declare enum MaterialType {
    MeshLambertMaterial = "MeshLambertMaterial"
}
export type ShaderInfo = {
    vertex: string;
    fragment: string;
    uniforms: any;
};
export declare const ShaderLib: {
    [key in MaterialType]: ShaderInfo;
};
