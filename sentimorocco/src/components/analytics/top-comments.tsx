"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { cn, Comment } from "@/lib/utils";
import Loading from "../Loading";
import { Badge } from "../ui/badge";

interface TopCommentsProps {
  dateRange: { from: Date; to: Date } | undefined;
  topComments: Comment[] | undefined;
}

export function TopComments({ dateRange, topComments }: TopCommentsProps) {
  if (!topComments) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Most Engaging Comments</CardTitle>
          <CardDescription>
            Comments with the highest engagement rates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-40">
            <Loading />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Most Engaging Comments</CardTitle>
        <CardDescription>
          Comments with the highest engagement rates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {topComments.map((comment) => (
            <CommentBody key={comment.id} comment={comment} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function CommentBody({
  comment,
  sentiment,
}: {
  comment: Comment;
  sentiment?: boolean;
}) {
  return (
    <Card className={cn("hover:scale-95 transition-all duration-250")}>
      <CardHeader>
        <CardDescription className="flex justify-between items-center">
          <div>
            By <span className="text-green-500">{comment.author}</span>
          </div>
          {sentiment && (
            <Badge
              variant="outline"
              className={`ml-auto ${
                comment.label === "positive"
                  ? "bg-green-100 text-green-800"
                  : comment.label === "negative"
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {comment.label}
            </Badge>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage
              src={`http://robohash.org/${comment.author}?set=set4`}
            />
            <AvatarFallback>{comment.author.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{comment.text}</p>
          </div>
        </div>
        <div className="flex w-full justify-between items-center mt-4">
          <div className="text-sm text-muted-foreground">
            {comment.likes ? "Likes:" : "disLikes : "}
            <span className="font-semibold ml-1">{comment.likes}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {new Date(comment.date).toDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
