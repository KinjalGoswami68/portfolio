import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import World from './scene/World'
import Character from './scene/Character'
import ProjectRing from './scene/ProjectRing'

// App only does layout: the 3D canvas now, the HTML overlay later.
export default function App() {
  return (
    // camera: up 6 units, back 10 units, 45 degree field of view
    // dpr caps pixel density at 1.5x so integrated graphics stays smooth
    <Canvas camera={{ position: [0, 6, 10], fov: 45 }} dpr={[1, 1.5]}>
      <World />
      <Character />
      <ProjectRing />

      {/* debug only (removed in part D): drag to orbit, scroll to zoom */}
      {/* target = the point the camera looks at (about chest height) */}
      <OrbitControls target={[0, 1, 0]} />
    </Canvas>
  )
}
