import { NextResponse } from "next/server";
import client from "@/utils/elasticsearch";

export async function GET() {
  try {
    const result = await client.search({
      index: "hespress_articles",
      size: 0,
      body: {
        aggs: {
          total_comments: {
            nested: {
              path: "comments",
            },
            aggs: {
              total: {
                value_count: {
                  field: "comments.id",
                },
              },
            },
          },
        },
      },
    });
    // @ts-expect-error idk why
    const totalComments = result.aggregations?.total_comments.total.value;

    return NextResponse.json({ totalComments });
  } catch (error) {
    console.error("Error fetching total comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch total comments" },
      { status: 500 }
    );
  }
}
