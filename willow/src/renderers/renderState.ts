import { Camera } from "../camera/camera";
import { Scene } from "../scene/scene";

export class State {
  lightArray = [];
  shadowArray = [];
  constructor(public camera: Camera) {}
}

export class RenderState {
  stateMap: WeakMap<Scene, Array<State>>;
  set(scene: Scene, state: State) {
    let states = this.stateMap.get(scene);
    if (!states) {
      states = [];
      this.stateMap.set(scene, states);
    }

    states.push(state);
  }

  get(scene: Scene) {
    return this.stateMap.get(scene);
  }
}
