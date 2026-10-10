"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Info,
  HelpCircle,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Activity,
  Layers,
  CheckCircle2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { researchData } from "@/lib/research-data";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DisclaimerBanner } from "@/components/ui/disclaimer-banner";

export default function ShapExplainabilityPage() {
  const shap = researchData.shap;
  const [selectedCaseIdx, setSelectedCaseIdx] = useState(0);

  const top10Data = shap.top_features.map((f) => ({
    name: f.feature_name,
    importance: f.mean_abs_shap,
    category: f.category,
    direction: f.direction,
    clinical: f.clinical_significance,
  }));

  const activeCase = shap.local_explanations[selectedCaseIdx] || shap.local_explanations[0];

  const caseChartData = activeCase.top_contributions.map((c) => ({
    feature: c.feature,
    shap_value: c.shap_value,
    impact: c.impact,
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <DisclaimerBanner />

      {/* Hero Explainer Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
              Explainable AI (XAI)
            </span>
            <Badge variant="teal" size="sm">{shap.explainer_type}</Badge>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            SHAP (SHapley Additive exPlanations) Analysis
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Game-theoretic Shapley attribution for feature importance in the tuned <strong>{shap.model_name}</strong>.
          </p>
        </div>

        <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 max-w-sm">
          <strong className="block font-semibold mb-0.5">Non-Causality Principle:</strong>
          SHAP quantifies mathematical feature attribution within the trained model and does not prove biological or clinical etiology.
        </div>
      </div>

      {/* Global Feature Importance Chart (Top 10) */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Top 10 Most Influential Features (Mean |SHAP| Value)</CardTitle>
            <CardDescription>
              Average impact on model output magnitude across the test cohort
            </CardDescription>
          </div>
          <Badge variant="teal" size="sm">Global Attribution</Badge>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={top10Data}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 100, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#1e293b", fontWeight: 500 }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", border: "none", color: "#f8fafc", fontSize: "12px" }}
                  formatter={(val: any) => [typeof val === 'number' ? val.toFixed(4) : val, 'Mean |SHAP|']}
                />
                <Bar dataKey="importance" fill="#0d9488" radius={[0, 4, 4, 0]}>
                  {top10Data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index < 3 ? "#0f766e" : "#14b8a6"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Clinical Feature Descriptions & Biological Context */}
      <Card>
        <CardHeader>
          <CardTitle>Clinical & Morphometric Interpretation of Top Features</CardTitle>
          <CardDescription>
            How cell nuclear perimeter, area, concavity, and texture relate to oncological pathology
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shap.top_features.map((item) => (
              <div
                key={item.feature_name}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-teal-300 transition-all space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">
                    #{item.rank}. {item.feature_name}
                  </span>
                  <Badge variant="outline" size="sm">{item.category}</Badge>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500">
                  <span>|SHAP|: <strong className="text-teal-700">{item.mean_abs_shap.toFixed(4)}</strong></span>
                  <span>r: <strong className="text-slate-800">+{item.correlation_with_malignancy.toFixed(3)}</strong></span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pt-1 border-t border-slate-100">
                  {item.clinical_significance}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Local Prediction Case Studies (Patient Examples) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full flex-wrap gap-3">
            <div>
              <CardTitle>Local Explanation Case Studies (FNA Biopsy Patients)</CardTitle>
              <CardDescription>
                Examine specific test cases to observe how features push predictions towards Benign or Malignant
              </CardDescription>
            </div>
            <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs gap-1">
              {shap.local_explanations.map((c, idx) => (
                <button
                  key={c.title}
                  onClick={() => setSelectedCaseIdx(idx)}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                    selectedCaseIdx === idx
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {c.title}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Active Case Meta Banner */}
          <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] text-teal-400 uppercase font-mono tracking-wider">
                Case Study Index #{activeCase.sample_index}
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">{activeCase.title}</h3>
              <p className="text-xs text-slate-300">
                Ground Truth: <strong>{activeCase.ground_truth}</strong> · Predicted:{" "}
                <strong className={activeCase.predicted_class === "Malignant" ? "text-rose-400" : "text-emerald-400"}>
                  {activeCase.predicted_class}
                </strong>
              </p>
            </div>

            <div className="p-3 bg-white/10 rounded-lg border border-white/20 text-xs font-mono shrink-0">
              <span className="text-[10px] text-slate-400 block font-sans">Malignant Probability</span>
              <span className="text-xl font-bold text-teal-300">
                {(activeCase.malignant_probability * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Local Attribution Bar Chart */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Feature Attributions for this Instance
            </h4>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={caseChartData}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 110, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "#64748b" }} />
                  <YAxis
                    type="category"
                    dataKey="feature"
                    tick={{ fontSize: 10, fill: "#1e293b" }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", border: "none", color: "#f8fafc", fontSize: "11px" }}
                    formatter={(val: any) => [typeof val === 'number' ? val.toFixed(4) : val, 'SHAP Impact']}
                  />
                  <Bar dataKey="shap_value" radius={[0, 4, 4, 0]}>
                    {caseChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.shap_value > 0 ? "#e11d48" : "#0d9488"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 text-xs text-slate-600 mt-2">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-rose-600" />
                <span>Positive SHAP: Pushes towards Malignant</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-teal-600" />
                <span>Negative SHAP: Pushes towards Benign</span>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
