import { NextResponse } from "next/server";
import client from "@/utils/elasticsearch";

interface SentimentTrend {
  month: string; // e.g., "2024-02"
  positive: number;
  neutral: number;
  negative: number;
}

export async function GET() {
  try {
    const result = await client.search({
      index: "hespress_articles",
      size: 0,
      body: {
        aggs: {
          comments_by_month: {
            nested: {
              path: "comments",
            },
            aggs: {
              months: {
                date_histogram: {
                  field: "comments.date",
                  calendar_interval: "month",
                  format: "yyyy-MM",
                },
                aggs: {
                  positive: {
                    filter: { match: { "comments.label": "positive" } },
                  },
                  neutral: {
                    filter: { match: { "comments.label": "neutral" } },
                  },
                  negative: {
                    filter: { match: { "comments.label": "negative" } },
                  },
                },
              },
            },
          },
        },
      },
    });

    const sentimentOverview: SentimentTrend[] =
      result.aggregations.comments_by_month.months.buckets.map(
        (bucket: any) => ({
          month: bucket.key_as_string,
          positive: bucket.positive.doc_count,
          neutral: bucket.neutral.doc_count,
          negative: bucket.negative.doc_count,
        })
      );

    return NextResponse.json({ sentimentTrends: sentimentOverview });
  } catch (error) {
    console.error("Error fetching sentiment trends:", error);
    return NextResponse.json(
      { error: "Failed to fetch sentiment trends" },
      { status: 500 }
    );
  }
}
