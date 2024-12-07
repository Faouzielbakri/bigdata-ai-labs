"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Article } from "@/lib/utils";
import Image from "next/image";
import Loading from "../Loading";

interface TopArticlesProps {
  dateRange: { from: Date; to: Date } | undefined;
  topArticles: Article[] | undefined;
}

export function TopArticles({ dateRange, topArticles }: TopArticlesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Articles by Engagement</CardTitle>
        <CardDescription>
          Articles with the most comments and strongest sentiment reactions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topArticles ? (
            topArticles?.map((article) => (
              <a
                href={article.href}
                target="_blank"
                key={article.title}
                className="relative flex flex-1 flex-col space-y-2 rounded-lg border p-3 hover:bg-muted/50 pl-[10%] cursor-pointer hover:scale-95 duration-200 transition-all"
              >
                <Image
                  src={article.img_url}
                  alt="article_image"
                  width={500}
                  height={1000}
                  className="absolute w-[9%] left-[0.5%] top-3 h-auto aspect-video rounded-lg"
                />
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium leading-none">
                      {article.title}
                    </h4>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Badge variant="outline" className="capitalize">
                        {article.category.split("-").join("  :  ")}
                      </Badge>
                      <span>{new Date(article.date).toDateString()}</span>
                    </div>
                  </div>
                  <Badge>{article.commentCount} comments</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex h-2 overflow-hidden rounded-full">
                    <div
                      className="bg-green-500"
                      style={{ width: `${article.sentiments.positive}%` }}
                    />
                    <div
                      className="bg-gray-500"
                      style={{ width: `${article.sentiments.neutral}%` }}
                    />
                    <div
                      className="bg-red-500"
                      style={{ width: `${article.sentiments.negative}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      {Number(
                        (article.sentiments.positive /
                          (article.sentiments.positive +
                            article.sentiments.neutral +
                            article.sentiments.negative)) *
                          100
                      ).toFixed(2)}
                      % Positive
                    </span>
                    <span>
                      {Number(
                        (article.sentiments.neutral /
                          (article.sentiments.positive +
                            article.sentiments.neutral +
                            article.sentiments.negative)) *
                          100
                      ).toFixed(2)}
                      % Neutral
                    </span>
                    <span>
                      {Number(
                        (article.sentiments.negative /
                          (article.sentiments.positive +
                            article.sentiments.neutral +
                            article.sentiments.negative)) *
                          100
                      ).toFixed(2)}
                      % Negative
                    </span>
                  </div>
                </div>
              </a>
            ))
          ) : (
            <Loading />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
