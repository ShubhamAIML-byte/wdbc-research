export interface MetricRecord {
  accuracy: number;
  precision: number;
  recall: number;
  specificity: number;
  f1: number;
  roc_auc: number;
  mcc: number;
  tp?: number;
  fp?: number;
  tn?: number;
  fn?: number;
}

export interface CrossValidationSummary {
  mean: number;
  std: number;
  fold_values: number[];
}

export interface ModelCVResult {
  [metricName: string]: CrossValidationSummary;
}

export interface ModelRanking {
  rank: number;
  model_name: string;
  cv_roc_auc_mean: number;
  cv_roc_auc_std: number;
  cv_f1_mean: number;
  cv_accuracy_mean: number;
  test_roc_auc: number;
  test_f1: number;
  test_accuracy: number;
  is_winner: boolean;
}

export interface CurvePoint {
  fpr?: number;
  tpr?: number;
  recall?: number;
  precision?: number;
}

export interface TestEvaluation {
  metrics: MetricRecord;
  roc_curve: CurvePoint[];
  pr_curve: CurvePoint[];
}

export interface BootstrapConfidenceInterval {
  point_estimate: number;
  mean: number;
  std_error: number;
  ci_lower: number;
  ci_upper: number;
}

export interface PairedBootstrapDifference {
  baseline: number;
  tuned: number;
  abs_difference: number;
  rel_pct_change: number;
  ci_lower: number;
  ci_upper: number;
  p_value_empirical: number;
  statistically_significant: boolean;
}

export interface FeatureStatGroup {
  mean: number;
  std: number;
  median: number;
  min: number;
  max: number;
  q25?: number;
  q75?: number;
}

export interface FeatureMetadata {
  name: string;
  category: string;
  group: "mean" | "se" | "worst";
  overall: FeatureStatGroup;
  benign: FeatureStatGroup;
  malignant: FeatureStatGroup;
}

export interface DatasetStatistics {
  total_samples: number;
  n_features: number;
  class_distribution: {
    malignant_count: number;
    malignant_pct: number;
    benign_count: number;
    benign_pct: number;
    positive_class: string;
    negative_class: string;
  };
  train_samples: number;
  test_samples: number;
  features: string[];
  feature_stats: Record<string, FeatureMetadata>;
  presets: {
    typical_benign: Record<string, number>;
    typical_malignant: Record<string, number>;
    borderline_ambiguous: Record<string, number>;
  };
}

export interface TopFeatureImportance {
  rank: number;
  feature_index: number;
  feature_name: string;
  category: string;
  mean_abs_shap: number;
  direction: "positive" | "negative";
  correlation_with_malignancy: number;
  clinical_significance: string;
}

export interface LocalExplanationContribution {
  feature: string;
  value: number;
  shap_value: number;
  impact: string;
}

export interface LocalExplanationCase {
  title: string;
  sample_index: number;
  ground_truth: string;
  predicted_class: string;
  malignant_probability: number;
  top_contributions: LocalExplanationContribution[];
}

export interface ShapSummary {
  model_name: string;
  explainer_type: string;
  top_features: TopFeatureImportance[];
  all_feature_importance: Array<{
    feature: string;
    mean_abs_shap: number;
    rank: number;
  }>;
  local_explanations: LocalExplanationCase[];
  disclaimer: string;
}

export interface TuningArtifact {
  winning_model: string;
  original_parameters: Record<string, any>;
  search_space: Record<string, any>;
  best_parameters: Record<string, any>;
  best_cv_roc_auc: number;
  baseline_test_metrics: MetricRecord;
  tuned_test_metrics: MetricRecord;
  paired_differences: Record<string, PairedBootstrapDifference>;
  tuning_summary_narrative: string;
}

export interface ResearchExperimentsData {
  metadata: {
    dataset: string;
    n_samples: number;
    n_features: number;
    test_size: number;
    train_samples: number;
    test_samples: number;
    random_seed: number;
    bootstrap_resamples: number;
    confidence_level: number;
  };
  dataset: DatasetStatistics;
  correlations: {
    features: string[];
    matrix: number[][];
    target_correlation: Record<string, number>;
  };
  models_compared: string[];
  cv_results: Record<string, ModelCVResult>;
  test_evaluations: Record<string, TestEvaluation>;
  model_rankings: ModelRanking[];
  winning_model: string;
  bootstrap_ci: Record<string, BootstrapConfidenceInterval>;
  tuning: TuningArtifact;
  shap: ShapSummary;
}

export interface PredictionResult {
  predicted_class: "Malignant" | "Benign";
  class_label: 0 | 1;
  is_malignant: boolean;
  malignant_probability: number;
  benign_probability: number;
  risk_tier: string;
  model_name: string;
  feature_count: number;
}

export interface LocalFeatureAttribution {
  feature: string;
  input_value: number;
  attribution: number;
  direction: string;
  category: string;
}

export interface ExplanationResult {
  base_probability: number;
  predicted_probability: number;
  predicted_class: string;
  top_attributions: LocalFeatureAttribution[];
  disclaimer: string;
}
