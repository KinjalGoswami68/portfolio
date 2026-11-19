import { useEffect, useRef } from 'react'
import { hero } from '../data/content'
import { projects } from '../data/projects'
import { sceneState } from '../sceneState'

type Props = {
  shown: boolean
  onBack: () => void
  onOpen: (index: number) => void
  hintShown: boolean // the "Scroll down for more" button
  onHint: () => void
}

// What sits over the ring view: the Back to intro link, the "Scroll down for more" hint,
// and one hidden button per panel so the keyboard can reach every project.
export default function RingHud({ shown, onBack, onOpen, hintShown, onHint }: Props) {
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

      {/* tells visitors there's more below the ring. a real button: click or Enter scrolls to the first chapter.
          when hidden it fades out and then leaves the Tab order (visibility: hidden, see .scroll-hint) */}
      <button type="button" className={`scroll-hint ${hintShown ? '' : 'is-hidden'}`} onClick={onHint}>
        {hero.scrollHint}
        <svg className="scroll-hint-arrow" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* keyboard path to the panels: invisible until focused. focusing one also "hovers" its panel */}
      <ul className="panel-buttons">
        {projects.map((project, i) => (
          <li key={project.id}>
            <button
              type="button"
              onClick={() => onOpen(i)}
              onFocus={() => {
                sceneState.hoveredIndex = i
              }}
              onBlur={() => {
                if (sceneState.hoveredIndex === i) sceneState.hoveredIndex = -1
              }}
            >
              {project.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
