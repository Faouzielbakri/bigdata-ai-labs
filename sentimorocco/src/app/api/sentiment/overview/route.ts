import { NextResponse } from "next/server";
import client from "@/utils/elasticsearch";

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
                    filter: {
                      nested: {
                        path: "comments",
                        query: {
                          match: { "comments.label": "positive" },
                        },
                      },
                    },
                  },
                  neutral: {
                    filter: {
                      nested: {
                        path: "comments",
                        query: {
                          match: { "comments.label": "neutral" },
                        },
                      },
                    },
                  },
                  negative: {
                    filter: {
                      nested: {
                        path: "comments",
                        query: {
                          match: { "comments.label": "negative" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const sentimentOverview =
      // @ts-expect-error idk why
      result.aggregations?.comments_by_month.months.buckets;

    return NextResponse.json({ sentimentOverview });
  } catch (error) {
    console.error("Error fetching sentiment overview:", error);
    return NextResponse.json(
      { error: "Failed to fetch sentiment overview" },
      { status: 500 }
    );
  }
}
