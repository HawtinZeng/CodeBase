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
import { ColorManagement } from "../math/ColorManagement.js";
import { Matrix3 } from "../math/Matrix3";
import { LinearTransfer, SRGBTransfer } from "../constants.js";
import { Vector3 } from "../math/Vector3";
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
const _m0 = /*@__PURE__*/ new Matrix3();
function getEncodingComponents(colorSpace: any) {
  // @ts-ignore
  ColorManagement._getMatrix(
    _m0,
    ColorManagement.workingColorSpace,
    colorSpace
  );

  const encodingMatrix = `mat3( ${_m0.elements.map((v) => v.toFixed(4))} )`;

  switch (ColorManagement.getTransfer(colorSpace)) {
    case LinearTransfer:
      return [encodingMatrix, "LinearTransferOETF"];

    case SRGBTransfer:
      return [encodingMatrix, "sRGBTransferOETF"];

    default:
      console.warn("THREE.WebGLProgram: Unsupported color space: ", colorSpace);
      return [encodingMatrix, "LinearTransferOETF"];
  }
}
function getTexelEncodingFunction(functionName: any, colorSpace: any) {
  const components = getEncodingComponents(colorSpace);

  return [
    `vec4 ${functionName}( vec4 value ) {`,

    `	return ${components[1]}( vec4( value.rgb * ${components[0]}, value.a ) );`,

    "}",
  ].join("\n");
}

const _v0 = /*@__PURE__*/ new Vector3();
function getLuminanceFunction() {
  // @ts-ignore
  ColorManagement.getLuminanceCoefficients(_v0);
  const r = _v0.x.toFixed(4);
  const g = _v0.y.toFixed(4);
  const b = _v0.z.toFixed(4);

  return [
    "float luminance( const in vec3 rgb ) {",

    `	const vec3 weights = vec3( ${r}, ${g}, ${b} );`,

    "	return dot( weights, rgb );",

    "}",
  ].join("\n");
} // Unroll Loops

const unrollLoopPattern =
  /#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;

function unrollLoops(string) {
  return string.replace(unrollLoopPattern, loopReplacer);
}

function loopReplacer(match, start, end, snippet) {
  let string = "";

  for (let i = parseInt(start); i < parseInt(end); i++) {
    string += snippet
      .replace(/\[\s*i\s*\]/g, "[ " + i + " ]")
      .replace(/UNROLLED_LOOP_INDEX/g, i);
  }

  return string;
}
function createWebGLShader(
  gl: WebGLRenderingContext,
  type: GLenum,
  string: string
) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, string);
  gl.compileShader(shader);

  return shader;
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
    lights: any,
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
      outputColorSpace: "srbg",
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
    vertexShader = unrollLoops(vertexShader);

    let fragmentShader = ShaderLib[material.type].fragment;
    fragmentShader = resolveIncludes(fragmentShader);
    fragmentShader = replaceLightNums(fragmentShader, parameters);
    fragmentShader = replaceClippingPlaneNums(fragmentShader, parameters);
    fragmentShader = unrollLoops(fragmentShader);

    const program = gl.createProgram();

    const prefixVertex = [
      `precision highp float;
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
    #define HIGH_PRECISION`,
      "uniform mat4 modelMatrix;",
      "uniform mat4 modelViewMatrix;",
      "uniform mat4 projectionMatrix;",
      "uniform mat4 viewMatrix;",
      "uniform mat3 normalMatrix;",
      "uniform vec3 cameraPosition;",
      "uniform bool isOrthographic;",
      "attribute vec3 position;",
      "attribute vec3 normal;",
      "attribute vec2 uv;",
    ].join("\n");

    const prefixFragment = [
      `precision highp float;
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
    #define HIGH_PRECISION`,
      "uniform mat4 viewMatrix;",
      "uniform vec3 cameraPosition;",
      "uniform bool isOrthographic;",
      ShaderChunk["colorspace_pars_fragment"],
      getTexelEncodingFunction(
        "linearToOutputTexel",
        parameters.outputColorSpace
      ),
      getLuminanceFunction(),
    ].join("\n");

    const vertexGlsl = prefixVertex + vertexShader;
    const fragmentGlsl = prefixFragment + fragmentShader;

    const glVertexShader = createWebGLShader(
      this.gl,
      this.gl.VERTEX_SHADER,
      vertexGlsl
    );
    const glFragmentShader = createWebGLShader(
      this.gl,
      this.gl.FRAGMENT_SHADER,
      fragmentGlsl
    );

    gl.attachShader(program, glVertexShader);
    gl.attachShader(program, glFragmentShader);

    gl.linkProgram(program);
  }
}

function onFirstUse(self) {
  // check for link errors
  if (renderer.debug.checkShaderErrors) {
    const programLog = gl.getProgramInfoLog(program).trim();
    const vertexLog = gl.getShaderInfoLog(glVertexShader).trim();
    const fragmentLog = gl.getShaderInfoLog(glFragmentShader).trim();

    let runnable = true;
    let haveDiagnostics = true;

    if (gl.getProgramParameter(program, gl.LINK_STATUS) === false) {
      runnable = false;

      if (typeof renderer.debug.onShaderError === "function") {
        renderer.debug.onShaderError(
          gl,
          program,
          glVertexShader,
          glFragmentShader
        );
      } else {
        // default error reporting

        const vertexErrors = getShaderErrors(gl, glVertexShader, "vertex");
        const fragmentErrors = getShaderErrors(
          gl,
          glFragmentShader,
          "fragment"
        );

        console.error(
          "THREE.WebGLProgram: Shader Error " +
            gl.getError() +
            " - " +
            "VALIDATE_STATUS " +
            gl.getProgramParameter(program, gl.VALIDATE_STATUS) +
            "\n\n" +
            "Material Name: " +
            self.name +
            "\n" +
            "Material Type: " +
            self.type +
            "\n\n" +
            "Program Info Log: " +
            programLog +
            "\n" +
            vertexErrors +
            "\n" +
            fragmentErrors
        );
      }
    } else if (programLog !== "") {
      console.warn("THREE.WebGLProgram: Program Info Log:", programLog);
    } else if (vertexLog === "" || fragmentLog === "") {
      haveDiagnostics = false;
    }

    if (haveDiagnostics) {
      self.diagnostics = {
        runnable: runnable,

        programLog: programLog,

        vertexShader: {
          log: vertexLog,
          prefix: prefixVertex,
        },

        fragmentShader: {
          log: fragmentLog,
          prefix: prefixFragment,
        },
      };
    }
  }
}
