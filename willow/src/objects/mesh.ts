import { Geometry } from "../geometry/Geometry";
import { Material } from "../materials/Basematerial";
export class Mesh {
  constructor(public material: Material, public geometry: Geometry) {
  }
}
