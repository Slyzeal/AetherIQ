"use client"

interface RiskMeterProps {
  score: number
  level: string
}

export default function RiskMeter({ score, level }: RiskMeterProps) {
  const colors: Record<string, string> = {
    Low: "#00d4a8",
    Moderate: "#f59e0b",
    High: "#f97316",
    Critical: "#ef4444",
  }
  const color = colors[level] || "#f59e0b"
  // Needle angle: -90 to +90 degrees based on score
  const angle = (score / 100) * 180 - 90
  const rad = (angle * Math.PI) / 180
  const needleX = 65 + 38 * Math.cos(rad - Math.PI / 2)
  const needleY = 65 + 38 * Math.sin(rad - Math.PI / 2)

  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg width="130" height="68" viewBox="0 0 130 68">
        <path d="M 15 65 A 50 50 0 0 1 115 65" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" strokeLinecap="round" />
        <path d="M 15 65 A 50 50 0 0 1 115 65" fill="none" stroke={color} strokeWidth="7" strokeLinecap="round"
          strokeDasharray={`${(score / 100) * 157} 157`} />
        <line x1="65" y1="65" x2={needleX} y2={needleY} stroke={color} strokeWidth="2" strokeLinecap="round" />
        <circle cx="65" cy="65" r="3.5" fill={color} />
      </svg>
      <p className="text-[14px] font-bold" style={{ color }}>{level} Risk</p>
    </div>
  )
}
