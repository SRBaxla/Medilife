export default function LoadingSpinner({ size = 'md', color = 'primary' }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' }
  const colors = {
    primary: 'border-primary border-t-transparent',
    white: 'border-white border-t-transparent',
    teal: 'border-clinical-teal border-t-transparent',
  }
  return (
    <div className="flex items-center justify-center p-4">
      <div className={`${sizes[size]} rounded-full border-2 ${colors[color]} animate-spin`} />
    </div>
  )
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`rounded-2xl border border-outline-variant/30 overflow-hidden ${className}`}>
      <div className="shimmer h-full w-full min-h-[140px]" />
    </div>
  )
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`shimmer h-4 rounded-full ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}
        />
      ))}
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 bg-surface flex flex-col items-center justify-center z-50 gap-4">
      <div className="w-12 h-12 rounded-full border-3 border-primary border-t-transparent animate-spin" />
      <p className="text-on-surface-variant font-label-md text-label-md animate-pulse">Loading…</p>
    </div>
  )
}
