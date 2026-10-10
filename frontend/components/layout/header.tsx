"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Menu, Activity, Sparkles, Terminal, CheckCircle2 } from "lucide-react";
import { Badge } from "../ui/badge";

const ROUTE_TITLES: Record<string, { title: string; subtitle: string }> = {
  "/": {
    title: "Executive Research Overview",
    subtitle: "Comparative machine learning benchmark and statistical evaluation on WDBC",
  },
  "/dataset": {
    title: "Dataset Explorer",
    subtitle: "Wisconsin Diagnostic Breast Cancer (WDBC) morphological fine-needle aspirate cohort",
  },
  "/comparison": {
    title: "Model Benchmark & Comparison",
    subtitle: "Random Forest vs SVM vs XGBoost via Stratified 5-Fold Cross-Validation",
  },
  "/confidence-intervals": {
    title: "Statistical Confidence Intervals",
    subtitle: "Held-out test performance bounds evaluated over 3,000 stratified bootstrap resamples",
  },
  "/tuning": {
    title: "Hyperparameter Optimization",
    subtitle: "GridSearchCV tuning with paired bootstrap difference tests on winning estimator",
  },
  "/explainability": {
    title: "SHAP Explainability Lab",
    subtitle: "Global Shapley attributions, top 10 influential features, and local patient cases",
  },
  "/prediction": {
    title: "Interactive Prediction Lab",
    subtitle: "Real-time 30-feature clinical simulation, risk probability estimation, and feature impact",
  },
  "/methodology": {
    title: "Research Methodology",
    subtitle: "Mathematical formulations, cross-validation protocol, and statistical standards",
  },
};

interface HeaderProps {
  onOpenMobile: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobile }) => {
  const pathname = usePathname();
  const current = ROUTE_TITLES[pathname] || {
    title: "Breast Cancer AI Research Lab",
    subtitle: "Advanced machine learning research platform",
  };

  return (
    <header className="sticky top-0 z-30 h-20 bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">
            {current.title}
          </h1>
          <p className="text-xs text-slate-500 hidden sm:block">
            {current.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
          <span>Vercel Deploy Ready</span>
        </div>

        <Badge variant="teal" size="md" className="gap-1.5 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>Research Prototype</span>
        </Badge>
      </div>
    </header>
  );
};
