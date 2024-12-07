"use client";

import { useEffect, useState } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const COLORS = ["#4ade80", "#94a3b8", "#f87171"];

export function SentimentDistribution({
  sentimentDistribution,
}: {
  sentimentDistribution: {
    negative: { doc_count: number };
    neutral: { doc_count: number };
    positive: { doc_count: number };
  } | null;
}) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    // Generate random data while loading
    interval = setInterval(() => {
      const randomData = [
        { name: "Positive", value: Math.floor(Math.random() * 100) },
        { name: "Neutral", value: Math.floor(Math.random() * 100) },
        { name: "Negative", value: Math.floor(Math.random() * 100) },
      ];
      setData(randomData);
    }, 500);

    if (sentimentDistribution) {
      // Transform sentimentDistribution into an array for Recharts
      const transformedData = [
        {
          name: "Positive",
          value: sentimentDistribution.positive.doc_count,
        },
        {
          name: "Neutral",
          value: sentimentDistribution.neutral.doc_count,
        },
        {
          name: "Negative",
          value: sentimentDistribution.negative.doc_count,
        },
      ];
      setData(transformedData);
      setLoading(false);

      // Clear the random data interval
      if (interval) {
        clearInterval(interval);
      }
    }

    // Cleanup function to clear interval when component unmounts
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [sentimentDistribution]);

  return (
    <div style={{ position: "relative", width: "100%", height: "300px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data?.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          {/* Add Tooltip component to show information when pie slices are hovered */}
          <Tooltip
            cursor={{ fill: "rgba(0, 0, 0, 0.1)" }}
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.1)", // Semi-transparent white
              border: "1px solid rgba(255, 255, 255, 0.18)", // Light border
              backdropFilter: "blur(8px)", // Glass effect
              WebkitBackdropFilter: "blur(8px)", // Support for Safari
              borderRadius: "10px", // Soft rounded corners
              padding: "10px", // Padding for better spacing
              color: "#aaa", // Text color for better contrast
            }}
            labelStyle={{ fontWeight: "bold", color: "#888" }} // White text color for labels
          />
          <Legend
            verticalAlign="top"
            align="center"
            wrapperStyle={{ marginTop: "20px" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
