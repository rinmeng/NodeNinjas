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
import { useToast } from "@/utils/ToastProvider";

export function CustomBarChart({ height, width }) {
  const { user } = useAuth();
  const [chartData, setChartData] = useState([]);
  const { setFeedbackMessage } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${proxy}/task/assignedto/manager/${user.id}`,
          { credentials: "include" }
        );
        const data = await response.json();

        // Group tasks by assigned user and count statuses
        const groupedTasks = data.reduce((acc, task) => {
          // Use assigned user's display name or username
          const assignedUser =
            task.assigned_display_name ||
            task.assigned_username ||
            `User ${task.assigned_user_id}`;

          if (!acc[assignedUser]) {
            acc[assignedUser] = {
              name: assignedUser,
              pending: 0,
              inProgress: 0,
              completed: 0,
            };
          }

          switch (task.status) {
            case "pending":
              acc[assignedUser].pending++;
              break;
            case "in_progress":
              acc[assignedUser].inProgress++;
              break;
            case "completed":
              acc[assignedUser].completed++;
              break;
          }
          return acc;
        }, {});

        // Transform for chart display
        const transformedData = Object.values(groupedTasks).map((item) => ({
          name: item.name,
          Pending: item.pending,
          "In-Progress": item.inProgress,
          Completed: item.completed,
        }));

        setChartData(transformedData);
      } catch (error) {
        setFeedbackMessage({
          type: "error",
          description: "Failed to fetch task data",
        });
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
              dataKey="name"
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
