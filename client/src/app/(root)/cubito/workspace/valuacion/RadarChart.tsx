"use client";

interface RadarDataPoint {
    label: string;
    value: number; // 1-5
}

interface RadarChartProps {
    data: RadarDataPoint[];
}

/**
 * Splits a label into multiple lines, max ~18 chars per line.
 */
function splitLabel(label: string, maxChars = 18): string[] {
    const words = label.split(" ");
    const lines: string[] = [];
    let current = "";
    for (const word of words) {
        if (current && (current + " " + word).length > maxChars) {
            lines.push(current);
            current = word;
        } else {
            current = current ? current + " " + word : word;
        }
    }
    if (current) lines.push(current);
    return lines;
}

/**
 * Simple radar/spider chart using SVG.
 * No external dependencies — renders a polygon for the values and axis lines.
 */
export default function RadarChart({ data }: RadarChartProps) {
    const size = 300;
    const center = size / 2;
    const maxRadius = 80;
    const levels = 5;
    const angleStep = (2 * Math.PI) / data.length;

    // Get point coordinates for a given index and value (1-5)
    const getPoint = (index: number, value: number) => {
        const angle = angleStep * index - Math.PI / 2; // Start from top
        const radius = (value / levels) * maxRadius;
        return {
            x: center + radius * Math.cos(angle),
            y: center + radius * Math.sin(angle),
        };
    };

    // Background grid circles
    const gridCircles = Array.from({ length: levels }, (_, i) => {
        const r = ((i + 1) / levels) * maxRadius;
        return (
            <circle
                key={i}
                cx={center}
                cy={center}
                r={r}
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-gray-200 dark:text-slate-700"
            />
        );
    });

    // Axis lines
    const axes = data.map((_, i) => {
        const end = getPoint(i, levels);
        return (
            <line
                key={i}
                x1={center}
                y1={center}
                x2={end.x}
                y2={end.y}
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-gray-200 dark:text-slate-700"
            />
        );
    });

    // Data polygon
    const points = data.map((d, i) => getPoint(i, d.value));
    const polygonPoints = points.map((p) => `${p.x},${p.y}`).join(" ");

    // Labels with multiline support
    const labels = data.map((d, i) => {
        const labelPos = getPoint(i, levels + 1.8);
        const lines = splitLabel(d.label);
        const lineHeight = 11;
        const offsetY = -((lines.length - 1) * lineHeight) / 2;

        return (
            <text
                key={i}
                x={labelPos.x}
                y={labelPos.y + offsetY}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-[9px] fill-gray-600 dark:fill-gray-400"
            >
                {lines.map((line, li) => (
                    <tspan key={li} x={labelPos.x} dy={li === 0 ? 0 : lineHeight}>
                        {line}
                    </tspan>
                ))}
            </text>
        );
    });

    return (
        <div className="flex justify-center">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {gridCircles}
                {axes}
                <polygon
                    points={polygonPoints}
                    fill="rgba(249, 115, 22, 0.2)"
                    stroke="rgb(249, 115, 22)"
                    strokeWidth="2"
                />
                {points.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r="3" fill="rgb(249, 115, 22)" />
                ))}
                {labels}
            </svg>
        </div>
    );
}
