import React from "react";
import { AlertTriangle, ShieldCheck } from "lucide-react";

export const DisclaimerBanner: React.FC<{ compact?: boolean }> = ({ compact }) => {
  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span>
          <strong>Research Prototype:</strong> Strictly for educational & algorithmic evaluation. Not a diagnostic tool.
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-amber-50/70 border border-amber-200/90 p-4 mb-6 text-amber-900 flex items-start gap-3 shadow-subtle">
      <div className="p-2 rounded-lg bg-amber-100 text-amber-800 shrink-0 mt-0.5">
        <AlertTriangle className="w-4 h-4" />
      </div>
      <div className="text-xs leading-relaxed">
        <strong className="font-semibold block text-sm text-amber-950 mb-0.5">
          Medical & Clinical Research Disclaimer
        </strong>
        This platform is an academic research demonstration comparing statistical machine learning models (Random Forest, SVM, and XGBoost) on the Wisconsin Diagnostic Breast Cancer (WDBC) dataset. It does not constitute medical advice, clinical diagnosis, or patient care recommendation. Any medical decision must be made by qualified healthcare professionals using certified clinical diagnostic procedures.
      </div>
    </div>
  );
};
