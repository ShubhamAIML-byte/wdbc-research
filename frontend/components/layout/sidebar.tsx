"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Database,
  GitCompare,
  TrendingUp,
  Sliders,
  Sparkles,
  FlaskConical,
  BookOpen,
  Activity,
  Layers,
  X,
} from "lucide-react";
import clsx from "clsx";
import { Badge } from "../ui/badge";

const NAV_ITEMS = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Dataset Explorer", href: "/dataset", icon: Database },
  { name: "Model Comparison", href: "/comparison", icon: GitCompare },
  { name: "Confidence Intervals", href: "/confidence-intervals", icon: TrendingUp },
  { name: "Hyperparameter Tuning", href: "/tuning", icon: Sliders },
  { name: "SHAP Explainability", href: "/explainability", icon: Sparkles },
  { name: "Prediction Lab", href: "/prediction", icon: FlaskConical },
  { name: "Research Methodology", href: "/methodology", icon: BookOpen },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={clsx(
          "fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-sm",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="h-20 px-6 border-b border-slate-100 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group" onClick={onCloseMobile}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-900 via-teal-800 to-teal-600 flex items-center justify-center text-white shadow-card group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5 text-teal-200" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 text-sm tracking-tight leading-tight">
                  WDBC Research
                </span>
                <span className="text-[10px] uppercase font-bold text-teal-600 tracking-wider px-1.5 py-0.2 bg-teal-50 border border-teal-200 rounded">
                  v2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Oncology ML Lab</p>
            </div>
          </Link>

          {/* Close button for mobile */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prototype status badge */}
        <div className="px-5 py-3 bg-slate-50/70 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">Pipeline Status</span>
            <Badge variant="success" size="sm" className="gap-1 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Verified (3k CIs)
            </Badge>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={clsx(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group",
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                )}
              >
                <Icon
                  className={clsx(
                    "w-4 h-4 transition-colors",
                    isActive
                      ? "text-teal-400"
                      : "text-slate-400 group-hover:text-teal-600"
                  )}
                />
                <span className="truncate">{item.name}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/60">
          <div className="rounded-lg p-3 bg-white border border-slate-200 text-xs">
            <div className="flex items-center gap-2 mb-1">
              <Layers className="w-3.5 h-3.5 text-teal-600" />
              <span className="font-semibold text-slate-800">Winning Model</span>
            </div>
            <p className="text-[11px] text-slate-600 font-medium">
              SVM (RBF Kernel) Tuned
            </p>
            <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
              <span>Test ROC-AUC</span>
              <span className="font-bold text-teal-700">0.9974</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
