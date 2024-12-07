import { NextResponse } from "next/server";
import client from "@/utils/elasticsearch";

export async function GET() {
  try {
    const result = await client.search({
      index: "hespress_articles",
      size: 0,
      body: {
        aggs: {
          comments_by_label: {
            nested: {
              path: "comments",
            },
            aggs: {
              labels: {
                filters: {
                  filters: {
                    positive: { match: { "comments.label": "positive" } },
                    neutral: { match: { "comments.label": "neutral" } },
                    negative: { match: { "comments.label": "negative" } },
                  },
                },
              },
            },
          },
        },
      },
    });

    const sentimentDistribution =
      // @ts-expect-error idk why
      result.aggregations?.comments_by_label.labels.buckets;

    return NextResponse.json({ sentimentDistribution });
  } catch (error) {
    console.error("Error fetching sentiment distribution:", error);
    return NextResponse.json(
      { error: "Failed to fetch sentiment distribution" },
      { status: 500 }
    );
  }
}
