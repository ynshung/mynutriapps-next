"use client";

import React from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Colors,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Colors,
  Title,
  Tooltip,
  Legend
);

export function BarChartGropued({
  groupedData,
  titleText,
  labelText,
}: {
  groupedData: { date: string; count: number }[];
  titleText: string;
  labelText: string;
}) {
  return (
    <Bar
      options={{
        responsive: true,
        aspectRatio: 4/3,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: titleText,
          },
        },
      }}
      data={{
        labels: groupedData.map((item) => item.date),
        datasets: [
          {
            label: labelText,
            data: groupedData.map((item) => item.count),
            backgroundColor: "#869b7d88",
            borderColor: "#869b7d",
            borderWidth: 1,
          },
        ],
      }}
    />
  );
}

const GoalOptionsFullNames = {
  improveHealth: "Improve Health",
  loseWeight: "Lose Weight",
  improvePerformance: "Improve Performance",
  chronicDisease: "Chronic Disease",
};

export function PieChartUserGoals({
  userSelectedGoal,
}: {
  userSelectedGoal: { goal: string; count: number }[];
}) {
  return (
    <Pie
      options={{
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: "User Goals",
          },
        },
      }}
      data={{
        labels: userSelectedGoal.map(
          (item) =>
            GoalOptionsFullNames[item.goal as keyof typeof GoalOptionsFullNames]
        ),
        datasets: [
          {
            label: "Goals",
            data: userSelectedGoal.map((item) => item.count),
          },
        ],
      }}
    />
  );
}
