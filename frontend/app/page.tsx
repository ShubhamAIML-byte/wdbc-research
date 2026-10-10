"use client";

import React from "react";
import Link from "next/link";
import {
  Activity,
  Layers,
  Database,
  Award,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Sliders,
  FlaskConical,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { researchData, formatMetricName } from "@/lib/research-data";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DisclaimerBanner } from "@/components/ui/disclaimer-banner";
import { TooltipInfo } from "@/components/ui/tooltip-info";

export default function OverviewPage() {
  const winner = researchData.winning_model;
  const winnerTest = researchData.test_evaluations[winner]?.metrics;
  const tunedMetrics = researchData.tuning.tuned_test_metrics;

  // Data for model comparison chart
  const comparisonChartData = [
    {
      metric: "ROC-AUC",
      "Random Forest": researchData.cv_results["Random Forest"].roc_auc.mean,
      "SVM (RBF)": researchData.cv_results["Support Vector Machine"].roc_auc.mean,
      XGBoost: researchData.cv_results["XGBoost"].roc_auc.mean,
    },
    {
      metric: "Accuracy",
      "Random Forest": researchData.cv_results["Random Forest"].accuracy.mean,
      "SVM (RBF)": researchData.cv_results["Support Vector Machine"].accuracy.mean,
      XGBoost: researchData.cv_results["XGBoost"].accuracy.mean,
    },
    {
      metric: "F1-Score",
      "Random Forest": researchData.cv_results["Random Forest"].f1.mean,
      "SVM (RBF)": researchData.cv_results["Support Vector Machine"].f1.mean,
      XGBoost: researchData.cv_results["XGBoost"].f1.mean,
    },
    {
      metric: "Recall",
      "Random Forest": researchData.cv_results["Random Forest"].recall.mean,
      "SVM (RBF)": researchData.cv_results["Support Vector Machine"].recall.mean,
      XGBoost: researchData.cv_results["XGBoost"].recall.mean,
    },
    {
      metric: "MCC",
      "Random Forest": researchData.cv_results["Random Forest"].mcc.mean,
      "SVM (RBF)": researchData.cv_results["Support Vector Machine"].mcc.mean,
      XGBoost: researchData.cv_results["XGBoost"].mcc.mean,
    },
  ];

  // Baseline vs tuned chart data
  const baselineVsTunedData = [
    {
      metric: "ROC-AUC",
      Baseline: winnerTest?.roc_auc ?? 0.9947,
      Tuned: tunedMetrics.roc_auc,
    },
    {
      metric: "Accuracy",
      Baseline: winnerTest?.accuracy ?? 0.9737,
      Tuned: tunedMetrics.accuracy,
    },
    {
      metric: "Recall",
      Baseline: winnerTest?.recall ?? 0.9286,
      Tuned: tunedMetrics.recall,
    },
    {
      metric: "F1-Score",
      Baseline: winnerTest?.f1 ?? 0.963,
      Tuned: tunedMetrics.f1,
    },
    {
      metric: "MCC",
      Baseline: winnerTest?.mcc ?? 0.9442,
      Tuned: tunedMetrics.mcc,
    },
  ];

  // Top 5 features
  const topFeaturesPreview = researchData.shap.top_features.slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <DisclaimerBanner />

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 rounded-2xl p-8 text-white shadow-elevated relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-teal-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold mb-4">
            <Activity className="w-3.5 h-3.5" />
            Wisconsin Diagnostic Breast Cancer (WDBC) Benchmark
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
            Breast Cancer AI Research Lab
          </h1>
          <p className="text-slate-300 text-base leading-relaxed mb-6 font-normal">
            Comparative Machine Learning, Statistical Evaluation and Explainable AI. Rigorous benchmarking of Random Forest, Support Vector Machine (RBF), and XGBoost with Stratified 5-Fold Cross-Validation, 3,000-resample bootstrap confidence intervals, and SHAP explainability.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/comparison"
              className="px-4 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-medium text-xs sm:text-sm flex items-center gap-2 transition-colors shadow-sm"
            >
              Explore Model Benchmark
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/prediction"
              className="px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium text-xs sm:text-sm flex items-center gap-2 transition-colors border border-white/20"
            >
              <FlaskConical className="w-4 h-4 text-teal-300" />
              Launch Prediction Lab
            </Link>
          </div>
        </div>
      </div>

      {/* 5 Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Dataset Size */}
        <Card className="hover:border-slate-300 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Dataset Cohort</span>
              <Database className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-1">
              {researchData.metadata.n_samples}
            </div>
            <div className="text-[11px] text-slate-500">
              {researchData.dataset.class_distribution.malignant_count} Malignant ({researchData.dataset.class_distribution.malignant_pct}%) · {researchData.dataset.class_distribution.benign_count} Benign
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Feature Count */}
        <Card className="hover:border-slate-300 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Feature Count</span>
              <Layers className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-1">
              {researchData.metadata.n_features}
            </div>
            <div className="text-[11px] text-slate-500">
              10 Mean · 10 SE · 10 Worst nuclear metrics
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Best-Performing Model */}
        <Card className="border-teal-200 bg-teal-50/20 hover:border-teal-300 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-teal-700 mb-2">
              <span className="text-xs font-semibold">Winning Model</span>
              <Award className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-xl font-bold text-slate-900 mb-1 truncate" title={winner}>
              SVM (RBF)
            </div>
            <div className="text-[11px] text-teal-700 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              CV ROC-AUC: {(researchData.cv_results[winner].roc_auc.mean * 100).toFixed(2)}%
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Baseline Test ROC-AUC */}
        <Card className="hover:border-slate-300 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <div className="flex items-center">
                <span className="text-xs font-medium">Baseline Test AUC</span>
                <TooltipInfo
                  term="Held-out Test ROC-AUC"
                  explanation="Area Under the ROC Curve evaluated on the untouched 20% test set (114 samples) prior to hyperparameter optimization."
                />
              </div>
              <TrendingUp className="w-4 h-4 text-slate-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-1">
              {winnerTest?.roc_auc.toFixed(4)}
            </div>
            <div className="text-[11px] text-slate-500">
              Default params (C=1.0, scale)
            </div>
          </CardContent>
        </Card>

        {/* Card 5: Tuned Test ROC-AUC */}
        <Card className="hover:border-slate-300 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <div className="flex items-center">
                <span className="text-xs font-medium">Tuned Test AUC</span>
                <TooltipInfo
                  term="Tuned Held-out AUC"
                  explanation="Performance of the best model configuration found via 5-fold GridSearchCV (C=5.0, gamma=0.01) on the same test set."
                />
              </div>
              <Sliders className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-2xl font-bold text-teal-700 mb-1">
              {tunedMetrics.roc_auc.toFixed(4)}
            </div>
            <div className="text-[11px] text-emerald-700 font-medium">
              +{((tunedMetrics.roc_auc - (winnerTest?.roc_auc ?? 0.9947)) * 100).toFixed(2)}% Absolute Improvement
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comparative Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: 3-Model Cross-Validation Comparison */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Cross-Validation Performance Comparison</CardTitle>
              <CardDescription>
                Stratified 5-Fold Cross Validation means on training data (N=455)
              </CardDescription>
            </div>
            <Badge variant="teal" size="sm">5-Fold CV</Badge>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonChartData} margin={{ top: 20, right: 10, left: -15, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="metric" tick={{ fontSize: 11, fill: "#64748b" }} />
                  <YAxis domain={[0.9, 1.0]} tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={(v) => v.toFixed(2)} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", border: "none", color: "#f8fafc", fontSize: "12px" }}
                    formatter={(val: any) => [typeof val === 'number' ? val.toFixed(4) : val, '']}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                  <Bar dataKey="Random Forest" fill="#0284c7" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="SVM (RBF)" fill="#0d9488" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="XGBoost" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 text-center">
              SVM (RBF) achieved highest mean ROC-AUC (0.9949 ± 0.0050), winning the candidate selection.
            </p>
          </CardContent>
        </Card>

        {/* Chart 2: Baseline vs Tuned Improvement */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Baseline vs. Tuned Performance</CardTitle>
              <CardDescription>
                Held-out test set metrics before and after GridSearchCV optimization
              </CardDescription>
            </div>
            <Badge variant="success" size="sm">Untouched Test Set (N=114)</Badge>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={baselineVsTunedData} margin={{ top: 20, right: 10, left: -15, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="metric" tick={{ fontSize: 11, fill: "#64748b" }} />
                  <YAxis domain={[0.9, 1.0]} tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={(v) => v.toFixed(2)} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", border: "none", color: "#f8fafc", fontSize: "12px" }}
                    formatter={(val: any) => [typeof val === 'number' ? val.toFixed(4) : val, '']}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                  <Bar dataKey="Baseline" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Tuned" fill="#0d9488" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 text-center">
              Tuning improved Test Accuracy from 97.37% to 98.25% and Recall from 92.86% to 95.24%.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Confidence Intervals & SHAP Importance Previews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confidence Interval Summary */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>95% Bootstrap Confidence Intervals</CardTitle>
              <CardDescription>
                Calculated on test set across 3,000 stratified bootstrap resamples
              </CardDescription>
            </div>
            <Link
              href="/confidence-intervals"
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
            >
              Full CI Analysis
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(researchData.bootstrap_ci).slice(0, 4).map(([metric, ci]) => (
                <div key={metric} className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-800 capitalize">
                      {formatMetricName(metric)}
                    </span>
                    <span className="block text-[11px] text-slate-500 mt-0.5">
                      SE: {ci.std_error.toFixed(4)} · Mean: {ci.mean.toFixed(4)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 text-sm">
                      {ci.point_estimate.toFixed(4)}
                    </span>
                    <span className="block text-[11px] font-mono text-teal-700">
                      [{ci.ci_lower.toFixed(4)}, {ci.ci_upper.toFixed(4)}]
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Feature Importance Preview */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Top Influential Features (SHAP)</CardTitle>
              <CardDescription>
                Mean absolute Shapley values quantifying global feature attribution
              </CardDescription>
            </div>
            <Link
              href="/explainability"
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
            >
              All 30 Features
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topFeaturesPreview.map((item) => (
                <div key={item.feature_name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800">
                      {item.rank}. {item.feature_name}
                    </span>
                    <span className="font-mono text-slate-600">
                      {item.mean_abs_shap.toFixed(4)} | {item.category}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-teal-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, item.mean_abs_shap * 400)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Research Pipeline Stepper */}
      <Card>
        <CardHeader>
          <CardTitle>Experimental Pipeline & Reproducibility Architecture</CardTitle>
          <CardDescription>
            End-to-end workflow executed to prevent data leakage and guarantee statistical validity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs mb-2">1</span>
              <strong className="block text-slate-900 text-sm">Data Splitting</strong>
              <p className="text-slate-600 leading-relaxed">
                Stratified 80/20 train/test partition (455 train, 114 test). Standard Scaler fit exclusively on training folds to prevent leakage.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs mb-2">2</span>
              <strong className="block text-slate-900 text-sm">5-Fold CV Benchmark</strong>
              <p className="text-slate-600 leading-relaxed">
                Evaluated RF, SVM (RBF), and XGBoost across 7 metrics. SVM selected as winning model based on mean CV ROC-AUC (0.9949).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs mb-2">3</span>
              <strong className="block text-slate-900 text-sm">Bootstrap CIs (3,000)</strong>
              <p className="text-slate-600 leading-relaxed">
                Empirical 95% stratified bootstrap confidence intervals computed on untouched test set for all 7 evaluation metrics.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs mb-2">4</span>
              <strong className="block text-slate-900 text-sm">GridSearchCV & SHAP</strong>
              <p className="text-slate-600 leading-relaxed">
                Tuned C and gamma hyperparameters. Paired bootstrap difference testing and Shapley feature attribution analysis.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
