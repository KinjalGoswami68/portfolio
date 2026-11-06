import { useEffect, useRef, type CSSProperties } from 'react'
import { intro } from '../data/content'

type Props = {
  shown: boolean
  onEnter: () => void
}

// The first screen: who she is on the left, the glowing Enter button at the bottom.
export default function Intro({ shown, onEnter }: Props) {
  const enterRef = useRef<HTMLButtonElement>(null)
  const wasShown = useRef(shown)

  // coming back from the ring: put keyboard focus on the Enter button
  useEffect(() => {
    if (shown && !wasShown.current) enterRef.current?.focus()
    wasShown.current = shown
  }, [shown])

  return (
    // inert = when hidden, nothing inside can be clicked, tabbed to, or read by a screen reader
    <section className={`intro ${shown ? '' : 'is-hidden'}`} inert={!shown} aria-label="Intro">
      <div className="intro-text">
        <p className="intro-small">{intro.smallLine}</p>
        <h1 className="title-shimmer intro-name">{intro.name}</h1>
        {intro.lines.map((line) => (
          <p key={line} className="intro-line">
            {line}
          </p>
        ))}
        <ul className="intro-facts">
          {intro.facts.map((fact, i) => (
            // --i tells the CSS which pill this is, so each pops in a little later
            <li key={fact} className="fact-pill" style={{ '--i': i } as CSSProperties}>
              {fact}
            </li>
          ))}
        </ul>
      </div>

      <button ref={enterRef} type="button" className="enter-button" onClick={onEnter}>
        {intro.button}
      </button>
    </section>
  )
}
