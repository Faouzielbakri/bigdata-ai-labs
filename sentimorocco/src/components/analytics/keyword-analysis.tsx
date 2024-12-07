"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface KeywordAnalysisProps {
  dateRange: { from: Date; to: Date };
}

export function KeywordAnalysis({ dateRange }: KeywordAnalysisProps) {
  // Sample data - in real app, fetch based on dateRange
  const positiveKeywords = [
    { keyword: "development", count: 245 },
    { keyword: "progress", count: 189 },
    { keyword: "innovation", count: 156 },
    // Add more keywords...
  ];

  const negativeKeywords = [
    { keyword: "delay", count: 178 },
    { keyword: "expensive", count: 145 },
    { keyword: "difficult", count: 134 },
    // Add more keywords...
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Keyword Analysis</CardTitle>
        <CardDescription>
          Most frequent terms in positive and negative comments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="positive" className="space-y-4">
          <TabsList>
            <TabsTrigger value="positive">Positive Keywords</TabsTrigger>
            <TabsTrigger value="negative">Negative Keywords</TabsTrigger>
          </TabsList>
          <TabsContent value="positive">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={positiveKeywords}>
                <XAxis dataKey="keyword" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#4ade80" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
          <TabsContent value="negative">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={negativeKeywords}>
                <XAxis dataKey="keyword" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#f87171" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
