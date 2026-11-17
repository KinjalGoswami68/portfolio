import { Bloom, EffectComposer, Noise, ToneMapping, Vignette } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import { effects } from '../theme'
import { prefersReducedMotion } from '../reducedMotion'

// Post-processing: filters on the finished picture, applied in this order.
export default function Effects() {
  return (
    // multisampling 0 = no extra edge smoothing pass (saves a lot on integrated graphics)
    <EffectComposer multisampling={0}>
      {/* bloom: bright pixels get a soft glow around them */}
      <Bloom
        mipmapBlur // a fast, smooth blur
        luminanceThreshold={effects.bloomThreshold}
        luminanceSmoothing={0.2}
        intensity={effects.bloomIntensity}
        radius={effects.bloomRadius}
        resolutionScale={0.5} // blur a half-size picture: much cheaper, looks the same
      />
      {/* tone mapping: squeezes very bright colors back into what a screen can show.
          the composer switches the renderer's own one off, so it goes here */}
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      {/* film grain: faint moving noise. it flickers, so not with reduced motion */}
      <Noise premultiply opacity={prefersReducedMotion ? 0 : effects.grain} />
      {/* vignette: darker corners, like a camera lens */}
      <Vignette offset={0.3} darkness={effects.vignetteDarkness} />
    </EffectComposer>
  )
}
