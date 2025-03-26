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
import proxy from "@/utils/proxy";
import { useAuth } from "@/utils/AuthProvider";

export function CustomPieChart({
  height,
  dataType = "status",
  title = "Task Info",
  description = "Here is data on tasks!",
  colours,
  display,
  info,
}) {
  const { user } = useAuth();
  const [chartData, setChartData] = useState([]);

  //Colours depending on task data:
  const defaultColourPalette = {
    status: {
      pending: "var(--chart-1)",
      in_progress: "var(--chart-3)",
      completed: "var(--chart-2)",
    },
  };

  //The display name based on the given task data:
  const defaultDisplayNames = {
    status: {
      pending: "Pending",
      in_progress: "In-Progress",
      completed: "Completed",
    },
  };

  const confirmColourPalette = colours
    ? {
        ...defaultColourPalette,
        [dataType]: colours,
      }
    : defaultColourPalette;

  const confirmDisplayNames = display
    ? {
        ...defaultDisplayNames,
        [dataType]: {
          ...(defaultDisplayNames[dataType] || {}),
          ...display,
        },
      }
    : defaultDisplayNames;

  useEffect(() => {
    fetch(`${proxy}/task/assignedto/manager/${user.id}`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((error) => {
            throw new Error(error.message || "Tasks can't be loaded");
          });
        }
        return res.json();
      })
      .then((data) => {
        let dataSet;
        dataSet = processData(data);
        setChartData(dataSet);
      })
      .catch((error) => console.error("Error fetching tasks: ", error));
  }, [user.id, dataType, defaultColourPalette, defaultDisplayNames]);

  const processData = (tasks) => {
    const counts = tasks.reduce((count, task) => {
      const value = task[dataType];
      count[value] = (count[value] || 0) + 1;
      return count;
    }, {});

    return Object.keys(counts).map((key) => ({
      category: key,
      count: counts[key],
      fill: confirmColourPalette[dataType]?.[key] || "var(--chart-5)",
      displayName: confirmDisplayNames[dataType]?.[key] || key,
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{`${title}`}</CardTitle>
        <CardDescription>{`${description}`}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={setChartData}
          className={`mx-auto aspect-square max-h-[${height}]
           [&_.recharts-text]:fill-background`}
        >
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent nameKey="displayName" hideLabel />}
            />
            <Pie data={chartData} dataKey="count" nameKey="displayName">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
              <LabelList
                dataKey="displayName"
                className="fill-background"
                stroke="none"
                fontSize={12}
                formatter={(value) => value}
              />
            </Pie>
            <Tooltip />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} />
          <span>Information of all tasks for your team</span>
        </div>
        <div className="leading-none text-muted-foreground">{`${info}`}</div>
      </CardFooter>
    </Card>
  );
}
