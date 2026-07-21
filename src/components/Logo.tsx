import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

/**
 * Nilai Harta Consultant Sdn Bhd Logo
 * Designed as a highly scalable and crisp inline SVG
 */
export function Logo({ className = "h-10", showText = true }: LogoProps) {
  if (!showText) {
    // Only the diamond and globe icon
    return (
      <svg
        className={className}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Diamond (Tilted grey square) */}
        <rect
          x="14.65"
          y="14.65"
          width="70.7"
          height="70.7"
          fill="#BEB5BE"
          transform="rotate(45 50 50)"
        />
        
        {/* Globe wireframe */}
        <g transform="rotate(-15 50 50)">
          {/* Outermost circle */}
          <circle
            cx="50"
            cy="50"
            r="38"
            fill="none"
            stroke="#0020B0"
            strokeWidth="4.5"
          />
          {/* Longitudes / vertical ellipses */}
          <ellipse
            cx="50"
            cy="50"
            rx="18"
            ry="38"
            fill="none"
            stroke="#0020B0"
            strokeWidth="3.5"
          />
          <ellipse
            cx="50"
            cy="50"
            rx="29"
            ry="38"
            fill="none"
            stroke="#0020B0"
            strokeWidth="2.5"
          />
          {/* Equator */}
          <line
            x1="12"
            y1="50"
            x2="88"
            y2="50"
            stroke="#0020B0"
            strokeWidth="4"
          />
          {/* Latitudes / horizontal ellipses */}
          <ellipse
            cx="50"
            cy="50"
            rx="38"
            ry="18"
            fill="none"
            stroke="#0020B0"
            strokeWidth="3.5"
          />
          <ellipse
            cx="50"
            cy="50"
            rx="38"
            ry="28"
            fill="none"
            stroke="#0020B0"
            strokeWidth="2"
          />
        </g>
      </svg>
    );
  }

  // Full brand representation
  return (
    <svg
      className={className}
      viewBox="0 0 500 450"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 1. Icon Part */}
      {/* Diamond (Tilted grey square) */}
      <rect
        x="175"
        y="105"
        width="150"
        height="150"
        fill="#BEB5BE"
        transform="rotate(45 250 180)"
      />
      
      {/* Globe wireframe */}
      <g transform="rotate(-15 250 180)">
        {/* Outermost circle */}
        <circle
          cx="250"
          cy="180"
          r="80"
          fill="none"
          stroke="#0020B0"
          strokeWidth="8"
        />
        {/* Longitudes / vertical ellipses */}
        <ellipse
          cx="250"
          cy="180"
          rx="38"
          ry="80"
          fill="none"
          stroke="#0020B0"
          strokeWidth="6"
        />
        <ellipse
          cx="250"
          cy="180"
          rx="62"
          ry="80"
          fill="none"
          stroke="#0020B0"
          strokeWidth="3"
        />
        {/* Equator */}
        <line
          x1="170"
          y1="180"
          x2="330"
          y2="180"
          stroke="#0020B0"
          strokeWidth="6.5"
        />
        {/* Latitudes / horizontal ellipses */}
        <ellipse
          cx="250"
          cy="180"
          rx="80"
          ry="38"
          fill="none"
          stroke="#0020B0"
          strokeWidth="6"
        />
        <ellipse
          cx="250"
          cy="180"
          rx="80"
          ry="58"
          fill="none"
          stroke="#0020B0"
          strokeWidth="3"
        />
      </g>

      {/* 2. Text Branding */}
      {/* "NILAI HARTA" text with bold outlines */}
      <text
        x="250"
        y="325"
        textAnchor="middle"
        fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
        fontWeight="900"
        fontSize="54"
        fill="#FFFFFF"
        stroke="#0020B0"
        strokeWidth="4.5"
        letterSpacing="2"
      >
        NILAI HARTA
      </text>

      {/* Solid blue background bar for "consultant sdn. bhd." */}
      <rect
        x="50"
        y="350"
        width="400"
        height="34"
        fill="#0020B0"
      />

      {/* White spaced out text "consultant sdn. bhd." inside the bar */}
      <text
        x="250"
        y="373"
        textAnchor="middle"
        fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
        fontWeight="bold"
        fontSize="17"
        fill="#FFFFFF"
        letterSpacing="5"
      >
        consultant sdn. bhd.
      </text>

      {/* Registration / License number right-aligned below the bar */}
      <text
        x="450"
        y="405"
        textAnchor="end"
        fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
        fontWeight="600"
        fontSize="13"
        fill="#64748B"
      >
        (564594-U)
      </text>
    </svg>
  );
}
