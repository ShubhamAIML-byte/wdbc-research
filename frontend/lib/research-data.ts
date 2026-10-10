import researchJson from "./research-data.json";
import { ResearchExperimentsData } from "./types";

export const researchData: ResearchExperimentsData = researchJson as unknown as ResearchExperimentsData;

export function getModelColor(name: string): string {
  if (name.includes("Support Vector") || name.includes("SVM")) return "#0d9488"; // teal
  if (name.includes("Forest") || name.includes("RF")) return "#0284c7"; // sky
  if (name.includes("XGBoost") || name.includes("XGB")) return "#6366f1"; // indigo
  return "#64748b";
}

export function formatMetricName(key: string): string {
  const map: Record<string, string> = {
    accuracy: "Accuracy",
    precision: "Precision",
    recall: "Recall / Sensitivity",
    specificity: "Specificity",
    f1: "F1-Score",
    roc_auc: "ROC-AUC",
    mcc: "Matthews Corr. (MCC)",
  };
  return map[key] || key;
}

export function formatMetricShort(key: string): string {
  const map: Record<string, string> = {
    accuracy: "ACC",
    precision: "PREC",
    recall: "REC",
    specificity: "SPEC",
    f1: "F1",
    roc_auc: "AUC",
    mcc: "MCC",
  };
  return map[key] || key.toUpperCase();
}
