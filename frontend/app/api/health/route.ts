import { NextResponse } from "next/server";
import { researchData } from "@/lib/research-data";

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    service: "WDBC Next.js Research Edge API",
    winning_model: researchData.winning_model,
    feature_count: researchData.metadata.n_features,
    dataset: researchData.metadata.dataset,
    version: "1.0.0",
  });
}
