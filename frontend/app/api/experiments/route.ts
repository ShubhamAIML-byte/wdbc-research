import { NextResponse } from "next/server";
import { researchData } from "@/lib/research-data";

export async function GET() {
  return NextResponse.json({
    tuning: researchData.tuning,
    metadata: researchData.metadata,
    winning_model: researchData.winning_model,
  });
}
