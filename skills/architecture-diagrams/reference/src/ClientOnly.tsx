import {useEffect, useState, type ReactNode} from 'react'

/**
 * Defers rendering of its children until after mount. React Flow and ELK need
 * a real DOM, so the interactive canvas must not run during SSR. The server
 * (and the first client paint) shows `fallback` instead.
 */
export function ClientOnly({
  children,
  fallback = null,
}: {
  children: ReactNode
  fallback?: ReactNode
}): ReactNode {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  return mounted ? children : fallback
}
