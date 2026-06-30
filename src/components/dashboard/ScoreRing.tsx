"use client"

interface ScoreRingProps {
  score: number
  size?: number
  strokeWidth?: number
  label?: string
  sublabel?: string
  color?: string
  secondaryColor?: string
}

export default function ScoreRing({
  score,
  size = 110,
  strokeWidth = 9,
  label,
  sublabel,
  color = "#00d4a8",
  secondaryColor,
}: ScoreRingProps) {
  const r = (size - strokeWidth) / 2
  const circ = r * 2 * Math.PI
  const cx = size / 2
  const cy = size / 2

  // Dual arc: secondary fills first half, primary fills score portion of second half
  const primaryOffset = score / 100 * circ * 0.78 // ~78% of ring for score
  const secondaryLen = circ * 0.50

  return (
    <div className="flex flex-col items-center gap-2">
      <div style={{ width: size, height: size, position: "relative" }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Track */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
          {/* Secondary arc (purple) - top half */}
          {secondaryColor && (
            <circle
              cx={cx} cy={cy} r={r} fill="none"
              stroke={secondaryColor} strokeWidth={strokeWidth}
              strokeDasharray={`${secondaryLen} ${circ - secondaryLen}`}
              strokeDashoffset={0}
              strokeLinecap="round"
              transform={`rotate(-90 ${cx} ${cy})`}
            />
          )}
          {/* Primary arc (green) */}
          <circle
            cx={cx} cy={cy} r={r} fill="none"
            stroke={color} strokeWidth={strokeWidth}
            strokeDasharray={`${primaryOffset} ${circ - primaryOffset}`}
            strokeDashoffset={secondaryColor ? -secondaryLen : 0}
            strokeLinecap="round"
            transform={`rotate(-90 ${cx} ${cy})`}
          />
          {/* Score text */}
          <text x={cx} y={cy - 6} textAnchor="middle" fill="white"
            fontSize={size * 0.22} fontWeight="800" fontFamily="-apple-system,sans-serif">
            {score}
          </text>
          <text x={cx} y={cy + 10} textAnchor="middle" fill="rgba(255,255,255,0.3)"
            fontSize={size * 0.1} fontFamily="-apple-system,sans-serif">
            /100
          </text>
        </svg>
      </div>
      {label && <p className="text-[13px] font-bold" style={{ color }}>{label}</p>}
      {sublabel && <p className="text-[11px] text-white/30 text-center leading-[1.4] max-w-[120px]">{sublabel}</p>}
    </div>
  )
}
