"use client";

export function OrangeCubeIcon() {
  return (
    <svg
      width="100"
      height="100"
      viewBox="0 0 60 60"
      className="drop-shadow-lg"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Top face */}
      <polygon
        points="30,5 50,15 30,25 10,15"
        fill="#F6A054"
        stroke="#E67E2C"
        strokeWidth="1"
      />

      {/* Left face */}
      <polygon
        points="10,15 30,25 30,45 10,35"
        fill="#EA8C3E"
        stroke="#D46B1F"
        strokeWidth="1"
      />

      {/* Right face */}
      <polygon
        points="50,15 30,25 30,45 50,35"
        fill="#E67E2C"
        stroke="#C4601A"
        strokeWidth="1"
      />
    </svg>
  );
}
