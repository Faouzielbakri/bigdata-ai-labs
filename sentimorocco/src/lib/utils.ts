import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function getGlobalStats() {
  const totalResponse = await fetch("/api/comments/total");
  const positiveResponse = await fetch("/api/sentiment/positive");

  const total = (await totalResponse.json()).totalComments;
  const positive = (await positiveResponse.json()).positiveCount;

  const percentage = ((positive / total) * 100).toFixed(2);

  return {
    positive,
    total,
    percentage,
  };
}

import axios from "axios";

export async function fetchTotalComments(): Promise<number> {
  try {
    const response = await axios.get("/api/comments/total");
    return response.data.totalComments;
  } catch (error) {
    console.error("Error fetching total comments:", error);
    throw new Error("Failed to fetch total comments");
  }
}

export interface SentimentOverview {
  totalComments: number;
  positivePercentage: string;
  counts: {
    positive: number;
    negative: number;
    neutral: number;
  };
}

export async function fetchSentimentOverview(): Promise<SentimentOverview> {
  try {
    const response = await axios.get("/api/sentiment/overview");
    return response.data.sentimentOverview;
  } catch (error) {
    console.error("Error fetching sentiment overview:", error);
    throw new Error("Failed to fetch sentiment overview");
  }
}

export interface SentimentDistribution {
  positive: number;
  neutral: number;
  negative: number;
}

export async function fetchSentimentDistribution(): Promise<SentimentDistribution> {
  try {
    const response = await axios.get("/api/sentiment/distribution");
    return response.data.sentimentDistribution;
  } catch (error) {
    console.error("Error fetching sentiment distribution:", error);
    throw new Error("Failed to fetch sentiment distribution");
  }
}

export interface Comment {
  id: string;
  author: string;
  date: string;
  text: string;
  label: string;
}

export async function fetchRecentComments(): Promise<Comment[]> {
  try {
    const response = await axios.get("/api/comments/recent");
    return response.data.recentComments;
  } catch (error) {
    console.error("Error fetching recent comments:", error);
    throw new Error("Failed to fetch recent comments");
  }
}

export interface Category {
  key: string;
  doc_count: number;
}

export async function fetchTopCategories(): Promise<Category[]> {
  try {
    const response = await axios.get("/api/category/top");
    return response.data.categories;
  } catch (error) {
    console.error("Error fetching top categories:", error);
    throw new Error("Failed to fetch top categories");
  }
}

export interface MonthlySentiment {
  key_as_string: string;
  positive: { doc_count: number };
  neutral: { doc_count: number };
  negative: { doc_count: number };
}

export async function fetchCommentsByMonth(): Promise<MonthlySentiment[]> {
  try {
    const response = await axios.get("/api/sentiment/positive");
    return response.data.sentimentOverview;
  } catch (error) {
    console.error("Error fetching comments by month:", error);
    throw new Error("Failed to fetch comments by month");
  }
}

// Define the structure for a comment
export interface Comment {
  id: string;
  author: string;
  date: string;
  text: string;
  likes: number;
  label: string;
}

// Define the structure for an article
export interface Article {
  title: string;
  href: string;
  commentCount: number;
  category: string;
  date: string;
  img_url: string;
  sentiments: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

// Define the structure for sentiment trends
export interface SentimentTrend {
  month: string; // Format: yyyy-MM
  positive: number;
  neutral: number;
  negative: number;
}

// Define the API response shapes
export interface TopArticlesResponse {
  topArticles: Article[];
}

export interface MostEngagingCommentsResponse {
  mostEngagingComments: Comment[];
}

export interface SentimentTrendsResponse {
  sentimentTrends: SentimentTrend[];
}

export async function fetchTopArticles(): Promise<Article[]> {
  const response = await axios.get<TopArticlesResponse>(
    "/api/engagement/articles"
  );
  return response.data.topArticles;
}

export async function fetchMostEngagingComments(): Promise<Comment[]> {
  const response = await axios.get<MostEngagingCommentsResponse>(
    "/api/engagement/comments"
  );
  return response.data.mostEngagingComments;
}

export async function fetchSentimentTrends(): Promise<SentimentTrend[]> {
  const response = await axios.get<SentimentTrendsResponse>(
    "/api/sentiment/trends"
  );
  return response.data.sentimentTrends;
}

export function countWordOccurrences(text: string): [string, number][] {
  // Normalize the text: lowercase and remove punctuation
  const words = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "") // Remove non-letter, non-number, non-space characters (supports Unicode)
    .split(/\s+/) // Split by whitespace
    .filter((word) => word.length > 3); // Remove empty strings

  // Count occurrences using a frequency map
  const frequencyMap: Record<string, number> = {};
  words.forEach((word) => {
    frequencyMap[word] = (frequencyMap[word] || 0) + 1;
  });

  // Convert to a list of [word, occurrence] pairs
  return Object.entries(frequencyMap).sort((a, b) => b[1] - a[1]); // Sort by frequency descending
}
