import { Fragment, useEffect, useState } from 'react'
import { footerLinks, resume } from '../data/content'

// The slim bar at the bottom of every view: GitHub · LinkedIn · X · Medium · Email · Resume.
export default function Footer() {
  const resumeExists = useResumeExists()

  return (
    <footer className="footer-bar">
      <nav aria-label="Links">
        {footerLinks.map((link) => (
          <Fragment key={link.label}>
            {link.external ? (
              <a href={link.url} target="_blank" rel="noopener noreferrer">
                {link.label}
                <span className="sr-only"> (opens in new tab)</span>
              </a>
            ) : (
              <a href={link.url}>{link.label}</a>
            )}
            <span className="footer-dot" aria-hidden="true">
              ·
            </span>
          </Fragment>
        ))}
        {resumeExists === true && <a href={resume.url}>{resume.label}</a>}
        {resumeExists === false && (
          <span className="todo">
            {resume.label} ({resume.missing})
          </span>
        )}
      </nav>
    </footer>
  )
}

// Asks the server if the resume pdf is really there (a HEAD request = headers only, no download).
// null while asking, then true or false.
function useResumeExists() {
  const [exists, setExists] = useState<boolean | null>(null)
  useEffect(() => {
    const controller = new AbortController()
    fetch(resume.url, { method: 'HEAD', signal: controller.signal })
      .then((response) => {
        // the dev server answers missing files with its html page, so also check it's a pdf
        const isPdf = (response.headers.get('content-type') ?? '').includes('pdf')
        setExists(response.ok && isPdf)
      })
      .catch(() => {
        if (!controller.signal.aborted) setExists(false)
      })
    return () => controller.abort()
  }, [])
  return exists
}
