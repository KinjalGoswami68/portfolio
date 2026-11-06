import { socialLinks } from '../data/content'

// The row of links: github · linkedin · x · medium · email · resume.
// External links open in a new tab and say so to screen readers.
export default function SocialLinks() {
  return (
    <ul className="social-links">
      {socialLinks.map((link) => (
        <li key={link.label}>
          {link.todo ? (
            // not working yet: a visible TODO instead of a broken link
            <span className="todo">
              {link.label} ({link.todo})
            </span>
          ) : link.external ? (
            <a href={link.url} target="_blank" rel="noopener noreferrer">
              {link.label}
              <span className="sr-only"> (opens in new tab)</span>
            </a>
          ) : (
            <a href={link.url}>{link.label}</a>
          )}
        </li>
      ))}
    </ul>
  )
}
