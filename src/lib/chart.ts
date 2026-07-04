import * as echarts from "echarts/core";
import { PieChart } from "echarts/charts";
import { TooltipComponent, LegendComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

echarts.use([PieChart, TooltipComponent, LegendComponent, CanvasRenderer]);

interface PieDataItem {
  name: string;
  value: number;
  itemStyle: { color: string };
}

function buildOption(data: PieDataItem[], isDark: boolean) {
  const textColor = isDark ? "#e5e7eb" : "#374151";
  const lineColor = isDark ? "#6b7280" : "#d1d5db";
  const tooltipBg = isDark ? "#1f2937" : "#ffffff";
  const tooltipBorder = isDark ? "#374151" : "#e5e7eb";

  return {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item" as const,
      backgroundColor: tooltipBg,
      borderColor: tooltipBorder,
      textStyle: { color: textColor, fontSize: 13 },
      formatter: "{b}: {c} 字 ({d}%)",
    },
    legend: {
      orient: "vertical" as const,
      right: "5%",
      top: "center",
      textStyle: { color: textColor, fontSize: 13 },
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 10,
    },
    series: [
      {
        type: "pie" as const,
        radius: ["40%", "65%"],
        center: ["38%", "50%"],
        avoidLabelOverlap: true,
        padAngle: 1,
        itemStyle: { borderRadius: 2 },
        label: {
          show: true,
          position: "outside" as const,
          formatter: "{b}",
          color: textColor,
          fontSize: 12,
          distanceToLabelLine: 4,
        },
        labelLine: {
          show: true,
          length: 18,
          length2: 22,
          lineStyle: { color: lineColor },
        },
        emphasis: {
          scaleSize: 8,
          label: { fontSize: 14, fontWeight: "bold" as const },
        },
        data,
      },
    ],
  };
}

export function initPieChart(container: HTMLElement) {
  const rawData = JSON.parse(container.dataset.options || "[]");

  const isDark = document.documentElement.classList.contains("dark");
  const chart = echarts.init(container);
  chart.setOption(buildOption(rawData, isDark));

  chart.on("click", (params: any) => {
    if (params.name && params.name !== "其他") {
      location.href = `/blog?category=${params.name}`;
    }
  });

  const mo = new MutationObserver(() => {
    const dark = document.documentElement.classList.contains("dark");
    chart.setOption(buildOption(rawData, dark));
  });
  mo.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });

  const ro = new ResizeObserver(() => chart.resize());
  ro.observe(container);

  return () => {
    mo.disconnect();
    ro.disconnect();
    chart.dispose();
  };
}
