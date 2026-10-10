import { NextRequest, NextResponse } from "next/server";
import { predictSample } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const features = body.features;
    if (!features || typeof features !== "object") {
      return NextResponse.json({ error: "Invalid features payload" }, { status: 400 });
    }
    const result = await predictSample(features);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Prediction calculation error" }, { status: 500 });
  }
}
