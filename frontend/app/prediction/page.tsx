"use client";

import React, { useState } from "react";
import {
  FlaskConical,
  Play,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  HelpCircle,
  Activity,
  Layers,
  ArrowRight,
} from "lucide-react";
import { researchData } from "@/lib/research-data";
import { predictSample, explainSample } from "@/lib/api";
import { PredictionResult, ExplanationResult } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DisclaimerBanner } from "@/components/ui/disclaimer-banner";

export default function PredictionLabPage() {
  const dataset = researchData.dataset;
  const presets = dataset.presets;

  // Initial state uses benign preset as clean baseline
  const [featureValues, setFeatureValues] = useState<Record<string, number>>({
    ...presets.typical_benign,
  });

  const [activeGroupTab, setActiveGroupTab] = useState<"mean" | "se" | "worst">("mean");
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [explanation, setExplanation] = useState<ExplanationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Group features into 3 tabs
  const meanFeatures = dataset.features.filter((f) => dataset.feature_stats[f].group === "mean");
  const seFeatures = dataset.features.filter((f) => dataset.feature_stats[f].group === "se");
  const worstFeatures = dataset.features.filter((f) => dataset.feature_stats[f].group === "worst");

  const activeFeatures =
    activeGroupTab === "mean"
      ? meanFeatures
      : activeGroupTab === "se"
      ? seFeatures
      : worstFeatures;

  const handleInputChange = (fName: string, val: string) => {
    const num = parseFloat(val);
    setFeatureValues((prev) => ({
      ...prev,
      [fName]: isNaN(num) ? 0 : num,
    }));
  };

  const loadPreset = (presetName: "benign" | "malignant" | "borderline") => {
    setErrorMsg(null);
    let chosen = presets.typical_benign;
    if (presetName === "malignant") chosen = presets.typical_malignant;
    else if (presetName === "borderline") chosen = presets.borderline_ambiguous;
    setFeatureValues({ ...chosen });
    setPrediction(null);
    setExplanation(null);
  };

  const handlePredict = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // Run prediction
      const res = await predictSample(featureValues);
      setPrediction(res);

      // Run explanation
      const expRes = await explainSample(featureValues);
      setExplanation(expRes);
    } catch (err: any) {
      setErrorMsg("Prediction failed: " + (err?.message || "Check input values"));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    loadPreset("benign");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <DisclaimerBanner />

      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
              Interactive Inference Engine
            </span>
            <Badge variant="teal" size="sm">Tuned SVM (RBF)</Badge>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Diagnostic Prediction Lab & Risk Calculator
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Input all 30 FNA morphometric measurements or load clinically representative preset cohorts.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => loadPreset("benign")}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors"
          >
            Load Typical Benign
          </button>
          <button
            onClick={() => loadPreset("malignant")}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 transition-colors"
          >
            Load Typical Malignant
          </button>
          <button
            onClick={() => loadPreset("borderline")}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors"
          >
            Load Borderline Sample
          </button>
        </div>
      </div>

      {/* Main Grid: Inputs vs Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Panel (8 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between w-full flex-wrap gap-2">
                <div>
                  <CardTitle>Morphometric Nuclear Features (30)</CardTitle>
                  <CardDescription>
                    Organized by Mean, Standard Error, and Worst extreme values
                  </CardDescription>
                </div>

                {/* Group selector tabs */}
                <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs">
                  <button
                    onClick={() => setActiveGroupTab("mean")}
                    className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                      activeGroupTab === "mean"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Mean (10)
                  </button>
                  <button
                    onClick={() => setActiveGroupTab("se")}
                    className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                      activeGroupTab === "se"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    SE (10)
                  </button>
                  <button
                    onClick={() => setActiveGroupTab("worst")}
                    className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                      activeGroupTab === "worst"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Worst (10)
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeFeatures.map((fname) => {
                  const val = featureValues[fname] ?? 0;
                  const stat = dataset.feature_stats[fname];
                  const min = stat?.overall.min ?? 0;
                  const max = stat?.overall.max ?? 100;

                  return (
                    <div
                      key={fname}
                      className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <label className="font-semibold text-slate-800 truncate" title={fname}>
                          {fname}
                        </label>
                        <span className="text-[10px] text-slate-400 font-mono">
                          [{min.toFixed(1)} - {max.toFixed(1)}]
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="any"
                          value={val}
                          onChange={(e) => handleInputChange(fname, e.target.value)}
                          className="w-full text-xs font-mono px-3 py-1.5 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-slate-900"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 mt-6 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Defaults
                </button>

                <button
                  type="button"
                  onClick={handlePredict}
                  disabled={loading}
                  className="px-6 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm"
                >
                  {loading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Computing Prediction...
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Execute Diagnostic Prediction
                    </>
                  )}
                </button>
              </div>

              {errorMsg && (
                <div className="mt-3 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertOctagon className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Prediction Results & Explanation Panel (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border-teal-200 bg-white">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between w-full">
                <CardTitle>Inference Result</CardTitle>
                <Badge variant={prediction?.is_malignant ? "danger" : "success"} size="sm">
                  {prediction ? prediction.risk_tier : "Awaiting Input"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              {prediction ? (
                <div className="space-y-6">
                  {/* Predicted Class Card */}
                  <div
                    className={`p-6 rounded-2xl border text-center transition-all ${
                      prediction.is_malignant
                        ? "bg-rose-50 border-rose-200 text-rose-950"
                        : "bg-emerald-50 border-emerald-200 text-emerald-950"
                    }`}
                  >
                    <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                      Predicted Diagnosis
                    </span>
                    <div className="text-3xl font-extrabold tracking-tight mt-1">
                      {prediction.predicted_class}
                    </div>
                    <div className="text-xs font-medium mt-1 text-slate-600">
                      Class Label: {prediction.class_label} ({prediction.is_malignant ? "Positive" : "Negative"})
                    </div>
                  </div>

                  {/* Probability Breakdown Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                      <span>Benign: {(prediction.benign_probability * 100).toFixed(1)}%</span>
                      <span>Malignant: {(prediction.malignant_probability * 100).toFixed(1)}%</span>
                    </div>

                    <div className="h-4 w-full bg-emerald-100 rounded-full overflow-hidden flex shadow-inner">
                      <div
                        className="bg-emerald-600 h-full transition-all duration-500"
                        style={{ width: `${prediction.benign_probability * 100}%` }}
                      />
                      <div
                        className="bg-rose-600 h-full transition-all duration-500"
                        style={{ width: `${prediction.malignant_probability * 100}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>Threshold = 0.50</span>
                      <span>Evaluated with {prediction.model_name}</span>
                    </div>
                  </div>

                  {/* Local Explanation Feature Attributions */}
                  {explanation && explanation.top_attributions && (
                    <div className="space-y-3 pt-4 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">
                          Top Local Feature Drivers
                        </span>
                        <Badge variant="outline" size="sm">SHAP-based</Badge>
                      </div>

                      <div className="space-y-2">
                        {explanation.top_attributions.slice(0, 5).map((attr) => (
                          <div
                            key={attr.feature}
                            className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center justify-between"
                          >
                            <div>
                              <span className="font-semibold text-slate-800 block">
                                {attr.feature}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                val = {attr.input_value}
                              </span>
                            </div>
                            <div className="text-right">
                              <span
                                className={`font-mono font-bold text-xs ${
                                  attr.attribution > 0 ? "text-rose-700" : "text-emerald-700"
                                }`}
                              >
                                {attr.attribution > 0 ? `+${attr.attribution}` : attr.attribution}
                              </span>
                              <span className="text-[10px] block text-slate-400">
                                {attr.direction}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 px-4 space-y-3 text-slate-400">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <FlaskConical className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-700">Ready for Prediction</h4>
                  <p className="text-xs leading-relaxed text-slate-500 max-w-xs mx-auto">
                    Adjust feature measurements or pick a preset button above, then click &quot;Execute Diagnostic Prediction&quot;.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
