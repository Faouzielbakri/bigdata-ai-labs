import { useState } from "react";
import { CommentBody } from "./analytics/top-comments";
import { Comment } from "@/lib/utils";
import Loading from "./Loading";

export function RecentComments({
  recentComments,
}: {
  recentComments: Comment[];
}) {
  // State to track which comments are expanded
  const [expandedComments, setExpandedComments] = useState<{
    [key: string]: boolean;
  }>({});

  // Function to toggle expand state
  const toggleExpand = (id: string) => {
    setExpandedComments((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (!recentComments) return <Loading />;
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {recentComments.map((comment) => (
        <CommentBody key={comment.id} comment={comment} sentiment={true} />
      ))}
    </div>
  );
}
