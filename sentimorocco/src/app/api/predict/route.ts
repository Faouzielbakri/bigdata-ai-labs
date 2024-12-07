import fs from "fs";
import path from "path";
import * as tensorflow from "@tensorflow/tfjs-node";
import pickle from "picklejs";
import { NextResponse } from "next/server";

// Constants
const MODEL_PATH = path.join(
  process.cwd(),
  "public",
  "sixth",
  "v1",
  "sentiment_model.h5"
);
const TOKENIZER_PATH = path.join(
  process.cwd(),
  "public",
  "sixth",
  "v1",
  "tokenizer.pkl"
);
const LABEL_ENCODER_PATH = path.join(
  process.cwd(),
  "public",
  "sixth",
  "v1",
  "label_encoder.pkl"
);
const MAX_SEQUENCE_LENGTH = 500;

export const runtime = "nodejs";

// Load resources
let model;
let tokenizer;
let labelEncoder;

const loadResources = async () => {
  if (!model) {
    console.log("Loading model...");
    model = await tensorflow.loadLayersModel(`file://${MODEL_PATH}`);
  }

  if (!tokenizer) {
    console.log("Loading tokenizer...");
    const tokenizerBuffer = fs.readFileSync(TOKENIZER_PATH);
    tokenizer = pickle.loads(tokenizerBuffer);
  }

  if (!labelEncoder) {
    console.log("Loading label encoder...");
    const labelEncoderBuffer = fs.readFileSync(LABEL_ENCODER_PATH);
    labelEncoder = pickle.loads(labelEncoderBuffer);
  }
};

// Custom Arabic tokenizer
const tokenizeArabic = (text) => {
  // Split text into words based on whitespace
  return text.split(/\s+/).filter(Boolean);
};

// Clean text utility function
const cleanText = (text) => {
  const ARABIC_STOP_WORDS = new Set([
    "و",
    "في",
    "على",
    "من",
    "إلى",
    "عن",
    "أن",
    "مع",
    "كان",
    "هذا",
    "التي",
    "الا",
  ]);
  const NEGATION_WORDS = new Set([
    "لا",
    "ليس",
    "لم",
    "لن",
    "ما",
    "بدون",
    "غير",
  ]);

  text = text.replace(/[إأآا]/g, "ا");
  text = text.replace(/ة/g, "ه");
  text = text.replace(/ء/g, "");
  text = text.replace(/[\u0617-\u061A\u064B-\u0652]/g, "");
  text = text.replace(/_/g, "");
  text = text.replace(/[^\w\s]/g, " ").replace(/([^\w\s])\1+/g, "$1");

  const tokens = tokenizeArabic(text);
  const filteredTokens = tokens
    .map((word) => (NEGATION_WORDS.has(word) ? `${word}_NOT` : word))
    .filter((word) => !ARABIC_STOP_WORDS.has(word));

  return filteredTokens.join(" ");
};

// Predict sentiment
const predictSentiment = async (comment) => {
  // Clean and preprocess the input
  const cleanedComment = cleanText(comment);
  const sequences = tokenizer.texts_to_sequences([cleanedComment]);
  const paddedSequences = tensorflow.util.padSequences(
    sequences,
    MAX_SEQUENCE_LENGTH
  );

  // Predict sentiment
  const predictions = model.predict(tensorflow.tensor(paddedSequences));
  const predictedClass = predictions.argMax(1).dataSync()[0];
  const sentiment = labelEncoder.inverse_transform([predictedClass]);

  return {
    sentiment: sentiment[0],
    confidence: predictions.max().dataSync()[0],
  };
};

// Main API handler
export async function POST(request) {
  try {
    const body = await request.json();
    const { comment } = body;

    if (!comment) {
      return NextResponse.json(
        { error: "Comment is required." },
        { status: 400 }
      );
    }

    // Load model and resources
    await loadResources();

    // Get prediction
    const prediction = await predictSentiment(comment);

    return NextResponse.json(prediction, { status: 200 });
  } catch (error) {
    console.error("Error processing prediction:", error.message);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
