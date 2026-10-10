import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";

export const metadata: Metadata = {
  title: "Breast Cancer AI Research Lab | WDBC Machine Learning Platform",
  description:
    "Production-quality breast cancer classification research website comparing Random Forest, SVM, and XGBoost on the WDBC dataset with bootstrap confidence intervals, GridSearchCV tuning, and SHAP explainability.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
