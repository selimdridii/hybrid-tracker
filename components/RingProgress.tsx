interface Props {
  value: number;
  max: number;
  size?: number;
  color?: string;
  label?: string;
  sublabel?: string;
}

export default function RingProgress({
  value,
  max,
  size = 80,
  color = "#a3ff47",
  label,
  sublabel,
}: Props) {
  const pct = Math.min(value / max, 1);
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#222"
          strokeWidth={6}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={pct >= 1 ? "#a3ff47" : color}
          strokeWidth={6}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.5s ease" }}
        />
      </svg>
      {label && (
        <div className="text-center" style={{ marginTop: -4 }}>
          <div className="text-sm font-bold text-white">{label}</div>
          {sublabel && <div className="text-xs text-neutral-500">{sublabel}</div>}
        </div>
      )}
    </div>
  );
}
