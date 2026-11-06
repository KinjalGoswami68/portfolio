import { useEffect, useRef } from 'react'
import { hero } from '../data/content'
import { projects } from '../data/projects'
import { sceneState } from '../sceneState'

type Props = {
  shown: boolean
  onBack: () => void
  onOpen: (index: number) => void
}

// What sits over the ring view: the Back to intro link,
// and one hidden button per panel so the keyboard can reach every project.
export default function RingHud({ shown, onBack, onOpen }: Props) {
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
