import { useCallback } from "react";
import "./App.css";
import { BoxGeometry, Scene } from "willow";
import { Material } from "willow/materials/Basematerial";
import { Mesh } from "willow/objects/mesh";

function App() {
  const containerRef = useCallback((cvs: any) => {
    /**
     * Target:
     *    const scene = new Scene
     *    const geo = new BoxGeometry()
     *    const material = new BaseMaterial({color: '#ff0000'})
     *    const mesh = new Mesh(geo, material)
     *    scene.add(mesh)
     *    const renderer = new WebGlRenderer()
     *    const camer = new PerspectiveCamera()
     *    renderer.render(scene, camera)
     */
    // const scene = new Scene
    const scene = new Scene();
    const geo = new BoxGeometry(1, 1, 1);
    const material = new Material("#ff0000");
    const mesh = new Mesh(material, geo);
    scene.add(mesh);
  }, []);
  return (
    <>
      <h3>Plaster scene</h3>
      <canvas
        style={{ border: "2px solid rgb(60, 60, 60)" }}
        height={700}
        width={700}
        ref={containerRef}
      />
    </>
  );
}

export default App;
