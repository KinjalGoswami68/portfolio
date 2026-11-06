import { useEffect, useRef, useState, type ReactNode } from 'react'
import { chapters } from '../data/content'
import { projects } from '../data/projects'
import { prefersReducedMotion } from '../reducedMotion'

// The chapters below the ring. Each one slides in when it scrolls onto the screen.
export default function Chapters({ onOpen }: { onOpen: (index: number) => void }) {
  const { rightNow, wins, openSource, education, whoAmI, numbers, writing, contact } = chapters
  const openById = (id: string) => onOpen(projects.findIndex((project) => project.id === id))

  return (
    <div className="chapters">
      <Chapter title={rightNow.title}>
        <p className="chapter-role">{rightNow.role}</p>
        <p>{rightNow.text}</p>
      </Chapter>

      <Chapter title={wins.title}>
        <ul className="chapter-list">
          {wins.items.map((item) => (
            <li key={item.text}>
              {item.opens ? (
                // opens that project's panel
                <button type="button" className="win-button" onClick={() => openById(item.opens!)}>
                  {item.text}
                </button>
              ) : (
                item.text
              )}
            </li>
          ))}
        </ul>
      </Chapter>

      <Chapter title={openSource.title}>
        <ul className="chapter-list">
          {openSource.items.map((item) => (
            <li key={item.url}>
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                {item.text}
                <span className="sr-only"> (opens in new tab)</span>
              </a>
            </li>
          ))}
        </ul>
      </Chapter>

      <Chapter title={education.title}>
        {/* vertical timeline: a gold line with a dot per step */}
        <ol className="timeline">
          {education.items.map((item) => (
            <li key={item.years}>
              <span className="timeline-years">{item.years}</span>
              <span>{item.text}</span>
            </li>
          ))}
        </ol>
      </Chapter>

      <Chapter title={whoAmI.title}>
        <ul className="arrow-list">
          {whoAmI.lines.map((line) => (
            <li key={line}>
              <span className="arrow" aria-hidden="true">
                {'->'}
              </span>{' '}
              {line}
            </li>
          ))}
        </ul>
      </Chapter>

      <Chapter title={numbers.title}>
        <ul className="numbers">
          {numbers.items.map((item) => (
            <li key={item.label}>
              <CountUp value={item.value} />
              <span className="number-label">{item.label}</span>
            </li>
          ))}
        </ul>
      </Chapter>

      <Chapter title={writing.title}>
        <p>{writing.text}</p>
        <ul className="writing-links">
          {writing.links.map((link) => (
            <li key={link.label}>
              <a href={link.url} target="_blank" rel="noopener noreferrer">
                {link.label}
                <span className="sr-only"> (opens in new tab)</span>
              </a>
            </li>
          ))}
        </ul>
      </Chapter>

      <Chapter title={contact.title}>
        <p className="contact-line">{contact.line}</p>
        <a className="contact-email" href={`mailto:${contact.email}`}>
          {contact.email}
        </a>
      </Chapter>
    </div>
  )
}

// One chapter card. It gets "is-visible" the first time it scrolls onto the screen (CSS slides it in).
function Chapter({ title, children }: { title: string; children: ReactNode }) {
  const [ref, visible] = useSeenOnce<HTMLElement>()
  return (
    <section ref={ref} className={`chapter ${visible ? 'is-visible' : ''}`}>
      <h2 className="chapter-title title-shimmer">{title}</h2>
      {children}
    </section>
  )
}

// A number that counts up from 0 when it scrolls into view. "100+" counts to 100 and keeps the "+".
function CountUp({ value }: { value: string }) {
  const [ref, visible] = useSeenOnce<HTMLSpanElement>()
  const match = value.match(/^(\d+)(.*)$/) // number part + the rest ("+", "st")
  const target = match ? Number(match[1]) : 0
  const suffix = match ? match[2] : ''
  const hasNumber = match !== null // a plain true/false, safe to list in the effect's dependencies
  const [shown, setShown] = useState(prefersReducedMotion || !hasNumber ? target : 0)
  const frameRef = useRef(0) // the id of the next animation frame, so it can be cancelled

  useEffect(() => {
    if (!visible || prefersReducedMotion || !hasNumber) return
    const start = performance.now()
    const duration = 1200 // milliseconds
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - (1 - progress) ** 3 // fast first, slows at the end
      setShown(Math.round(target * eased))
      if (progress < 1) frameRef.current = requestAnimationFrame(tick)
    }
    frameRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameRef.current)
  }, [visible, target, hasNumber])

  return (
    <span ref={ref} className="number-value title-shimmer" aria-label={value}>
      {hasNumber ? `${shown}${suffix}` : value}
    </span>
  )
}

// IntersectionObserver: the browser tells us when an element comes onto the screen.
// Returns a ref to attach, and true once it has been seen (it stays true).
function useSeenOnce<T extends Element>() {
  const ref = useRef<T>(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const element = ref.current
    if (!element || seen) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setSeen(true)
      },
      { threshold: 0.25 }, // a quarter of it on screen
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [seen])
  return [ref, seen] as const
}
