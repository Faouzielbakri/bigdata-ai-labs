// /app/api/scraper/route.ts
import { NextResponse } from "next/server";
import axios from "axios";
import { JSDOM } from "jsdom";
import { Comment, countWordOccurrences } from "@/lib/utils";

interface Article {
  href: string;
  img_url: string | null;
  title: string | null;
  date: string | null;
  category: string | null;
  content: string;
  contentWordCloud: [string, number][];
  comments: Comment[];
}

export const GET = async (req: Request) => {
  try {
    // Extract the URL from query parameters
    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json(
        { error: 'Missing "url" query parameter' },
        { status: 400 }
      );
    }

    // Fetch the HTML content of the provided article URL
    const response = await axios.get(url, {
      headers: {
        accept: "*/*",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8,ar;q=0.7",
        priority: "u=1, i",
        referer: "https://www.hespress.com",
        "sec-ch-ua":
          '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
        "sec-ch-ua-mobile": "?1",
        "sec-ch-ua-platform": '"Android"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "user-agent":
          "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36",
        "x-requested-with": "XMLHttpRequest",
      },
    });

    const dom = new JSDOM(response.data);
    const document = dom.window.document;

    console.log("scrapping request");

    // Scrape article metadata
    const titleElement =
      document.querySelector<HTMLAnchorElement>("a.stretched-link");
    const imgElement = document.querySelector<HTMLImageElement>("img");
    const timeElement = document.querySelector<HTMLElement>(
      "small.text-muted.time"
    );
    const categorySpan = document.querySelector<HTMLSpanElement>("span.cat");

    const article: Article = {
      href: url,
      img_url: imgElement ? imgElement.src : null,
      title: titleElement ? titleElement.title : null,
      date: timeElement ? timeElement.textContent?.trim() || null : null,
      category: categorySpan
        ? `${categorySpan.classList[1] || "unknown"}-${
            categorySpan.textContent?.trim() || ""
          }`
        : "unknown",
      content: "",
      contentWordCloud: [],
      comments: [],
    };

    // Scrape article content
    const articleContentDiv =
      document.querySelector<HTMLElement>(".article-content");
    if (articleContentDiv) {
      const paragraphs =
        articleContentDiv.querySelectorAll<HTMLParagraphElement>("p");
      article.content = Array.from(paragraphs)
        .map((p) => p.textContent?.trim() || "")
        .filter((text) => text)
        .join("\n");

      // Generate WordCloud list
      article.contentWordCloud = countWordOccurrences(article.content);
    }

    // Scrape comments
    const commentsList = document.querySelector<HTMLElement>("ul.comment-list");
    if (commentsList) {
      const commentElements =
        commentsList.querySelectorAll<HTMLLIElement>("li.comment");
      article.comments = Array.from(commentElements).map((commentElement) => {
        const id = commentElement.id || null;
        const author =
          commentElement
            .querySelector<HTMLElement>(".fn")
            ?.textContent?.trim() || null;
        const date =
          commentElement
            .querySelector<HTMLElement>(".comment-date")
            ?.textContent?.trim() || null;
        const text =
          commentElement
            .querySelector<HTMLElement>(".comment-text")
            ?.textContent?.trim() || null;
        const likes =
          commentElement
            .querySelector<HTMLElement>(".comment-recat-number")
            ?.textContent?.trim() || "0";

        return { id, author, date, text, likes };
      });
    }

    // Return the scraped article
    return NextResponse.json({ article });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to scrape the article or comments" },
      { status: 500 }
    );
  }
};

// Utility function to generate word frequency list for WordCloud
function generateWordCloudData(content: string): [string, number][] {
  const words = content
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "") // Remove punctuation
    .split(/\s+/); // Split by whitespace

  const frequencyMap: Record<string, number> = {};

  words.forEach((word) => {
    if (word.length > 2) {
      frequencyMap[word] = (frequencyMap[word] || 0) + 1;
    }
  });

  // Convert to [word, frequency] array and sort by frequency
  const wordCloudData: [string, number][] = Object.entries(frequencyMap).sort(
    (a, b) => b[1] - a[1]
  );

  return wordCloudData;
}
