import React from "react";
import {
  Card,
  CardContent,
  CardTitle,
  CardHeader,
  CardDescription,
} from "@/components/ui/card";
import { CustomBarChart } from "@/src/components/CustomBarChart";
import { CustomPieChart } from "@/src/components/CustomPieChart";

function AnalyticsDashboard() {
  return (
    <Card className="container mx-auto">
      <CardHeader>
        <CardTitle>
          <h2 className="text-4xl font-semibold">Analytics</h2>
        </CardTitle>
        <CardDescription>
          Here's a quick overview of what's going on.
        </CardDescription>
      </CardHeader>

      <CardContent className="h-auto grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col w-full gap-4">
          <CustomPieChart
            height="300px"
            dataType="status"
            displayName="displayName"
            title="Task Statuses"
            description="March 2025"
            colours={{
              pending: "var(--chart-1)",
              in_progress: "var(--chart-3)",
              completed: "var(--chart-2)",
            }}
            display={{
              pending: "Pending",
              in_progress: "In Progress",
              completed: "Completed",
            }}
            info="Sorted by: Pending, In Progress and Completed"
          />

          <CustomPieChart
            height="300px"
            dataType="priority"
            displayName="DisplayName"
            title="Task Priorities"
            description="March 2025"
            colours={{
              low: "var(--chart-2)",
              medium: "var(--chart-3)",
              high: "var(--chart-1)",
            }}
            display={{
              low: "Low",
              medium: "Medium",
              high: "High",
            }}
            info="Sorted by: Low, Medium and High"
          />
        </div>

        <div className="w-full h-full">
          <CustomBarChart height="100%" width="100%" />
        </div>
      </CardContent>
    </Card>
  );
}

export default AnalyticsDashboard;
