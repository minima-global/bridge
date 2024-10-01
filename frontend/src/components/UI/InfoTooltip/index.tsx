import { useState, useRef, useEffect } from 'react'
import { InfoIcon } from 'lucide-react'

interface InfoTooltipProps {
  message: string
}

export default function InfoTooltip({ message }: InfoTooltipProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const iconRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node) &&
          iconRef.current && !iconRef.current.contains(event.target as Node)) {
        setShowTooltip(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="relative inline-block">
      <InfoIcon
        ref={iconRef}
        className="w-5 h-5 text-violet-500 cursor-help focus:outline-none"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setShowTooltip(!showTooltip)
          }
        }}
        aria-label="More information"
      />
      {showTooltip && (
        <div
          ref={tooltipRef}
          role="tooltip"
          className="absolute z-[9999] bg-neutral-100 dark:bg-[#1b1b1b] text-black dark:text-white shadow-neutral-300 dark:shadow-black w-64 p-2 px-4 text-sm bg-popover text-popover-foreground rounded-md shadow-md translate-y-[100%] right-[100%] bottom-full mb-2"
        >
          <div className="relative">
            <div className="absolute -bottom-1 left-1/2 -ml-1 w-2 h-2 bg-popover transform rotate-45" />
            {message}
          </div>
        </div>
      )}
    </div>
  )
}