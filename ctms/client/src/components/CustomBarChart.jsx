"use client";
import { TrendingUp, User } from "lucide-react";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useEffect, useState } from "react";

export function CustomBarChart({ height, width }) {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:15000/user/all");
        const data = await response.json();
        // Aggregate users under each manager
        const managerCounts = {};
        data.forEach((user) => {
          if (user.manager_id) {
            managerCounts[user.manager_id] =
              (managerCounts[user.manager_id] || 0) + 1;
          }
        });

        // Transform the data
        const transformedData = data
          .filter((user) => user.role === "admin") // Only include admins
          .map((admin) => ({
            name: admin.display_name || admin.username, // Use display_name or fallback to username
            users: managerCounts[admin.id] || 0, // Number of users under this admin
          }));

        setChartData(transformedData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Distribution</CardTitle>
        <CardDescription>
          Total Users: {chartData.reduce((sum, admin) => sum + admin.users, 0)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={ChartConfig}
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
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="users" fill="var(--primary)" radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} />
          <span>Admin-User Distribution</span>
        </div>
        <div className="leading-none text-muted-foreground">
          Showing user distribution under specific admins
        </div>
      </CardFooter>
    </Card>
  );
}
