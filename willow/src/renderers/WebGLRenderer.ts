import { Camera } from "../camera/camera";
import { Scene } from "../scene/scene";
import { createCanvasElement } from "../tool/element";
import { RenderState } from "./renderState";

type RenderParameters = { canvas: HTMLCanvasElement };

export class WebGLRenderer {
  private currentState: RenderState | undefined;
  private canvas: HTMLCanvasElement;
  private gl: WebGL2RenderingContext;
  constructor(params: RenderParameters) {
    const { canvas } = params;
    this.canvas = canvas;
    const context = canvas.getContext("webgl2");
    if (!context) {
      console.error(
        'canvas.getContext("webgl2") returns null, pls check the webgl2 compatibility'
      );
      return;
    }
    this.gl = context;
  }

  render(scene: Scene, camera: Camera) {
    // get all objects.
    // for each object, bind buffer and drawArray

    this.currentState = new RenderState();
    this.renderObjects(scene.meshes)
  }
  renderObjects(objects: any) {
    objects.forEach(item => {
      this.renderObject(item)
    })
  }
  renderObject(object: any) {

  }
}
