import { NextResponse } from "next/server";
import { researchData } from "@/lib/research-data";

export async function GET() {
  return NextResponse.json({
    winning_model: researchData.winning_model,
    model_rankings: researchData.model_rankings,
    cv_results: researchData.cv_results,
    test_evaluations: researchData.test_evaluations,
    bootstrap_ci: researchData.bootstrap_ci,
  });
}
