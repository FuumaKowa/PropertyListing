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
        viewBox="0 0 240 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Diamond (Tilted grey square) */}
        <rect
          x="65"
          y="65"
          width="110"
          height="110"
          fill="#B2B4B6"
          transform="rotate(45 120 120)"
        />
        
        {/* Globe wireframe */}
        <g transform="rotate(-15 120 120)">
          {/* Outermost circle */}
          <circle
            cx="120"
            cy="120"
            r="55"
            fill="none"
            stroke="#0031B0"
            strokeWidth="5"
          />
          {/* Longitudes / vertical ellipses */}
          <ellipse
            cx="120"
            cy="120"
            rx="25"
            ry="55"
            fill="none"
            stroke="#0031B0"
            strokeWidth="3.5"
          />
          <ellipse
            cx="120"
            cy="120"
            rx="42"
            ry="55"
            fill="none"
            stroke="#0031B0"
            strokeWidth="2.5"
          />
          {/* Equator */}
          <line
            x1="65"
            y1="120"
            x2="175"
            y2="120"
            stroke="#0031B0"
            strokeWidth="4"
          />
          {/* Latitudes / horizontal ellipses */}
          <ellipse
            cx="120"
            cy="120"
            rx="55"
            ry="25"
            fill="none"
            stroke="#0031B0"
            strokeWidth="3.5"
          />
          <ellipse
            cx="120"
            cy="120"
            rx="55"
            ry="40"
            fill="none"
            stroke="#0031B0"
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
        fill="#B2B4B6"
        transform="rotate(45 250 180)"
      />
      
      {/* Globe wireframe */}
      <g transform="rotate(-15 250 180)">
        {/* Outermost circle */}
        <circle
          cx="250"
          cy="180"
          r="75"
          fill="none"
          stroke="#0031B0"
          strokeWidth="7"
        />
        {/* Longitudes / vertical ellipses */}
        <ellipse
          cx="250"
          cy="180"
          rx="35"
          ry="75"
          fill="none"
          stroke="#0031B0"
          strokeWidth="5"
        />
        <ellipse
          cx="250"
          cy="180"
          rx="58"
          ry="75"
          fill="none"
          stroke="#0031B0"
          strokeWidth="3"
        />
        {/* Equator */}
        <line
          x1="175"
          y1="180"
          x2="325"
          y2="180"
          stroke="#0031B0"
          strokeWidth="6"
        />
        {/* Latitudes / horizontal ellipses */}
        <ellipse
          cx="250"
          cy="180"
          rx="75"
          ry="35"
          fill="none"
          stroke="#0031B0"
          strokeWidth="5"
        />
        <ellipse
          cx="250"
          cy="180"
          rx="75"
          ry="55"
          fill="none"
          stroke="#0031B0"
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
        stroke="#0031B0"
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
        fill="#0031B0"
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
