"use client";

import { TrendingUp } from "lucide-react";
import { LabelList, Pie, PieChart, Tooltip, Cell } from "recharts";
import { useState, useEffect } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export function CustomPieChart({ height }) {
  const [chartData, setChartData] = useState([]);
  useEffect(() => {
    fetch("http://localhost:15000/task/all", { credentials: "include" })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((error) => {
            throw new Error(error.message || "Tasks can't be loaded");
          });
        }
        return res.json();
      })
      .then((data) => {
        const taskStatusCounting = data.reduce(
          (count, task) => {
            if (task.status === "completed") {
              count.completed++;
            } else if (task.status === "in_progress") {
              count.inProg++;
            } else if (task.status === "pending") {
              count.pending++;
            }
            return count;
          },
          { inProg: 0, pending: 0, completed: 0 }
        );

        console.log("Task Status Counts: ", taskStatusCounting);

        setChartData([
          {
            status: "Pending",
            count: taskStatusCounting.pending,
            fill: "var(--ring)",
          },
          {
            status: "In-Progress",
            count: taskStatusCounting.inProg,
            fill: "var(--chart-5)",
          },
          {
            status: "Completed",
            count: taskStatusCounting.completed,
            fill: "var(--chart-2)",
          },
        ]);
      })
      .catch((error) => console.error("Error fetching tasks: ", error));
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status of Tasks</CardTitle>
        <CardDescription>March 2025</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={setChartData}
          className={`mx-auto aspect-square max-h-[${height}]
           [&_.recharts-text]:fill-background`}
        >
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent nameKey="status" hideLabel />}
            />
            <Pie data={chartData} dataKey="count" nameKey="status">
              <LabelList
                dataKey="status"
                fill="black"
                className="fill-background"
                stroke="none"
                fontSize={12}
                formatter={(status) => status}
              />
            </Pie>
            <Tooltip />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} />
          <span>Statuses of All Tasks</span>
        </div>
        <div className="leading-none text-muted-foreground">
          Showing status of tasks for the this month
        </div>
      </CardFooter>
    </Card>
  );
}
