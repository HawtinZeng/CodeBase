import { Camera } from "../camera/camera";
import { Geometry } from "../geometry/Geometry";
import { Material } from "../materials/Basematerial";
import { Mesh } from "../objects/mesh";
import { Object3D } from "../objects/object3D";
import { Scene } from "../scene/scene";
import { RenderState } from "./renderState";
import { ShaderLib } from "./ShaderLib";
import { WebGLProperties } from "./WebGLProperties";
import { ShaderChunk } from "./shaders/ShaderChunk.js";
import { WebGLClipping } from "./WebGLClipping";
import { WebGLExtensions } from "./WebGLExtensions";
import { WebGLState } from "./WebGLState";
import { WebGLRenderState } from "./WebGLRenderStates";
const includePattern = /^[ \t]*#include +<([\w\d./]+)>/gm;
function includeReplacer(match: RegExp, include: string) {
  let string = (ShaderChunk as any)[include];

  if (string === undefined) {
    throw new Error("Can not resolve #include <" + include + ">");
  }

  return resolveIncludes(string);
}

function replaceLightNums(string, parameters) {
  const numSpotLightCoords =
    parameters.numSpotLightShadows +
    parameters.numSpotLightMaps -
    parameters.numSpotLightShadowsWithMaps;

  return string
    .replace(/NUM_DIR_LIGHTS/g, parameters.numDirLights)
    .replace(/NUM_SPOT_LIGHTS/g, parameters.numSpotLights)
    .replace(/NUM_SPOT_LIGHT_MAPS/g, parameters.numSpotLightMaps)
    .replace(/NUM_SPOT_LIGHT_COORDS/g, numSpotLightCoords)
    .replace(/NUM_RECT_AREA_LIGHTS/g, parameters.numRectAreaLights)
    .replace(/NUM_POINT_LIGHTS/g, parameters.numPointLights)
    .replace(/NUM_HEMI_LIGHTS/g, parameters.numHemiLights)
    .replace(/NUM_DIR_LIGHT_SHADOWS/g, parameters.numDirLightShadows)
    .replace(
      /NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,
      parameters.numSpotLightShadowsWithMaps
    )
    .replace(/NUM_SPOT_LIGHT_SHADOWS/g, parameters.numSpotLightShadows)
    .replace(/NUM_POINT_LIGHT_SHADOWS/g, parameters.numPointLightShadows);
}
function replaceClippingPlaneNums(string, parameters) {
  return string
    .replace(/NUM_CLIPPING_PLANES/g, parameters.numClippingPlanes)
    .replace(
      /UNION_CLIPPING_PLANES/g,
      parameters.numClippingPlanes - parameters.numClipIntersection
    );
}

function resolveIncludes(string: string) {
  return string.replace(includePattern, includeReplacer as any);
}
export class WebGLRenderer {
  private currentState: RenderState | undefined;
  private canvas: HTMLCanvasElement;
  private gl!: WebGL2RenderingContext;
  private static properties: WebGLProperties = new WebGLProperties();
  private clipping: WebGLClipping = new WebGLClipping();
  extensions: any;
  state: any;
  renderState: any;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext("webgl2");
    if (!context) {
      console.error(
        'canvas.getContext("webgl2") returns null, pls check the webgl2 compatibility'
      );
      return;
    }
    this.gl = context;
    this.extensions = new (WebGLExtensions(this.gl) as any)();
    this.extensions.init();

    this.state = new (WebGLState(this.gl, this.extensions) as any)();
    this.renderState = new (WebGLRenderState(this.extensions) as any)();
  }

  render(scene: Scene, camera: Camera) {
    // get all objects.
    // for each object, bind buffer and drawArray
    this.renderObjects(scene, camera);
  }
  renderObjects(scene: Scene, camera: Camera) {
    scene.meshes.forEach((item: any) => {
      this.renderObject(item, camera, scene);
    });
  }
  renderObject(object: Mesh, camera: Camera, scene: Scene) {
    const geo = object.geometry;
    const mat = object.material;

    const program = this.getProgram(camera, scene, geo, mat, object);
  }

  getProgram(
    ca: Camera,
    scene: Scene,
    geo: Geometry,
    mat: Material,
    obj: Object3D
  ) {
    const programCacheKey = this.getProgramCacheKey(mat);

    const materialPros = WebGLRenderer.properties.get(mat);
    let programs = materialPros.programs;
    if (!programs) {
      programs = new Map();
      materialPros.programs = programs;
    }

    let pro = programs.get(programCacheKey);
    if (!pro) {
      const parameters = this.getParameters(
        mat,
        obj,
        scene,
        this.renderState.state.lights,
        this.clipping
      );
      pro = this.createProgram(mat, parameters);
      programs.set(programCacheKey, pro);
    }
    return pro;
  }

  getParameters(
    material: Material,
    obj: Object3D,
    scn: Scene,
    lights: any, // TODO
    clipping: WebGLClipping
  ) {
    // const geometry = obj.geometry;
    const HAS_AOMAP = !!material.aoMap;
    return {
      shaderID: material.type,
      vertexColors: material.vertexColors,
      numDirLights: lights.directional.length,
      numPointLights: lights.point.length,
      numSpotLights: lights.spot.length,
      numSpotLightMaps: lights.spotLightMap.length,
      numRectAreaLights: lights.rectArea.length,
      numHemiLights: lights.hemi.length,

      numDirLightShadows: lights.directionalShadowMap.length,
      numPointLightShadows: lights.pointShadowMap.length,
      numSpotLightShadows: lights.spotShadowMap.length,
      numSpotLightShadowsWithMaps: lights.numSpotLightShadowsWithMaps,
      numClippingPlanes: clipping.numPlanes,
      numClipIntersection: clipping.numIntersection,
    };
  }
  getProgramCacheKey(material: Material) {
    const color = material.color;
    const opacity = material.opacity;
    return `color: ${color}; opacity: ${opacity}`;
  }

  createProgram(material: Material, parameters: any) {
    const gl = this.gl;
    let vertexShader = ShaderLib[material.type].vertex;
    vertexShader = resolveIncludes(vertexShader);
    vertexShader = replaceLightNums(vertexShader, parameters);
    vertexShader = replaceClippingPlaneNums(vertexShader, parameters);
    const program = gl.createProgram();

    const prefixVertex = `precision highp float;
    precision highp int;
    precision highp sampler2D;
    precision highp samplerCube;
    precision highp sampler3D;
    precision highp sampler2DArray;
    precision highp sampler2DShadow;
    precision highp samplerCubeShadow;
    precision highp sampler2DArrayShadow;
    precision highp isampler2D;
    precision highp isampler3D;
    precision highp isamplerCube;
    precision highp isampler2DArray;
    precision highp usampler2D;
    precision highp usampler3D;
    precision highp usamplerCube;
    precision highp usampler2DArray;
    #define HIGH_PRECISION`;
  }
}
