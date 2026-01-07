import React from "react";

export function ShowPasswordIcon({ className = "w-6 h-6 text-gray-600" }) {
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
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
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
