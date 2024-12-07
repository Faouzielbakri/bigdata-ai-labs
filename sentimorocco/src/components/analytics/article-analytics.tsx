"use client";
import { Fragment, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Search, Download, Share2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Comment } from "@/lib/utils";
import WordCloud from "wordcloud";
import Loading from "../Loading";
import Image from "next/image";
// Sample data - replace with actual data in a real application
// const articleData = {
//   title: "Morocco's Economic Growth Surpasses Expectations",
//   source: "Hespress.com",
//   date: "2024-03-15",
//   thumbnail: "/placeholder.svg?height=100&width=100",
//   wordCount: 1250,
//   category: "Economics",
//   totalComments: 328,
//   likes: 1520,
//   shares: 456,
// };

const sentimentData = [
  { name: "Positive", value: 3, color: "#4ade80" },
  { name: "Neutral", value: 15, color: "#94a3b8" },
  { name: "Negative", value: 180, color: "#f87171" },
];

const engagementData = [
  { date: "Mar 15", positive: 2, neutral: 15, negative: 83 },
  { date: "Mar 16", positive: 3, neutral: 10, negative: 87 },
  { date: "Mar 17", positive: 2, neutral: 12, negative: 86 },
  { date: "Mar 18", positive: 2, neutral: 14, negative: 84 },
  { date: "Mar 19", positive: 3, neutral: 13, negative: 84 },
];

export default function ArticleAnalytics() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultUrl = searchParams.get("query") || ""; // Get the initial URL from query parameters

  const [url, setUrl] = useState<string>(defaultUrl); // State initialized with the URL query parameter
  const [inputData, setInputData] = useState<string>(""); // State initialized with the URL query parameter

  // Fetch data based on the URL
  const { data: articleData, isLoading } = useQuery({
    queryKey: ["articleData", url],
    queryFn: async () => {
      if (!url.trim()) return null;
      const res = await axios.get(`/api/scrape`, {
        params: { url }, // Send the URL as a query parameter
      });
      console.log(res);

      return res.data.article;
    },
    enabled: !!url, // Only fetch if URL exists
  });

  // Effect to update state when the URL changes
  useEffect(() => {
    const currentUrl = searchParams.get("query") || "";
    setUrl(currentUrl);
  }, [searchParams]);

  useEffect(() => {
    if (articleData)
      WordCloud(document.getElementById("wordcloudcanvas"), {
        list: articleData?.contentWordCloud,
        weightFactor: 8,
        minRotation: -1,
        maxRotation: 1,
        rotateRatio: 1,
        // color: "rgba(255, 255, 255,1)",
        backgroundColor: "rgba(0, 0, 0,0)",
      });
  }, [articleData]);

  // Handle analyze button click
  const handleAnalyze = () => {
    setUrl(inputData);
    router.push(`/analytics?query=${inputData}`);
  };

  if (isLoading) return <Loading />;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Article Analytics</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => router.push("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Search Article</CardTitle>
            <CardDescription>
              Enter an article title, part of a title, or paste a link
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <Input
                placeholder="Enter article title or URL"
                className="flex-1"
                onChange={(e) => setInputData(e.target.value)}
              />
              <Button onClick={handleAnalyze}>
                <Search className="mr-2 h-4 w-4" /> Analyze
              </Button>
            </div>
          </CardContent>
        </Card>

        {!isLoading && articleData && (
          <Fragment>
            <Card className="col-span-full md:col-span-3">
              <CardHeader>
                <CardTitle>{articleData?.title}</CardTitle>
                <CardDescription>
                  Hespress.com • {articleData?.date}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-4">
                  <Image
                    width={1000}
                    height={500}
                    src={articleData?.img_url}
                    alt="Article thumbnail"
                    className="w-1/2  h-auto aspect-video rounded-md object-cover"
                  />
                  <div className="space-y-2">
                    <div className="flex  space-x-2">
                      <Badge>{articleData?.category}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {articleData?.content.split(" ").length} words article
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <span>{articleData?.comments.length} Comments</span>
                      <span>
                        {articleData?.comments.reduce(
                          (sum: number, comment: Comment) =>
                            sum + Number(Math.abs(comment.likes)),
                          0
                        ) || 0}{" "}
                        Engagement
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-full md:col-span-2">
              <CardHeader>
                <CardTitle>Sentiment Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" minHeight={250}>
                  <PieChart>
                    <Pie
                      data={sentimentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {sentimentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="col-span-full md:col-span-2">
              <CardHeader>
                <CardTitle>Top Keywords</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Placeholder for word cloud or ranked list */}
                <div
                  id="wordcloudcanvas"
                  className="w-full rounded-lg invert h-[300px] flex items-center justify-center bg-muted "
                >
                  Word Cloud Placeholder
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-full">
              <CardHeader>
                <CardTitle>Engagement Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={engagementData}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="positive" stroke="#4ade80" />
                    <Line type="monotone" dataKey="neutral" stroke="#94a3b8" />
                    <Line type="monotone" dataKey="negative" stroke="#f87171" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="col-span-full">
              <CardHeader>
                <CardTitle>Comment Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <TabsList>
                      <TabsTrigger value="all">All Comments</TabsTrigger>
                      <TabsTrigger value="positive">Positive</TabsTrigger>
                      <TabsTrigger value="neutral">Neutral</TabsTrigger>
                      <TabsTrigger value="negative">Negative</TabsTrigger>
                    </TabsList>
                    <div className="flex space-x-2">
                      <Select>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="recent">Most Recent</SelectItem>
                          <SelectItem value="likes">Most Likes</SelectItem>
                          <SelectItem value="replies">Most Replies</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <TabsContent value="all" className="space-y-4">
                    {articleData.comments.map((comment: Comment) => (
                      <div
                        key={comment.id}
                        className="flex items-start space-x-4 p-4 rounded-lg border"
                      >
                        <Badge
                          variant="outline"
                          className={
                            comment.label === "positive"
                              ? "border-green-500 text-green-500"
                              : comment.label === "negative"
                              ? "border-red-500 text-red-500"
                              : "border-gray-500 text-gray-500"
                          }
                        >
                          {comment.label} NOT YET ANYLISED
                        </Badge>
                        <div className="flex-1">
                          <p className="text-sm">{comment.text}</p>
                          <div className="flex items-center space-x-2 mt-2 text-sm text-muted-foreground">
                            <span>{comment.likes} likes</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button className="w-full">View More Comments</Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </Fragment>
        )}
      </div>

      {articleData && (
        <div className="flex justify-between items-center mt-8">
          <div className="space-x-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" /> Download Report
            </Button>
            <Button variant="outline">
              <Share2 className="mr-2 h-4 w-4" /> Share Insights
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            <a href="#" className="hover:underline">
              Documentation
            </a>
            {" • "}
            <a href="#" className="hover:underline">
              Support
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
