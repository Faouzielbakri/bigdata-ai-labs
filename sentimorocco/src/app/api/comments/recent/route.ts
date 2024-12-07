import { NextResponse } from "next/server";
import client from "@/utils/elasticsearch";

export async function GET() {
  try {
    const result = await client.search({
      index: "hespress_articles",
      size: 5, // Fetch the latest 5 comments
      body: {
        query: {
          nested: {
            path: "comments",
            query: {
              match_all: {},
            },
          },
        },
        _source: ["comments"], // Only fetch the comments field
        sort: [
          {
            "comments.date": {
              order: "desc",
              nested: {
                path: "comments", // Specify the nested context
              },
            },
          },
        ],
      },
    });

    // Extract the recent comments
    const recentComments = result.hits.hits
      // @ts-expect-error idk why
      .map((hit: unknown) => hit._source.comments)
      .flat();

    return NextResponse.json({ recentComments });
  } catch (error) {
    console.error("Error fetching recent comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch recent comments" },
      { status: 500 }
    );
  }
}
