import { Metadata } from "next";
import { Analytics } from "@/components/analytics/analytics";

export const metadata: Metadata = {
  title: "Analytics | SentiMorocco",
  description: "In-depth sentiment analysis and insights",
};

export default function AnalyticsPage() {
  return <Analytics />;
}
