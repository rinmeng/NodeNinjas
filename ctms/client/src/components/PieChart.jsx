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

export function Component() {
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
            status: "In Progress",
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
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Number of Tasks</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={setChartData}
          className="mx-auto aspect-square max-h-[250px] [&_.recharts-text]:fill-background"
        >
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent nameKey="visitors" hideLabel />}
            />
            <Pie data={chartData} dataKey="count">
              <LabelList
                dataKey="status"
                className="fill-background"
                stroke="none"
                fontSize={12}
                formatter={(count) => count}
              />
            </Pie>
            <Tooltip />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total visitors for the last 6 months
        </div>
      </CardFooter>
    </Card>
  );
}

export { Component as PieChart };
