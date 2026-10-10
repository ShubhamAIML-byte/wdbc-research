import { NextResponse } from "next/server";
import { researchData } from "@/lib/research-data";

export async function GET() {
  return NextResponse.json({
    features: researchData.dataset.features,
    feature_stats: researchData.dataset.feature_stats,
    class_distribution: researchData.dataset.class_distribution,
    presets: researchData.dataset.presets,
  });
}
