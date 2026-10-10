"use client";

import React from "react";
import {
  TrendingUp,
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Info,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ErrorBar,
} from "recharts";
import { researchData, formatMetricName } from "@/lib/research-data";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DisclaimerBanner } from "@/components/ui/disclaimer-banner";
import { TooltipInfo } from "@/components/ui/tooltip-info";

export default function ConfidenceIntervalsPage() {
  const winner = researchData.winning_model;
  const ciData = researchData.bootstrap_ci;

  // Chart data formatting: point estimate and error margins
  const chartData = Object.entries(ciData).map(([metric, ci]) => {
    const errorLower = ci.point_estimate - ci.ci_lower;
    const errorUpper = ci.ci_upper - ci.point_estimate;
    return {
      metric: formatMetricName(metric),
      point_estimate: ci.point_estimate,
      ci_lower: ci.ci_lower,
      ci_upper: ci.ci_upper,
      errorMargin: [errorLower, errorUpper],
      mean: ci.mean,
      std_error: ci.std_error,
    };
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <DisclaimerBanner />

      {/* Header Summary */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
              Parametric vs Non-Parametric Inference
            </span>
            <Badge variant="teal" size="sm">B = 3,000 Resamples</Badge>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            95% Stratified Bootstrap Confidence Intervals
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Empirical percentile interval bounds estimated on the untouched held-out test set (N=114) for <strong>{winner}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs shrink-0">
          <div>
            <span className="text-[10px] text-slate-400 block font-sans">Confidence Level</span>
            <span className="text-base font-bold text-slate-900">95% (α = 0.05)</span>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div>
            <span className="text-[10px] text-slate-400 block font-sans">Resample Method</span>
            <span className="text-base font-bold text-teal-700">Stratified Test</span>
          </div>
        </div>
      </div>

      {/* Primary Visual Chart: Interval Bounds Display */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Point Estimates with 95% Confidence Bounds</CardTitle>
            <CardDescription>
              Comparing observed held-out test metrics against empirical 2.5% and 97.5% bootstrap quantiles
            </CardDescription>
          </div>
          <Badge variant="outline" size="sm">Percentile Method</Badge>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {chartData.map((item) => {
              const widthPct = (item.ci_upper - item.ci_lower) * 100;
              const leftPct = (item.ci_lower - 0.8) / (1.0 - 0.8) * 100;
              const pointPct = (item.point_estimate - 0.8) / (1.0 - 0.8) * 100;

              return (
                <div key={item.metric} className="p-3.5 rounded-lg bg-slate-50/70 border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{item.metric}</span>
                      <span className="text-[11px] text-slate-500 ml-2 font-mono">
                        SE = {item.std_error.toFixed(4)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900 font-mono text-sm">
                        {item.point_estimate.toFixed(4)}
                      </span>
                      <span className="text-[11px] font-mono text-teal-700 ml-2">
                        [{item.ci_lower.toFixed(4)}, {item.ci_upper.toFixed(4)}]
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Range Visualization */}
                  <div className="relative h-6 bg-slate-200/80 rounded-md overflow-hidden">
                    {/* Scale markers */}
                    <div className="absolute inset-0 flex justify-between px-2 text-[9px] text-slate-400 items-center font-mono select-none">
                      <span>0.80</span>
                      <span>0.85</span>
                      <span>0.90</span>
                      <span>0.95</span>
                      <span>1.00</span>
                    </div>

                    {/* CI Band */}
                    <div
                      className="absolute top-1 bottom-1 bg-teal-500/30 border-y border-teal-500/50 rounded transition-all duration-300"
                      style={{
                        left: `${Math.max(0, Math.min(100, leftPct))}%`,
                        width: `${Math.max(2, Math.min(100, widthPct * 5))}%`,
                      }}
                    />

                    {/* Point estimate marker */}
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-teal-700 shadow-sm"
                      style={{
                        left: `${Math.max(0, Math.min(100, pointPct))}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Comprehensive Tabular Registry */}
      <Card>
        <CardHeader>
          <CardTitle>Bootstrap Statistical Estimation Table</CardTitle>
          <CardDescription>
            Point estimates, bootstrap mean, standard error, and 95% confidence intervals (B = 3,000)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/70">
                  <th className="py-3 px-4">Evaluation Metric</th>
                  <th className="py-3 px-4">Observed Test Point Estimate</th>
                  <th className="py-3 px-4">Bootstrap Mean (B=3000)</th>
                  <th className="py-3 px-4">Standard Error (SE)</th>
                  <th className="py-3 px-4">95% CI Lower Bound (2.5%)</th>
                  <th className="py-3 px-4">95% CI Upper Bound (97.5%)</th>
                  <th className="py-3 px-4">Interval Width (Δ)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Object.entries(ciData).map(([metric, ci]) => (
                  <tr key={metric} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {formatMetricName(metric)}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {ci.point_estimate.toFixed(4)}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {ci.mean.toFixed(4)}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {ci.std_error.toFixed(4)}
                    </td>
                    <td className="py-3 px-4 font-mono text-teal-700 font-semibold">
                      {ci.ci_lower.toFixed(4)}
                    </td>
                    <td className="py-3 px-4 font-mono text-teal-700 font-semibold">
                      {ci.ci_upper.toFixed(4)}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {(ci.ci_upper - ci.ci_lower).toFixed(4)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Critical Statistical Education Guide: Bootstrap CI vs Cross-Validation SD */}
      <Card className="border-teal-200 bg-teal-50/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-teal-700" />
            <CardTitle className="text-teal-950">
              Essential Statistical Distinction: Bootstrap CIs vs Cross-Validation SD
            </CardTitle>
          </div>
          <CardDescription>
            Understanding the difference between sampling variability and partition instability
          </CardDescription>
        </CardHeader>
        <CardContent className="text-xs leading-relaxed space-y-4 text-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-lg border border-teal-100 shadow-subtle space-y-2">
              <strong className="text-slate-900 text-sm block">
                1. Test-Set Bootstrap Confidence Intervals (B = 3,000)
              </strong>
              <p>
                <strong>What it measures:</strong> The sampling uncertainty of the held-out test evaluation. By taking 3,000 stratified random samples with replacement from the test set, we simulate drawing new patient cohorts from the broader population.
              </p>
              <p>
                <strong>Interpretation:</strong> A 95% bootstrap CI of [0.9831, 1.0000] for ROC-AUC means we are 95% confident that the true population discrimination ability of this model lies within this range.
              </p>
            </div>

            <div className="p-4 bg-white rounded-lg border border-teal-100 shadow-subtle space-y-2">
              <strong className="text-slate-900 text-sm block">
                2. Cross-Validation Standard Deviation (5-Fold CV)
              </strong>
              <p>
                <strong>What it measures:</strong> How sensitive the model fitting procedure is to varying partitions of the training dataset.
              </p>
              <p>
                <strong>Interpretation:</strong> A CV standard deviation of ±0.0050 reflects stability across the 5 training folds. It is <em>not</em> an inferential confidence interval on test performance, and should never be conflated with confidence bounds.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
