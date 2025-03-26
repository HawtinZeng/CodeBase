import { Material } from "./Basematerial";
import { Texture } from 'three'

export class MeshLambertMaterial extends Material {
  alphaMap: Texture;
  emissive: string = '#ffffff';
  constructor(color: string) {
    super(color);
    this.type = 'MeshLambertMaterial'
  }
}
