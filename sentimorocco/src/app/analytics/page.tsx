import ArticleAnalytics from "@/components/analytics/article-analytics";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Article Analytics | SentiMorocco",
  description:
    "In-depth sentiment analysis and insights for individual articles",
};

export default function ArticleAnalyticsPage() {
  return <ArticleAnalytics />;
}
