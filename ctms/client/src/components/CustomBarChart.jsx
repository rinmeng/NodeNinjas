"use client";
import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, Tooltip, Legend } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { useEffect, useState } from "react";
import proxy from "@/utils/proxy";
import { useAuth } from "@/utils/AuthProvider";

export function CustomBarChart({ height, width }) {
  const { user } = useAuth();
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${proxy}/task/assignedto/manager/${user.id}`,
          { credentials: "include" }
        );
        const data = await response.json();
        // Group tasks by owner and count each status for stacking into a bar
        const groupedTasks = data.reduce((acc, task) => {
          // Prefer display name, fallback to username
          const owner =
            task.owner_display_name ||
            task.owner_username ||
            `User ${task.owner_id}`;
          if (!acc[owner]) {
            acc[owner] = { owner, pending: 0, inProg: 0, completed: 0 };
          }
          if (task.status === "pending") {
            acc[owner].pending++;
          } else if (task.status === "in_progress") {
            acc[owner].inProg++;
          } else if (task.status === "completed") {
            acc[owner].completed++;
          }
          return acc;
        }, {});
        // Transform keys to proper capitalization for the chart
        const transformedData = Object.values(groupedTasks).map((item) => ({
          owner: item.owner,
          Pending: item.pending,
          "In-Progress": item.inProg,
          Completed: item.completed,
        }));
        setChartData(transformedData);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      }
    };
    fetchData();
  }, [user.id]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tasks by Owner</CardTitle>
        <CardDescription>
          Distribution of tasks for users under your management
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{}}
          className={`mx-auto aspect-square max-h-[${height}] w-[${width}]
                    [&_.recharts-text]:fill-background`}
        >
          <BarChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="owner"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <Tooltip content={<ChartTooltipContent hideLabel />} />
            <Legend />
            <Bar dataKey="Pending" stackId="a" fill="var(--chart-1)" />
            <Bar dataKey="In-Progress" stackId="a" fill="var(--chart-3)" />
            <Bar dataKey="Completed" stackId="a" fill="var(--chart-2)" />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} />
          <span>Task distribution by owner</span>
        </div>
        <div className="leading-none text-muted-foreground">
          Stacked by status: Pending, In-Progress, Completed.
        </div>
      </CardFooter>
    </Card>
  );
}
