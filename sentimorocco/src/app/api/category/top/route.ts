import { NextResponse } from "next/server";
import client from "@/utils/elasticsearch";

export async function GET() {
  try {
    const result = await client.search({
      index: "hespress_articles",
      size: 0,
      body: {
        aggs: {
          categories_aggregation: {
            filters: {
              filters: {
                "politique-سياسة": {
                  query_string: {
                    query: "politique-سياسة",
                    fields: ["category"],
                  },
                },
                "sport-رياضة": {
                  query_string: { query: "sport-رياضة", fields: ["category"] },
                },
                "economie-اقتصاد": {
                  query_string: {
                    query: "economie-اقتصاد",
                    fields: ["category"],
                  },
                },
                "societe-مجتمع": {
                  query_string: {
                    query: "societe-مجتمع",
                    fields: ["category"],
                  },
                },
                "art-et-culture-فن وثقافة": {
                  query_string: {
                    query: "art-et-culture-فن وثقافة",
                    fields: ["category"],
                  },
                },
                "faits-divers-حوادث": {
                  query_string: {
                    query: "faits-divers-حوادث",
                    fields: ["category"],
                  },
                },
                "regions-جهات": {
                  query_string: { query: "regions-جهات", fields: ["category"] },
                },
                "international-خارج الحدود": {
                  query_string: {
                    query: "international-خارج الحدود",
                    fields: ["category"],
                  },
                },
                "sciences-nature-بيئة وعلوم": {
                  query_string: {
                    query: "sciences-nature-بيئة وعلوم",
                    fields: ["category"],
                  },
                },
                "social-media-عين على السوشل ميدي": {
                  query_string: {
                    query: "social-media-عين على السوشل ميدي",
                    fields: ["category"],
                  },
                },
                "medias-السلطة الرابعة": {
                  query_string: {
                    query: "medias-السلطة الرابعة",
                    fields: ["category"],
                  },
                },
                "%d8%b2%d9%88%d9%88%d9%85-زووم": {
                  query_string: {
                    query: "%d8%b2%d9%88%d9%88%d9%85-زووم",
                    fields: ["category"],
                  },
                },
              },
            },
          },
        },
      },
    });

    // Extract and sort categories by document count (descending)
    // @ts-expect-error idk why
    const buckets = result.aggregations?.categories_aggregation.buckets || {};
    const sortedCategories = Object.entries(buckets)
      // @ts-expect-error idk why
      .map(([key, value]) => ({ category: key, count: value.doc_count }))
      .sort((a, b) => b.count - a.count); // Descending order by count

    // Get the top category
    const topCategory = sortedCategories[0];

    return NextResponse.json({ topCategory, categories: sortedCategories });
  } catch (error) {
    console.error("Error fetching top category:", error);
    return NextResponse.json(
      { error: "Failed to fetch top category" },
      { status: 500 }
    );
  }
}
