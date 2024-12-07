"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Overview } from "@/components/overview";
import { RecentComments } from "@/components/recent-comments";
import { SentimentDistribution } from "@/components/sentiment-distribution";
import { useEffect, useState } from "react";
import {
  fetchRecentComments,
  fetchSentimentDistribution,
  fetchSentimentOverview,
  fetchTopCategories,
  getGlobalStats,
} from "@/lib/utils";

export default function DashboardPage() {
  const [sentimentOverview, setSentimentOverview] = useState<any>(null);
  const [sentimentDistribution, setSentimentDistribution] = useState<any>(null);
  const [recentComments, setRecentComments] = useState<any[]>([]);
  const [topCategories, setTopCategories] = useState<any[]>([]);
  const [globalStats, setglobalStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function fetchData() {
      try {
        setSentimentOverview(await fetchSentimentOverview());
        setSentimentDistribution(await fetchSentimentDistribution());
        setRecentComments(await fetchRecentComments());
        setTopCategories(await fetchTopCategories());
        setglobalStats(await getGlobalStats());
        setLoading(false);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      }
    }

    fetchData();
  }, []);
  useEffect(() => {
    console.log("sentimentOverview", sentimentOverview);
    console.log("sentimentDistribution", sentimentDistribution);
    console.log("recentComments", recentComments);
    console.log("topCategories", topCategories);
    console.log("perc", globalStats);
  }, [
    sentimentOverview,
    sentimentDistribution,
    recentComments,
    topCategories,
    globalStats,
  ]);

  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold ">Overview</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Comments Analyzed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{globalStats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Positive Sentiment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {globalStats?.percentage || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              +15% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {String(topCategories[0]?.category.split("-")[0])}
            </div>
            <p className="text-xs text-muted-foreground">30% of all comments</p>
          </CardContent>
        </Card>
      </div>
      <div className="relative grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {loading && (
          <div
            style={{
              position: "absolute",

              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(8px)",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              color: "#ffffff",
              fontSize: "24px",
              fontWeight: "bold",
              zIndex: 10,
              borderRadius: "10px",
            }}
            className="w-1/3 aspect-video top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse"
          >
            Loading...
          </div>
        )}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Sentiment Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview sentimentOverview={sentimentOverview} />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Sentiment Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <SentimentDistribution
              sentimentDistribution={sentimentDistribution}
            />
          </CardContent>
        </Card>
      </div>
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Recent Comments</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentComments recentComments={recentComments} />
        </CardContent>
      </Card>
    </div>
  );
}
