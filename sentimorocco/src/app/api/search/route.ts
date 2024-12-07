import { NextResponse } from "next/server";
import client from "@/utils/elasticsearch";
import axios from "axios";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query") || ""; // Get search query from the URL

  if (!query) {
    return NextResponse.json(
      { error: "Query parameter is required" },
      { status: 400 }
    );
  }

  const isLink = (query: string): boolean =>
    /^(https?:\/\/|www\.)[^\s]+$/.test(query);

  try {
    if (!isLink(query)) {
      // Elasticsearch search by title
      const result = await client.search({
        index: "hespress_articles",
        body: {
          query: {
            match: {
              title: query, // Search by title
            },
          },
          _source: ["title", "href", "category", "date", "img_url", "comments"], // Fields to include in the response
        },
      });

      const articles = result.hits.hits.map((hit: any) => hit._source); // Extract _source from hits
      return NextResponse.json({ articles });
    } else {
      // API call to scrape article
      const scrapeResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/scrape`,
        {
          params: { url: query }, // Send the URL as a query parameter
        }
      );

      if (scrapeResponse.status !== 200) {
        return NextResponse.json(
          { error: "Failed to scrape the article" },
          { status: scrapeResponse.status }
        );
      }

      const article = scrapeResponse.data;
      return NextResponse.json({ article });
    }
  } catch (error) {
    console.error("Error processing the request:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
