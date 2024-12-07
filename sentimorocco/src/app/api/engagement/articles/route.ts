import { NextResponse } from "next/server";
import client from "@/utils/elasticsearch";

export async function GET() {
  try {
    const result = await client.search({
      index: "hespress_articles",
      size: 5, // Top 5 articles
      body: {
        query: { match_all: {} },
        sort: [
          {
            _script: {
              type: "number",
              script: {
                source:
                  "params['_source']['comments'] == null ? 0 : params['_source']['comments'].size()",
              },
              order: "desc",
            },
          },
        ],
        _source: ["title", "href", "img_url", "comments", "category", "date"],
      },
    });

    const articles = result.hits.hits.map((hit) => {
      const comments = hit._source.comments || [];

      // Count sentiments
      const sentimentCounts = comments.reduce(
        (acc, comment) => {
          const label = comment.label?.toLowerCase(); // Handle case sensitivity
          if (label === "positive") acc.positive++;
          else if (label === "neutral") acc.neutral++;
          else if (label === "negative") acc.negative++;
          return acc;
        },
        { positive: 0, neutral: 0, negative: 0 }
      );

      return {
        title: hit._source.title,
        href: hit._source.href,
        img_url: hit._source?.img_url,
        category: hit._source?.category,
        date: hit._source?.date,
        commentCount: comments.length,
        sentiments: sentimentCounts, // Add sentiment counts
      };
    });

    return NextResponse.json({ topArticles: articles });
  } catch (error) {
    console.error("Error fetching top articles by engagement:", error);
    return NextResponse.json(
      { error: "Failed to fetch top articles by engagement" },
      { status: 500 }
    );
  }
}
