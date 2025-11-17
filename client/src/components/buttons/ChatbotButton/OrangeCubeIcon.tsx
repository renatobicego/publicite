"use client";

export function OrangeCubeIcon() {
  return (
    <svg
      width="60"
      height="60"
      viewBox="0 0 60 60"
      className="drop-shadow-lg"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Back face (lighter orange) */}
      <polygon
        points="30,10 50,20 50,40 30,30"
        fill="#EA8C3E"
        stroke="#E67E2C"
        strokeWidth="1"
      />

      {/* Left face (medium orange) */}
      <polygon
        points="30,10 30,30 10,40 10,20"
        fill="#F59A4E"
        stroke="#E67E2C"
        strokeWidth="1"
      />

      {/* Right face (darker orange) */}
      <polygon
        points="50,20 30,30 30,50 50,40"
        fill="#E67E2C"
        stroke="#D46B1F"
        strokeWidth="1"
      />

      {/* Top vertex highlight */}
      <circle cx="30" cy="10" r="3" fill="#FFB85C" opacity="0.8" />
    </svg>
  );
}
