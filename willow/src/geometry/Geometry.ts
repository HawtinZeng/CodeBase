import { Attribute } from "./Attribute";
type AttributeName = "position";
export class Geometry {
  position: Attribute;

  setAttribute(name: AttributeName, attri: Attribute) {
    this[name] = attri;
  }
}
