import React from "react";

export function ShowPasswordIcon({ className = "w-6 h-6 text-gray-600" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="32" height="32" fill="url(#pattern0)" />
      <defs>
        <pattern id="pattern0" patternContentUnits="objectBoundingBox" width="1" height="1">
          <use xlinkHref="#image0" transform="scale(0.0111111)" />
        </pattern>
        <image
          id="image0"
          width="90"
          height="90"
          preserveAspectRatio="none"
          xlinkHref="data:image/png;base64,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"
        />
      </defs>
    </svg>
  );
}

export function HidePasswordIcon({ className = "w-6 h-6 text-gray-600" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10 10 0 0 1 12 20C6 20 2 12 2 12a18.24 18.24 0 0 1 5.06-7.94M1 1l22 22" />
    </svg>
  );
}
