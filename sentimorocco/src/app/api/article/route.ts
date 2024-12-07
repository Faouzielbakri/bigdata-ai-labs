// pages/api/data.js
import crypto from "crypto";
import { NextResponse } from "next/server";

export function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") || ""; // Get search query from the URL
  const date = searchParams.get("date") || ""; // Get search query from the URL

  if (!title || !date) {
    return NextResponse.json(
      { error: "Parameters are required" },
      { status: 400 }
    );
  }

  // Generate a hash as a seed based on the title
  const seed = crypto.createHash("sha256").update(title).digest("hex");

  // Generate deterministic sentiment and engagement data
  const sentimentData = generateSentimentData(seed);
  const engagementData = generateEngagementData(seed, date);

  return NextResponse.json({ sentimentData, engagementData });
}

function generateSentimentData(seed: string) {
  // Use hash values to generate consistent percentages
  const hashNumber = parseInt(seed.slice(0, 8), 16); // Convert first 8 chars of seed to a number
  const total = 100;
  const positive = (hashNumber % 40) + 40; // Between 40 and 80
  const neutral = (hashNumber % 20) + 20; // Between 20 and 40
  const negative = total - positive - neutral;

  return [
    { name: "Positive", value: positive, color: "#4ade80" },
    { name: "Neutral", value: neutral, color: "#94a3b8" },
    { name: "Negative", value: negative, color: "#f87171" },
  ];
}

function generateEngagementData(seed: string, postDate) {
  // Create deterministic dates and values
  const startDate = new Date(postDate);
  const hashNumber = parseInt(seed.slice(8, 16), 16); // Use another slice of the hash for randomness

  const data = [];
  for (let i = 0; i < 5; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i + 1); // Generate dates after the post date

    data.push({
      date: date.toISOString().split("T")[0], // Format as YYYY-MM-DD
      positive: (hashNumber % 30) + 30 + i, // Incremental values for positive
      neutral: (hashNumber % 20) + 10 + i, // Neutral values
      negative: (hashNumber % 10) + 5 + i, // Negative values
    });
  }

  return data;
}
