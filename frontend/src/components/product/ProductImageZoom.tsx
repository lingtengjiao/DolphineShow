import { useCallback, useEffect, useRef, useState } from 'react'

const ZOOM_FACTOR = 2.5
const LENS_RATIO = 0.38

interface Props {
  src: string
  alt: string
}

export default function ProductImageZoom({ src, alt }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)
  const [canZoom, setCanZoom] = useState(false)
  const [paneSize, setPaneSize] = useState(0)
  const [lens, setLens] = useState({ left: 0, top: 0, size: 0 })
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const update = () => setCanZoom(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const measure = () => setPaneSize(el.clientWidth)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [src])

  const handleMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!canZoom) return
      const el = containerRef.current
      if (!el) return

      const rect = el.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const lensSize = Math.min(rect.width, rect.height) * LENS_RATIO

      let left = x - lensSize / 2
      let top = y - lensSize / 2
      left = Math.max(0, Math.min(left, rect.width - lensSize))
      top = Math.max(0, Math.min(top, rect.height - lensSize))

      const cx = left + lensSize / 2
      const cy = top + lensSize / 2
      const ratioX = cx / rect.width
      const ratioY = cy / rect.height

      const imgW = rect.width * ZOOM_FACTOR
      const imgH = rect.height * ZOOM_FACTOR

      setLens({ left, top, size: lensSize })
      setOffset({
        x: -ratioX * imgW + rect.width / 2,
        y: -ratioY * imgH + rect.height / 2,
      })
    },
    [canZoom],
  )

  const handleLeave = () => {
    setActive(false)
  }

  return (
    <div className="relative w-full">
      <div
        ref={containerRef}
        className={`relative w-full aspect-square overflow-hidden ${canZoom ? 'lg:cursor-crosshair' : ''}`}
        onMouseEnter={() => canZoom && setActive(true)}
        onMouseLeave={handleLeave}
        onMouseMove={handleMove}
      >
        <img
          src={src}
          alt={alt}
          draggable={false}
          className="w-full h-full object-contain p-4 select-none pointer-events-none"
        />
        {active && canZoom && (
          <div
            className="absolute hidden lg:block border-2 border-brand/70 bg-white/25 pointer-events-none shadow-sm"
            style={{
              left: lens.left,
              top: lens.top,
              width: lens.size,
              height: lens.size,
            }}
            aria-hidden
          />
        )}
      </div>

      {canZoom && paneSize > 0 && (
        <div
          className={`absolute top-0 z-20 hidden lg:block bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden transition-opacity duration-150 ${
            active ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          style={{
            left: paneSize + 16,
            width: paneSize,
            height: paneSize,
          }}
          aria-hidden={!active}
        >
          <img
            src={src}
            alt=""
            draggable={false}
            className="absolute max-w-none object-contain select-none"
            style={{
              width: paneSize * ZOOM_FACTOR,
              height: paneSize * ZOOM_FACTOR,
              left: offset.x,
              top: offset.y,
            }}
          />
        </div>
      )}
    </div>
  )
}
