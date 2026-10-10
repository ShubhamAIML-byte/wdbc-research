"use client";

import React, { useState } from "react";
import {
  Award,
  TrendingUp,
  BarChart3,
  Layers,
  CheckCircle2,
  Filter,
  ArrowUpDown,
  Zap,
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
  LineChart,
  Line,
} from "recharts";
import { researchData, formatMetricName } from "@/lib/research-data";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DisclaimerBanner } from "@/components/ui/disclaimer-banner";
import { TooltipInfo } from "@/components/ui/tooltip-info";

type MetricKey = "roc_auc" | "accuracy" | "f1" | "recall" | "precision" | "specificity" | "mcc";

export default function ModelComparisonPage() {
  const [activeCurveTab, setActiveCurveTab] = useState<"roc" | "pr">("roc");
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>("roc_auc");
  const [sortField, setSortField] = useState<"rank" | "roc_auc" | "f1" | "accuracy">("roc_auc");
  const [sortAsc, setSortAsc] = useState(false);

  const rankings = [...researchData.model_rankings].sort((a, b) => {
    let aVal = a.cv_roc_auc_mean;
    let bVal = b.cv_roc_auc_mean;
    if (sortField === "rank") {
      aVal = a.rank;
      bVal = b.rank;
    } else if (sortField === "f1") {
      aVal = a.cv_f1_mean;
      bVal = b.cv_f1_mean;
    } else if (sortField === "accuracy") {
      aVal = a.cv_accuracy_mean;
      bVal = b.cv_accuracy_mean;
    }
    return sortAsc ? aVal - bVal : bVal - aVal;
  });

  // Prepare data for the metric comparison bar chart
  const metricComparisonData = [
    {
      model: "Random Forest",
      "5-Fold CV Mean": researchData.cv_results["Random Forest"][selectedMetric].mean,
      "Test Set": researchData.test_evaluations["Random Forest"].metrics[selectedMetric],
    },
    {
      model: "Support Vector Machine",
      "5-Fold CV Mean": researchData.cv_results["Support Vector Machine"][selectedMetric].mean,
      "Test Set": researchData.test_evaluations["Support Vector Machine"].metrics[selectedMetric],
    },
    {
      model: "XGBoost",
      "5-Fold CV Mean": researchData.cv_results["XGBoost"][selectedMetric].mean,
      "Test Set": researchData.test_evaluations["XGBoost"].metrics[selectedMetric],
    },
  ];

  // Prepare curve data
  // Combine ROC curves for all 3 models on common point index
  const maxRocPts = Math.max(
    ...Object.values(researchData.test_evaluations).map((e) => e.roc_curve.length)
  );
  const combinedRocData = [];
  for (let i = 0; i < maxRocPts; i++) {
    const rfPt = researchData.test_evaluations["Random Forest"].roc_curve[i] || researchData.test_evaluations["Random Forest"].roc_curve.slice(-1)[0];
    const svmPt = researchData.test_evaluations["Support Vector Machine"].roc_curve[i] || researchData.test_evaluations["Support Vector Machine"].roc_curve.slice(-1)[0];
    const xgbPt = researchData.test_evaluations["XGBoost"].roc_curve[i] || researchData.test_evaluations["XGBoost"].roc_curve.slice(-1)[0];
    
    combinedRocData.push({
      fpr: svmPt?.fpr ?? 0,
      "Random Forest": rfPt?.tpr ?? 0,
      "Support Vector Machine": svmPt?.tpr ?? 0,
      XGBoost: xgbPt?.tpr ?? 0,
    });
  }

  // PR curve data
  const maxPrPts = Math.max(
    ...Object.values(researchData.test_evaluations).map((e) => e.pr_curve.length)
  );
  const combinedPrData = [];
  for (let i = 0; i < maxPrPts; i++) {
    const rfPt = researchData.test_evaluations["Random Forest"].pr_curve[i] || researchData.test_evaluations["Random Forest"].pr_curve.slice(-1)[0];
    const svmPt = researchData.test_evaluations["Support Vector Machine"].pr_curve[i] || researchData.test_evaluations["Support Vector Machine"].pr_curve.slice(-1)[0];
    const xgbPt = researchData.test_evaluations["XGBoost"].pr_curve[i] || researchData.test_evaluations["XGBoost"].pr_curve.slice(-1)[0];

    combinedPrData.push({
      recall: svmPt?.recall ?? 0,
      "Random Forest": rfPt?.precision ?? 0,
      "Support Vector Machine": svmPt?.precision ?? 0,
      XGBoost: xgbPt?.precision ?? 0,
    });
  }

  const handleSort = (field: "rank" | "roc_auc" | "f1" | "accuracy") => {
    if (sortField === field) setSortAsc(!sortAsc);
    else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <DisclaimerBanner />

      {/* Winning Model Hero Announcement */}
      <div className="rounded-xl border border-teal-200 bg-gradient-to-r from-teal-50/80 via-white to-slate-50 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-subtle">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
                Evaluation Champion
              </span>
              <Badge variant="teal" size="sm">Rank 1</Badge>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">
              Support Vector Machine (RBF Kernel)
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Selected via highest Stratified 5-Fold Cross-Validation ROC-AUC of <strong>0.9949 ± 0.0050</strong> (tie-breaker F1: 0.9610).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono bg-white p-3 rounded-lg border border-teal-100 shadow-sm shrink-0">
          <div>
            <span className="text-[10px] text-slate-400 uppercase block font-sans">CV AUC</span>
            <span className="text-base font-bold text-teal-700">0.9949</span>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div>
            <span className="text-[10px] text-slate-400 uppercase block font-sans">Test AUC</span>
            <span className="text-base font-bold text-slate-900">0.9947</span>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div>
            <span className="text-[10px] text-slate-400 uppercase block font-sans">Test ACC</span>
            <span className="text-base font-bold text-slate-900">97.37%</span>
          </div>
        </div>
      </div>

      {/* Sortable Model Comparison Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full flex-wrap gap-2">
            <div>
              <CardTitle>Model Performance Benchmark Registry</CardTitle>
              <CardDescription>
                Full metric comparison across Random Forest, SVM (RBF), and XGBoost
              </CardDescription>
            </div>
            <span className="text-xs text-slate-400">Click headers to sort</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/70">
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-slate-900"
                    onClick={() => handleSort("rank")}
                  >
                    <span className="flex items-center gap-1">
                      Rank <ArrowUpDown className="w-3 h-3" />
                    </span>
                  </th>
                  <th className="py-3 px-4">Model Architecture</th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-slate-900"
                    onClick={() => handleSort("roc_auc")}
                  >
                    <span className="flex items-center gap-1">
                      CV ROC-AUC (Mean ± SD) <ArrowUpDown className="w-3 h-3" />
                    </span>
                  </th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-slate-900"
                    onClick={() => handleSort("accuracy")}
                  >
                    <span className="flex items-center gap-1">
                      CV Accuracy <ArrowUpDown className="w-3 h-3" />
                    </span>
                  </th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-slate-900"
                    onClick={() => handleSort("f1")}
                  >
                    <span className="flex items-center gap-1">
                      CV F1-Score <ArrowUpDown className="w-3 h-3" />
                    </span>
                  </th>
                  <th className="py-3 px-4">Test Set AUC</th>
                  <th className="py-3 px-4">Test Accuracy</th>
                  <th className="py-3 px-4">Test Recall</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rankings.map((m) => {
                  const testM = researchData.test_evaluations[m.model_name].metrics;
                  return (
                    <tr
                      key={m.model_name}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        m.is_winner ? "bg-teal-50/30 font-medium" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                        #{m.rank}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-900 block">
                          {m.model_name}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {m.model_name === "Support Vector Machine"
                            ? "StandardScaler + RBF Kernel"
                            : m.model_name === "Random Forest"
                            ? "100 Trees, Gini Impurity"
                            : "100 Estimators, Logloss"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-teal-700 font-semibold">
                        {m.cv_roc_auc_mean.toFixed(4)} ± {m.cv_roc_auc_std.toFixed(4)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700">
                        {(m.cv_accuracy_mean * 100).toFixed(2)}%
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700">
                        {m.cv_f1_mean.toFixed(4)}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {testM.roc_auc.toFixed(4)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700">
                        {(testM.accuracy * 100).toFixed(2)}%
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700">
                        {(testM.recall * 100).toFixed(2)}%
                      </td>
                      <td className="py-3.5 px-4">
                        {m.is_winner ? (
                          <Badge variant="teal" size="sm">Champion</Badge>
                        ) : (
                          <Badge variant="outline" size="sm">Baseline</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Metric Comparison Bar Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full flex-wrap gap-3">
            <div>
              <CardTitle>Interactive Metric Comparison</CardTitle>
              <CardDescription>
                Compare cross-validation mean vs held-out test set performance for any metric
              </CardDescription>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs flex-wrap">
              {(["roc_auc", "accuracy", "f1", "recall", "precision", "specificity", "mcc"] as MetricKey[]).map(
                (met) => (
                  <button
                    key={met}
                    onClick={() => setSelectedMetric(met)}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                      selectedMetric === met
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {formatMetricName(met)}
                  </button>
                )
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metricComparisonData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="model" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis domain={[0.85, 1.0]} tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={(v) => v.toFixed(2)} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", border: "none", color: "#f8fafc", fontSize: "12px" }}
                  formatter={(val: any) => [typeof val === 'number' ? val.toFixed(4) : val, '']}
                />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                <Bar dataKey="5-Fold CV Mean" fill="#0284c7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Test Set" fill="#0d9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* ROC Curves and Precision-Recall Curves */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ROC Curve Chart */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Receiver Operating Characteristic (ROC)</CardTitle>
              <CardDescription>
                True Positive Rate vs False Positive Rate on held-out test set
              </CardDescription>
            </div>
            <Badge variant="teal" size="sm">AUC ~ 0.99</Badge>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={combinedRocData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="fpr" tick={{ fontSize: 10, fill: "#64748b" }} label={{ value: "False Positive Rate (1 - Specificity)", position: "insideBottom", offset: -5, fontSize: 10, fill: "#64748b" }} />
                  <YAxis domain={[0.8, 1.0]} tick={{ fontSize: 10, fill: "#64748b" }} label={{ value: "True Positive Rate (Sensitivity)", angle: -90, position: "insideLeft", fontSize: 10, fill: "#64748b" }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", border: "none", color: "#f8fafc", fontSize: "11px" }}
                    formatter={(val: any) => [typeof val === 'number' ? val.toFixed(4) : val, '']}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                  <Line type="monotone" dataKey="Support Vector Machine" stroke="#0d9488" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="Random Forest" stroke="#0284c7" strokeWidth={1.8} strokeDasharray="3 3" dot={false} />
                  <Line type="monotone" dataKey="XGBoost" stroke="#6366f1" strokeWidth={1.8} strokeDasharray="4 4" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Precision-Recall Curve */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Precision-Recall (PR) Curves</CardTitle>
              <CardDescription>
                Precision vs Recall tradeoff across classification probability thresholds
              </CardDescription>
            </div>
            <Badge variant="teal" size="sm">Clinical Tradeoff</Badge>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={combinedPrData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="recall" tick={{ fontSize: 10, fill: "#64748b" }} label={{ value: "Recall (Sensitivity)", position: "insideBottom", offset: -5, fontSize: 10, fill: "#64748b" }} />
                  <YAxis domain={[0.85, 1.0]} tick={{ fontSize: 10, fill: "#64748b" }} label={{ value: "Precision (Positive Predictive Value)", angle: -90, position: "insideLeft", fontSize: 10, fill: "#64748b" }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", border: "none", color: "#f8fafc", fontSize: "11px" }}
                    formatter={(val: any) => [typeof val === 'number' ? val.toFixed(4) : val, '']}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                  <Line type="monotone" dataKey="Support Vector Machine" stroke="#0d9488" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="Random Forest" stroke="#0284c7" strokeWidth={1.8} strokeDasharray="3 3" dot={false} />
                  <Line type="monotone" dataKey="XGBoost" stroke="#6366f1" strokeWidth={1.8} strokeDasharray="4 4" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Set Confusion Matrices */}
      <Card>
        <CardHeader>
          <CardTitle>Held-Out Test Set Confusion Matrices (N = 114)</CardTitle>
          <CardDescription>
            72 True Benign cases (0) and 42 True Malignant cases (1) evaluated on untouched test partition
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(researchData.test_evaluations).map(([name, evalData]) => {
              const m = evalData.metrics;
              const tp = m.tp ?? 39;
              const fp = m.fp ?? 0;
              const tn = m.tn ?? 72;
              const fn = m.fn ?? 3;

              return (
                <div key={name} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">{name}</span>
                    <Badge variant={name === researchData.winning_model ? "teal" : "outline"} size="sm">
                      Acc: {((m.accuracy) * 100).toFixed(1)}%
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono">
                    <div className="p-3 bg-emerald-100/70 border border-emerald-200 rounded-lg">
                      <span className="text-[10px] text-emerald-800 uppercase block font-sans">True Neg (TN)</span>
                      <span className="text-lg font-bold text-emerald-950">{tn}</span>
                      <span className="text-[10px] text-emerald-700 block mt-0.5">Correct Benign</span>
                    </div>

                    <div className="p-3 bg-rose-100/70 border border-rose-200 rounded-lg">
                      <span className="text-[10px] text-rose-800 uppercase block font-sans">False Pos (FP)</span>
                      <span className="text-lg font-bold text-rose-950">{fp}</span>
                      <span className="text-[10px] text-rose-700 block mt-0.5">Benign as Mal.</span>
                    </div>

                    <div className="p-3 bg-amber-100/70 border border-amber-200 rounded-lg">
                      <span className="text-[10px] text-amber-800 uppercase block font-sans">False Neg (FN)</span>
                      <span className="text-lg font-bold text-amber-950">{fn}</span>
                      <span className="text-[10px] text-amber-700 block mt-0.5">Missed Mal.</span>
                    </div>

                    <div className="p-3 bg-emerald-100/70 border border-emerald-200 rounded-lg">
                      <span className="text-[10px] text-emerald-800 uppercase block font-sans">True Pos (TP)</span>
                      <span className="text-lg font-bold text-emerald-950">{tp}</span>
                      <span className="text-[10px] text-emerald-700 block mt-0.5">Correct Mal.</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-600 space-y-1 pt-1 border-t border-slate-200">
                    <div className="flex justify-between">
                      <span>Sensitivity (Recall):</span>
                      <strong className="font-mono text-slate-900">{(m.recall * 100).toFixed(2)}%</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Specificity:</span>
                      <strong className="font-mono text-slate-900">{(m.specificity * 100).toFixed(2)}%</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Matthews Corr (MCC):</span>
                      <strong className="font-mono text-teal-700">{m.mcc.toFixed(4)}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
