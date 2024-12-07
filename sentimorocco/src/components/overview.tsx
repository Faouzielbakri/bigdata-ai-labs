"use client";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

type SentimentAPI = {
  key_as_string: string;
  key: number;
  doc_count: number;
  neutral: { doc_count: number };
  negative: { doc_count: number };
  positive: { doc_count: number };
};

export function Overview({
  sentimentOverview,
}: {
  sentimentOverview: SentimentAPI[] | null;
}) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    // Generate random data while loading
    interval = setInterval(() => {
      const randomData = Array.from({ length: 6 }, (_, index) => {
        const month = new Date(2024, index).toLocaleString("default", {
          month: "long",
        });
        return {
          name: month,
          positive: Math.floor(Math.random() * 100),
          neutral: Math.floor(Math.random() * 100),
          negative: Math.floor(Math.random() * 100),
        };
      });
      setData(randomData);
    }, 500);

    if (sentimentOverview) {
      // If sentimentOverview is available, transform and set the data
      const transformedData =
        sentimentOverview?.map((entry) => {
          const month = new Date(entry.key).toLocaleString("default", {
            month: "long",
          });
          return {
            name: month,
            positive: entry.positive.doc_count,
            neutral: entry.neutral.doc_count,
            negative: entry.negative.doc_count,
          };
        }) ?? [];

      setData(transformedData);
      setLoading(false);
      // Clear the random data interval
      clearInterval(interval);
    }

    // Cleanup function to clear interval when component unmounts
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [sentimentOverview]);

  if (loading) {
    return (
      <div className="relative">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <XAxis
              dataKey="name"
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
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip
              cursor={{ fill: "rgba(0, 0, 0, 0.1)" }}
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.18)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                borderRadius: "10px",
                padding: "10px",
                color: "#aaa",
              }}
              labelStyle={{ fontWeight: "bold", color: "#888" }}
            />
            <Bar dataKey="positive" fill="#4ade80" radius={[4, 4, 0, 0]} />
            <Bar dataKey="neutral" fill="#94a3b8" radius={[4, 4, 0, 0]} />
            <Bar dataKey="negative" fill="#f87171" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
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
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip
          cursor={{ fill: "rgba(0, 0, 0, 0.1)" }}
          contentStyle={{
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.18)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            borderRadius: "10px",
            padding: "10px",
            color: "#aaa",
          }}
          labelStyle={{ fontWeight: "bold", color: "#888" }}
        />
        <Bar dataKey="positive" fill="#4ade80" radius={[4, 4, 0, 0]} />
        <Bar dataKey="neutral" fill="#94a3b8" radius={[4, 4, 0, 0]} />
        <Bar dataKey="negative" fill="#f87171" radius={[4, 4, 0, 0]} />
        <Legend
          verticalAlign="top"
          align="center"
          wrapperStyle={{ marginTop: "20px" }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
