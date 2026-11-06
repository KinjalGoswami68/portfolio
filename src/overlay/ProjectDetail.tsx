import { useEffect, useRef } from 'react'
import type { Project } from '../data/projects'
import { detailLabels } from '../data/content'

type Props = {
  project: Project | null // null = closed
  onClose: () => void
}

// The detail card for an open project. A native <dialog>: showModal() keeps Tab inside it,
// Esc closes it, and the browser puts focus back where it was when it closes.
export default function ProjectDetail({ project, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const cardRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (project && !dialog.open) {
      dialog.showModal()
      // focus the card itself (not the X), so arrow keys, Page Down and Space scroll it.
      // with focus on the X, Space would close the card instead
      cardRef.current?.focus()
    }
    if (!project && dialog.open) dialog.close()
  }, [project])

  return (
    <dialog
      ref={dialogRef}
      className="project-detail"
      aria-labelledby="project-detail-name"
      // Esc: the browser fires "cancel". we close through our own state instead
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      // the dialog fills the screen. a click that lands on it (not on the card) is "outside"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      {project && (
        // tabIndex -1: can receive focus from code (for keyboard scrolling), but isn't a Tab stop
        <article ref={cardRef} className="detail-card" tabIndex={-1}>
          <button type="button" className="detail-close" onClick={onClose} aria-label={detailLabels.close}>
            ×
          </button>

          <h2 id="project-detail-name" className="detail-name title-shimmer title-luminous">
            {project.name}
          </h2>
          {project.badge && <p className="detail-badge">{project.badge}</p>}

          <Section title={detailLabels.whatItIs} text={project.whatItIs} />
          {project.demo && <Section title={detailLabels.demo} text={project.demo} />}
          {project.tryIt && <Section title={detailLabels.tryIt} text={project.tryIt} />}
          {project.honestLimit && <Section title={detailLabels.honestLimit} text={project.honestLimit} />}

          {project.fieldNotes && (
            <section>
              <h3>{detailLabels.fieldNotes}</h3>
              <ul className="detail-notes">
                {project.fieldNotes.map((note) => (
                  <li key={note}>
                    <WithCode text={note} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {project.stack && (
            <section>
              <h3>{detailLabels.stack}</h3>
              <ul className="detail-stack">
                {project.stack.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          )}

          {project.team && <Section title={detailLabels.team} text={project.team} />}

          {project.links.length > 0 && (
            <div className="detail-links">
              {project.links.map((link) => (
                <a key={link.label} className="link-button" href={link.url} target="_blank" rel="noopener noreferrer">
                  {link.label}
                  <span className="sr-only"> (opens in new tab)</span>
                </a>
              ))}
            </div>
          )}
        </article>
      )}
    </dialog>
  )
}

function Section({ title, text }: { title: string; text: string }) {
  return (
    <section>
      <h3>{title}</h3>
      {/* a TODO is shown in the "missing content" style, so it can't be missed */}
      <p className={text.includes('TODO') ? 'todo' : undefined}>
        <WithCode text={text} />
      </p>
    </section>
  )
}

// Text from CONTENT.md can mark code with `backticks` (like `arkor dev`). Show those parts as code.
function WithCode({ text }: { text: string }) {
  const parts = text.split('`') // odd pieces were inside backticks
  return <>{parts.map((part, i) => (i % 2 === 1 ? <code key={i}>{part}</code> : part))}</>
}
