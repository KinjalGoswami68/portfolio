import { useEffect, useRef } from 'react'
import { hero } from '../data/content'

type Props = {
  shown: boolean
  onBack: () => void
}

// What sits over the ring view for now: the "back to intro" link and the hero badge.
// (The badge opens the leash panel in part G. Until then it's just text.)
export default function RingHud({ shown, onBack }: Props) {
  const backRef = useRef<HTMLButtonElement>(null)
  const wasShown = useRef(shown)

  // after entering: put keyboard focus on the back link, so Tab continues from here
  useEffect(() => {
    if (shown && !wasShown.current) backRef.current?.focus()
    wasShown.current = shown
  }, [shown])

  return (
    <div className={`ring-hud ${shown ? '' : 'is-hidden'}`} inert={!shown}>
      {/* a button, not a link: it changes the view, it doesn't go to another page */}
      <button ref={backRef} type="button" className="back-link" onClick={onBack}>
        {hero.backLink}
      </button>
      <p className="hero-badge title-shimmer">{hero.badge}</p>
    </div>
  )
}
