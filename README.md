# Breast Cancer AI Research Lab: WDBC Benchmark & Platform

> **Production-Quality Medical Machine Learning Research Website & API**  
> *Comparative Machine Learning, Statistical Evaluation, and Explainable AI on the Wisconsin Diagnostic Breast Cancer (WDBC) Dataset.*

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FShubhamAIML-byte%2Fwdbc-research)
[![CI & Deployment Verification](https://github.com/ShubhamAIML-byte/wdbc-research/actions/workflows/ci.yml/badge.svg)](https://github.com/ShubhamAIML-byte/wdbc-research/actions/workflows/ci.yml)
[![GitHub Repository](https://img.shields.io/badge/GitHub-ShubhamAIML--byte%2Fwdbc--research-181717?logo=github)](https://github.com/ShubhamAIML-byte/wdbc-research)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Scikit-Learn](https://img.shields.io/badge/scikit--learn-1.4-orange?logo=scikit-learn)](https://scikit-learn.org/)
[![XGBoost](https://img.shields.io/badge/XGBoost-2.0-red)](https://xgboost.readthedocs.io/)
[![SHAP](https://img.shields.io/badge/SHAP-0.45-blueviolet)](https://shap.readthedocs.io/)
[![Vercel Ready](https://img.shields.io/badge/Vercel-24%2F7_CI%2FCD-success?logo=vercel)](https://vercel.com/)

---

## 1. Executive Summary

This repository provides an end-to-end, reproducible biomedical research website and API evaluating 3 machine learning algorithms on the Wisconsin Diagnostic Breast Cancer (WDBC) fine-needle aspirate (FNA) dataset ($N=569$, $D=30$ continuous features):
1. **Random Forest Classifier**
2. **Support Vector Machine (SVM with RBF Kernel)**
3. **Extreme Gradient Boosting (XGBoost Classifier)**

### Key Empirical Results:
- **Winning Candidate**: **Support Vector Machine (RBF)**, selected via highest Stratified 5-Fold Cross-Validation ROC-AUC of **0.9949 ± 0.0050** (F1-score: **0.9610**).
- **Held-Out Test Set Performance ($N=114$)**:
  - Baseline Test ROC-AUC: **0.9947** | Baseline Accuracy: **97.37%** | Sensitivity (Recall): **92.86%**
  - Tuned Test ROC-AUC: **0.9974** | Tuned Accuracy: **98.25%** | Sensitivity (Recall): **95.24%**
- **Non-Parametric Statistical Inference**:
  - **3,000 Stratified Bootstrap Resamples** for held-out test confidence intervals (95% CI).
  - **Paired Bootstrap Hypothesis Testing** evaluating baseline-versus-tuned differences ($\Delta_b = \text{Metric}_{tuned, b} - \text{Metric}_{baseline, b}$).
- **Explainability**:
  - Global Shapley feature importance (mean absolute SHAP) ranking all 30 features.
  - Interactive prediction explanations linking nuclear morphometry (concavity, area, radius) to predicted risk.

---

## 2. Experimental Benchmark Summary

### A. Stratified 5-Fold Cross-Validation (Training Partition, $N=455$)

| Model Architecture | 5-Fold CV ROC-AUC | 5-Fold CV Accuracy | 5-Fold CV F1-Score | 5-Fold CV Recall | Selection Status |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Support Vector Machine (RBF)** | **0.9949 ± 0.0050** | **97.14% ± 1.2%** | **0.9610 ± 0.018** | **93.53% ± 3.4%** | **Champion (Rank 1)** |
| **XGBoost Classifier** | 0.9924 ± 0.0048 | 97.14% ± 1.2% | 0.9611 ± 0.016 | 94.12% ± 3.2% | Candidate (Rank 2) |
| **Random Forest Classifier** | 0.9889 ± 0.0067 | 96.48% ± 1.4% | 0.9519 ± 0.019 | 92.94% ± 3.5% | Candidate (Rank 3) |

---

### B. 95% Stratified Bootstrap Confidence Intervals (Untouched Test Cohort, $B = 3,000$)

Evaluated on the held-out test partition (72 Benign, 42 Malignant):

| Evaluation Metric | Test Point Estimate | Bootstrap Mean (B=3000) | Standard Error (SE) | 95% Confidence Interval |
| :--- | :---: | :---: | :---: | :---: |
| **ROC-AUC** | **0.9947** | 0.9948 | 0.0047 | **[0.9831, 1.0000]** |
| **Accuracy** | **0.9737** | 0.9734 | 0.0148 | **[0.9386, 1.0000]** |
| **Recall / Sensitivity** | **0.9286** | 0.9288 | 0.0403 | **[0.8333, 1.0000]** |
| **Specificity** | **1.0000** | 0.9997 | 0.0019 | **[1.0000, 1.0000]** |
| **Precision** | **1.0000** | 0.9996 | 0.0031 | **[1.0000, 1.0000]** |
| **F1-Score** | **0.9630** | 0.9622 | 0.0219 | **[0.9091, 1.0000]** |
| **Matthews Corr (MCC)** | **0.9442** | 0.9439 | 0.0311 | **[0.8715, 1.0000]** |

---

### C. Hyperparameter Optimization & Paired Bootstrap Test ($B = 3,000$)

GridSearchCV on SVM ($125$ fits across 5 stratified folds):
- **Search Space**: $C \in [0.1, 1.0, 5.0, 10.0, 50.0]$, $\gamma \in [\text{'scale'}, \text{'auto'}, 0.01, 0.005, 0.001]$, $\text{kernel} = \text{'rbf'}$
- **Optimal Hyperparameters**: `C = 5.0`, `gamma = 0.01`, `kernel = 'rbf'`
- **Validation Gain**: CV ROC-AUC improved from $0.9949 \rightarrow 0.9957$.
- **Test Set Gains**:
  - Test Accuracy: $97.37\% \rightarrow \mathbf{98.25\%}$ ($+0.88\%$)
  - Test Recall: $92.86\% \rightarrow \mathbf{95.24\%}$ ($+2.38\%$)
  - Test ROC-AUC: $0.9947 \rightarrow \mathbf{0.9974}$ ($+0.27\%$)
- **95% Paired Bootstrap Difference**: $\Delta_{\text{AUC}} = [+0.0000, +0.0089]$.  
  *Honest Reporting*: Because baseline performance was already near-ceiling, the lower bound includes 0 at $\alpha=0.05$. We present these exact measured differences transparently without inflated claims of statistical superiority.

---

## 3. Technology Stack

### Frontend Application
- **Framework**: Next.js 14 (App Router) with React 18 and TypeScript
- **Styling**: Tailwind CSS with clinical healthcare palette (Navy, Teal, Cyan)
- **Charts**: Recharts & SVG vectors (ROC curves, PR curves, Confusion matrices, SHAP bars)
- **Icons**: Lucide React
- **Design System**: Responsive sidebar, accessible contrast, mobile drawer, instant tooltips

### Machine Learning & Backend
- **Core Engine**: Python 3.11+, Scikit-learn, XGBoost, NumPy, Pandas, SciPy, Joblib
- **Explainability**: SHAP (SHapley Additive exPlanations)
- **API**: FastAPI with Pydantic v2 schemas and CORS middleware
- **Serverless Dual-Mode**: Next.js native API handlers with instant offline edge inference + optional remote FastAPI proxy

---

## 4. Repository Structure

```
wdbc-research/
├── frontend/
│   ├── app/
│   │   ├── api/                   # Next.js native Edge REST API routes
│   │   │   ├── health/route.ts
│   │   │   ├── metrics/route.ts
│   │   │   ├── experiments/route.ts
│   │   │   ├── features/route.ts
│   │   │   ├── predict/route.ts
│   │   │   └── explain/route.ts
│   │   ├── comparison/page.tsx    # 3-Model Benchmark & Confusion Matrices
│   │   ├── confidence-intervals/  # 3k Bootstrap CIs & Statistical Theory
│   │   ├── dataset/page.tsx       # 30-Feature Registry & Distributions
│   │   ├── explainability/page.tsx# Global & Local SHAP Attributions
│   │   ├── methodology/page.tsx   # Mathematical Derivations & Protocol
│   │   ├── prediction/page.tsx    # Real-time 30-Feature Diagnostic Lab
│   │   ├── tuning/page.tsx        # GridSearchCV & Paired Difference Tests
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx               # Executive Overview Dashboard
│   ├── components/
│   │   ├── layout/                # Sidebar, AppHeader, AppShell
│   │   └── ui/                    # Card, Badge, TooltipInfo, Disclaimer
│   ├── lib/
│   │   ├── api.ts                 # Dual-mode client SDK
│   │   ├── research-data.json     # Serialized offline experiment results
│   │   ├── research-data.ts       # Typed accessors and formatting helpers
│   │   └── types.ts               # Complete TypeScript interface definitions
│   ├── package.json
│   ├── next.config.mjs
│   ├── tailwind.config.ts
│   └── vercel.json
├── backend/
│   ├── api/
│   │   └── main.py                # FastAPI microservice
│   ├── models/                    # Serialized joblib estimators
│   │   ├── best_tuned_model.joblib
│   │   ├── rf_baseline.joblib
│   │   ├── svm_baseline.joblib
│   │   ├── xgb_baseline.joblib
│   │   └── scaler.joblib
│   ├── results/                   # Complete JSON research artifacts
│   │   ├── experiment_summary.json
│   │   ├── bootstrap_ci.json
│   │   ├── dataset_stats.json
│   │   ├── model_comparison.json
│   │   ├── shap_summary.json
│   │   └── tuning_results.json
│   ├── src/                       # Modular source code
│   │   ├── loader.py
│   │   ├── models.py
│   │   └── evaluation.py
│   └── requirements.txt
├── experiments/
│   └── run_experiments.py         # 100% reproducible offline pipeline
├── README.md
└── .gitignore
```

---

## 5. Local Setup & Execution Guide

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+ and pip

### Step 1: Re-running Offline Experiments (Optional)
To regenerate all models, bootstrap intervals, and JSON artifacts from scratch:
```bash
python experiments/run_experiments.py
```

### Step 2: Running the FastAPI Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
```
Interactive API docs available at: `http://localhost:8000/docs`

### Step 3: Running the Next.js Frontend
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 6. Step-by-Step Vercel Deployment Guide

The frontend application is built for 1-click deployment on [Vercel](https://vercel.com):

### Option A: Standard Vercel Git Integration
1. Push this repository to your GitHub account:
   ```bash
   git init
   git add .
   git commit -m "feat: complete WDBC research platform"
   git remote add origin https://github.com/YOUR_USERNAME/wdbc-research.git
   git push -u origin main
   ```
2. Log into **Vercel** (`https://vercel.com`) and click **Add New... -> Project**.
3. Import your `wdbc-research` repository.
4. In the configuration dialog:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click *Edit* and select `frontend`!
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
5. Environment Variables:
   - If hosting FastAPI separately (e.g. Render/Railway): Set `NEXT_PUBLIC_API_URL` to your backend URL (e.g. `https://wdbc-api.onrender.com`).
   - If deploying 100% serverless on Vercel: Leave `NEXT_PUBLIC_API_URL` empty! The embedded Next.js edge runtime serves all data and predictions natively!
6. Click **Deploy**. Vercel will build and launch your site with a live production URL!

---

## 7. Medical Disclaimer

> **Research Prototype Notice**: This software is an educational machine learning benchmark developed for academic comparative analysis and statistical research. It is **not** a clinical diagnostic tool, medical device, or substitute for professional oncology pathology. Never make medical decisions based on algorithmic predictions.
