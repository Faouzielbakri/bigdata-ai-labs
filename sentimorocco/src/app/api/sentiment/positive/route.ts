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
                  },
                },
              },
            },
          },
        },
      },
    });

    // Extract positive comments count
    const positiveCount =
      // @ts-expect-error idk why
      result.aggregations?.comments_by_label.labels.buckets.positive
        .doc_count || 0;

    return NextResponse.json({ positiveCount });
  } catch (error) {
    console.error("Error fetching positive sentiment percentage:", error);
    return NextResponse.json(
      { error: "Failed to fetch positive sentiment percentage" },
      { status: 500 }
    );
  }
}
