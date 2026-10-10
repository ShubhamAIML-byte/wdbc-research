"use client";

import React, { useState } from "react";
import { HelpCircle } from "lucide-react";

interface TooltipInfoProps {
  term: string;
  explanation: string;
}

export const TooltipInfo: React.FC<TooltipInfoProps> = ({ term, explanation }) => {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-flex items-center group cursor-pointer ml-1">
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setOpen(!open)}
        className="text-slate-400 hover:text-teal-600 transition-colors focus:outline-none"
        aria-label={`Explanation of ${term}`}
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      {open && (
        <span
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2.5 bg-slate-900 text-slate-100 text-xs rounded-lg shadow-elevated border border-slate-700 pointer-events-none transition-all duration-150 animate-in fade-in zoom-in-95"
          role="tooltip"
        >
          <span className="font-semibold text-teal-300 block mb-1">{term}</span>
          <span className="text-slate-300 leading-snug">{explanation}</span>
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
        </span>
      )}
    </span>
  );
};
