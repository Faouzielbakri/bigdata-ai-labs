import { NextResponse } from "next/server";
import client from "@/utils/elasticsearch";

export async function GET() {
  try {
    const result = await client.search({
      index: "hespress_articles",
      size: 5, // Top 5 comments
      body: {
        query: {
          nested: {
            path: "comments",
            query: {
              match_all: {},
            },
          },
        },
        sort: [
          {
            "comments.likes": {
              order: "desc",
              nested: {
                path: "comments",
              },
            },
          },
        ],
        _source: ["comments", "category", "title"], // Include category and title in the response
      },
    });

    // Process the results
    const comments = result.hits.hits.flatMap((hit) =>
      hit._source.comments
        .sort((a, b) => b.likes - a.likes) // Sort comments by likes
        .slice(0, 1) // Take the most liked comment
        .map((comment) => ({
          ...comment,
          category: hit._source.category, // Add the category to the comment
          title: hit._source.title, // Add the title of the article
        }))
    );

    return NextResponse.json({ mostEngagingComments: comments });
  } catch (error) {
    console.error("Error fetching most engaging comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch most engaging comments" },
      { status: 500 }
    );
  }
}
