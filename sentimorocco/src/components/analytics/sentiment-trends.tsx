"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SentimentTrend } from "@/lib/utils";
import Loading from "../Loading";

interface SentimentTrendsProps {
  dateRange: { from: Date; to: Date } | undefined;
  sentimentTrends: SentimentTrend[] | undefined;
}

export function SentimentTrends({
  dateRange,
  sentimentTrends,
}: SentimentTrendsProps) {
  if (!sentimentTrends) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sentiment Trends</CardTitle>
          <CardDescription>Track sentiment changes over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-40">
            <Loading />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Transform data for the LineChart
  const data = sentimentTrends.map((item) => ({
    date: item.month, // Use month as the x-axis label
    positive: item.positive,
    neutral: item.neutral,
    negative: item.negative,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sentiment Trends</CardTitle>
        <CardDescription>Track sentiment changes over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <XAxis
              dataKey="date"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="positive"
              stroke="#4ade80"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="neutral"
              stroke="#94a3b8"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="negative"
              stroke="#f87171"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
