import { useEffect, useRef } from 'react'
import { intro } from '../data/content'
import SocialLinks from './SocialLinks'

type Props = {
  shown: boolean
  onEnter: () => void
}

// The first screen: who she is on the left, the glowing enter button at the bottom.
export default function Intro({ shown, onEnter }: Props) {
  const enterRef = useRef<HTMLButtonElement>(null)
  const wasShown = useRef(shown)

  // coming back from the ring: put keyboard focus on the enter button
  useEffect(() => {
    if (shown && !wasShown.current) enterRef.current?.focus()
    wasShown.current = shown
  }, [shown])

  return (
    // inert = when hidden, nothing inside can be clicked, tabbed to, or read by a screen reader
    <section className={`intro ${shown ? '' : 'is-hidden'}`} inert={!shown} aria-label="intro">
      <div className="intro-text">
        <p className="intro-small">{intro.smallLine}</p>
        <h1 className="title-shimmer intro-name">{intro.name}</h1>
        <p className="intro-line">{intro.line}</p>
        <ul className="intro-facts">
          {intro.facts.map((fact) => (
            <li key={fact} className={fact.includes('TODO') ? 'todo' : undefined}>
              {fact}
            </li>
          ))}
        </ul>
        <SocialLinks />
      </div>

      <button ref={enterRef} type="button" className="enter-button" onClick={onEnter}>
        {intro.button}
      </button>
    </section>
  )
}
