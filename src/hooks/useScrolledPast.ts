import { useEffect, useState } from 'react'

/**
 * True once the page has scrolled more than `offset` px from the top.
 *
 * Uses an IntersectionObserver against a throwaway sentinel rather than a
 * `scroll` listener: Lenis moves the page programmatically, so native scroll
 * events are not a dependable signal here.
 */
export function useScrolledPast(offset = 40) {
  const [past, setPast] = useState(false)

  useEffect(() => {
    const sentinel = document.createElement('div')
    sentinel.setAttribute('aria-hidden', 'true')
    Object.assign(sentinel.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '1px',
      height: `${offset}px`,
      pointerEvents: 'none',
      opacity: '0',
    })
    document.body.appendChild(sentinel)

    const observer = new IntersectionObserver(([entry]) => setPast(!entry.isIntersecting))
    observer.observe(sentinel)

    return () => {
      observer.disconnect()
      sentinel.remove()
    }
  }, [offset])

  return past
}
