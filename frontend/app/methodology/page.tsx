"use client";

import React from "react";
import {
  BookOpen,
  CheckCircle2,
  Cpu,
  Database,
  Layers,
  Scale,
  ShieldCheck,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DisclaimerBanner } from "@/components/ui/disclaimer-banner";

export default function MethodologyPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <DisclaimerBanner />

      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
              Scientific Protocol
            </span>
            <Badge variant="teal" size="sm">Peer-Review Standard</Badge>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Research Methodology & Statistical Framework
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Formal mathematical formulations, cross-validation standards, bootstrap resampling theory, and explainability principles.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs shrink-0">
          <div>
            <span className="text-[10px] text-slate-400 block font-sans">Verification Cohort</span>
            <span className="text-base font-bold text-slate-900">569 Cases</span>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div>
            <span className="text-[10px] text-slate-400 block font-sans">Resamples</span>
            <span className="text-base font-bold text-teal-700">3,000 Iterations</span>
          </div>
        </div>
      </div>

      {/* Section 1: Dataset Provenance & Preprocessing */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-teal-600" />
            <CardTitle>1. Dataset Provenance & Clinical Features</CardTitle>
          </div>
          <CardDescription>Wisconsin Diagnostic Breast Cancer (WDBC) Fine-Needle Aspirate Repository</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-xs leading-relaxed text-slate-700">
          <p>
            The Wisconsin Diagnostic Breast Cancer (WDBC) dataset comprises <strong>569 patient samples</strong> obtained via fine-needle aspiration (FNA) of breast masses by Dr. William H. Wolberg at the University of Wisconsin Hospitals. Digital images of fine needle aspirates were processed via an automated curve-fitting algorithm (Xcyt) to calculate continuous morphometric characteristics of cell nuclei.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <strong className="text-slate-900 block text-xs mb-1">Mean Features (1-10)</strong>
              <p className="text-[11px] text-slate-600">
                Mean radius, texture, perimeter, area, smoothness, compactness, concavity, concave points, symmetry, and fractal dimension across observed nuclei.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <strong className="text-slate-900 block text-xs mb-1">Standard Error Features (11-20)</strong>
              <p className="text-[11px] text-slate-600">
                Standard error of each of the 10 morphometric properties, quantifying intra-sample cell-to-cell variability and heterogeneity.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <strong className="text-slate-900 block text-xs mb-1">Extreme / Worst Features (21-30)</strong>
              <p className="text-[11px] text-slate-600">
                The mean of the three largest values for each property, isolating the most atypical and dysplastic cells in the aspirate.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Cross-Validation & Anti-Leakage Protocol */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-teal-600" />
            <CardTitle>2. Stratified 5-Fold Cross-Validation & Leakage Prevention</CardTitle>
          </div>
          <CardDescription>Partitioning protocol guaranteeing unbiased out-of-fold generalization</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-xs leading-relaxed text-slate-700">
          <p>
            To prevent optimistic bias, an 80/20 stratified split partition created an untouched held-out test cohort of <strong>114 cases</strong> (72 benign, 42 malignant) and a training cohort of <strong>455 cases</strong>.
          </p>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <strong className="text-slate-900 text-xs block">
              Strict In-Fold Standardization Protocol:
            </strong>
            <p>
              Feature transformation (standardization via Z-score normalization) was strictly encapsulated within Scikit-learn <code className="text-teal-700 bg-teal-50 px-1 py-0.5 rounded">Pipeline</code> structures. For each of the 5 cross-validation folds, <code className="text-teal-700 bg-teal-50 px-1 py-0.5 rounded">StandardScaler</code> was fit solely on the training fold indices (X_train_fold) and subsequently applied to validate X_val_fold, completely eliminating data leakage.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Evaluation Metrics Formulations */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-teal-600" />
            <CardTitle>3. Formal Mathematical Evaluation Metrics</CardTitle>
          </div>
          <CardDescription>Clinical and statistical classification formulations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <strong className="text-slate-900 text-xs block">Accuracy & Sensitivity (Recall)</strong>
              <p className="font-mono text-slate-800">Accuracy = (TP + TN) / (TP + TN + FP + FN)</p>
              <p className="font-mono text-slate-800">Sensitivity = TP / (TP + FN)</p>
              <p className="text-[11px] text-slate-500 pt-1">
                Sensitivity directly quantifies the probability of correctly identifying malignant tumors, minimizing false negatives.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <strong className="text-slate-900 text-xs block">Specificity & Precision</strong>
              <p className="font-mono text-slate-800">Specificity = TN / (TN + FP)</p>
              <p className="font-mono text-slate-800">Precision = TP / (TP + FP)</p>
              <p className="text-[11px] text-slate-500 pt-1">
                Specificity quantifies benign identification rate, preventing unnecessary patient anxiety and invasive follow-ups.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <strong className="text-slate-900 text-xs block">F1-Score & ROC-AUC</strong>
              <p className="font-mono text-slate-800">F1 = 2 × (Precision × Recall) / (Precision + Recall)</p>
              <p className="font-mono text-slate-800">ROC-AUC = ∫ TPR(FPR) d(FPR)</p>
              <p className="text-[11px] text-slate-500 pt-1">
                ROC-AUC evaluates discrimination capacity across all possible diagnostic probability cutoff thresholds.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <strong className="text-slate-900 text-xs block">Matthews Correlation Coefficient (MCC)</strong>
              <p className="font-mono text-slate-800">MCC = (TP×TN - FP×FN) / √((TP+FP)(TP+FN)(TN+FP)(TN+FN))</p>
              <p className="text-[11px] text-slate-500 pt-1">
                Regarded as the most robust single metric for imbalanced biomedical classification, ranging between -1 and +1.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 4: Bootstrap Resampling Theory */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-teal-600" />
            <CardTitle>4. Non-Parametric Bootstrap Resampling & Paired Difference Tests</CardTitle>
          </div>
          <CardDescription>Derivation of empirical confidence intervals and hypothesis bounds</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-xs leading-relaxed text-slate-700">
          <p>
            Let D_test = (x_i, y_i) for i = 1 to N represent the held-out test cohort of N = 114 instances. We generate B = 3,000 independent bootstrap samples with replacement, stratified by class label:
          </p>
          <div className="p-3 bg-slate-900 text-slate-100 font-mono rounded-lg text-[11px]">
            For b = 1, ..., 3000:
            <br />
            &nbsp;&nbsp;Sample N_pos malignant indices with replacement from positive test cohort
            <br />
            &nbsp;&nbsp;Sample N_neg benign indices with replacement from negative test cohort
            <br />
            &nbsp;&nbsp;Calculate metric θ̂_b on bootstrap sample b
            <br />
            95% Confidence Interval = [θ̂_(2.5%), θ̂_(97.5%)]
          </div>
          <p>
            <strong>Paired Differences:</strong> To test whether hyperparameter tuning achieved statistically significant improvement, we compute the paired difference on each bootstrap sample:
            <br />
            <code className="text-teal-700 bg-teal-50 px-1 py-0.5 rounded font-mono">
              Δ_b = Metric_tuned(b) - Metric_baseline(b)
            </code>
            <br />
            The null hypothesis of no improvement (H₀: Δ = 0) is rejected at α = 0.05 if and only if the 95% paired bootstrap interval strictly excludes zero.
          </p>
        </CardContent>
      </Card>

      {/* Section 5: SHAP Principles */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <CardTitle>5. Shapley Additive Explanations (SHAP) Principles</CardTitle>
          </div>
          <CardDescription>Axiomatic attribution framework from cooperative game theory</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-xs leading-relaxed text-slate-700">
          <p>
            SHAP assigns each feature an importance value ϕ_i representing its marginal contribution to the prediction across all possible feature subsets S:
          </p>
          <div className="p-3 bg-slate-900 text-slate-100 font-mono rounded-lg text-[11px]">
            ϕ_i = ∑ [ |S|! (|F| - |S| - 1)! / |F|! ] × [ f(S ∪ [i]) - f(S) ]
          </div>
          <p>
            <strong>Axiomatic Guarantees:</strong> Efficiency (sum of ϕ_i = f(x) - E[f(x)]), Symmetry (identically contributing features receive identical values), and Additivity make SHAP uniquely mathematically consistent among explainability methods.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
