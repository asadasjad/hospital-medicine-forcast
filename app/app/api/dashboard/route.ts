import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

type Prediction = {
  forecast_date: string;
  category_code: string;
  predicted_demand: string;
};

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"') {
      if (quoted && line[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      values.push(value);
      value = "";
    } else {
      value += character;
    }
  }

  values.push(value);
  return values;
}

export async function GET() {
  try {
    const projectRoot = path.resolve(process.cwd(), "..");
    const [predictionsCsv, recommendationsJson] = await Promise.all([
      fs.readFile(path.join(projectRoot, "output", "predictions.csv"), "utf-8"),
      fs.readFile(
        path.join(projectRoot, "output", "inventory_recommendations.json"),
        "utf-8",
      ),
    ]);

    const [headerLine, ...dataLines] = predictionsCsv.trim().split(/\r?\n/);
    if (!headerLine) throw new Error("Predictions CSV is empty.");
    const headers = parseCsvLine(headerLine).map((header) => header.trim());
    const predictions = dataLines
      .filter((line) => line.trim().length > 0)
      .map((line) => {
        const values = parseCsvLine(line);
        return Object.fromEntries(
          headers.map((header, index) => [header, values[index]?.trim() ?? ""]),
        ) as Prediction;
      });
    const recommendations: unknown = JSON.parse(recommendationsJson);

    if (predictions.length === 0 || !Array.isArray(recommendations)) {
      throw new Error("Generated dashboard data is missing or invalid.");
    }

    return NextResponse.json({ predictions, recommendations });
  } catch (error) {
    console.error("Dashboard data error:", error);
    return NextResponse.json(
      { error: "Unable to load dashboard data." },
      { status: 500 },
    );
  }
}
