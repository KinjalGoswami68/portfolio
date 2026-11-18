import { Fragment } from 'react'
import { copyright, footerLinks, resume } from '../data/content'

// The slim bar at the bottom of every view: GitHub · LinkedIn · X · Medium · Email · Resume.
export default function Footer() {
  // decided when the site was built (vite.config.ts), so it shows straight away on any connection
  const resumeExists = __RESUME_EXISTS__

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
        {resumeExists && <a href={resume.url}>{resume.label}</a>}
        {!resumeExists && (
          <span className="todo">
            {resume.label} ({resume.missing})
          </span>
        )}
      </nav>
      <p className="footer-copyright">{copyright}</p>
    </footer>
  )
}
