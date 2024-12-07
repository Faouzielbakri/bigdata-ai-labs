"use client";
import { useEffect, useState } from "react";
import { TopArticles } from "@/components/analytics/top-articles";
import { TopComments } from "@/components/analytics/top-comments";
import { SentimentTrends } from "@/components/analytics/sentiment-trends";
import { CalendarDateRangePicker } from "@/components/date-range-picker";
import {
  Article,
  Comment,
  SentimentTrend,
  fetchMostEngagingComments,
  fetchSentimentTrends,
  fetchTopArticles,
} from "@/lib/utils";

type DateRange = { from: Date; to: Date };

export function Analytics() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const [topArticles, setTopArticles] = useState<Article[]>();
  const [topComments, setTopComments] = useState<Comment[]>();
  const [sentimentTrends, setSentimentTrends] = useState<SentimentTrend[]>();

  useEffect(() => {
    (async () => {
      setTopArticles(await fetchTopArticles());
      setTopComments(await fetchMostEngagingComments());
      setSentimentTrends(await fetchSentimentTrends());
    })();
  }, []);

  useEffect(() => {
    console.log(topArticles);
    console.log(topComments);
    console.log(sentimentTrends);
  }, [topArticles, topComments, sentimentTrends]);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Hall of Fame</h2>
        <div className="flex items-center space-x-2">
          {/* @ts-expect-error idkwhy  */}
          <CalendarDateRangePicker date={dateRange} setDate={setDateRange} />
        </div>
      </div>

      <div className="space-y-4">
        <SentimentTrends
          dateRange={dateRange}
          sentimentTrends={sentimentTrends}
        />
        <TopArticles dateRange={dateRange} topArticles={topArticles} />

        <TopComments dateRange={dateRange} topComments={topComments} />

        {/* <TabsList>
          <TabsTrigger value="articles">Top Articles</TabsTrigger>
          <TabsTrigger value="comments">Top Comments</TabsTrigger>
          <TabsTrigger value="trends">Sentiment Trends</TabsTrigger>
        </TabsList>
        <TabsContent value="articles" className="space-y-4">
        </TabsContent>
        <TabsContent value="comments" className="space-y-4">
        </TabsContent>
        <TabsContent value="trends" className="space-y-4">
          
        </TabsContent> */}
      </div>
    </div>
  );
}
