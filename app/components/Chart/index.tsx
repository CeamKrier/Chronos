import React from 'react';
import ApexChart from 'react-apexcharts';

type ChartType = {
  type:
    | 'bar'
    | 'line'
    | 'area'
    | 'histogram'
    | 'pie'
    | 'donut'
    | 'rangeBar'
    | 'radialBar'
    | 'scatter'
    | 'bubble'
    | 'heatmap'
    | 'candlestick'
    | 'radar'
    | 'polarArea'
    | undefined;
  height: number;
  series: Array<{
    name: string;
    data: Array<number>;
  }>;
  categories: Array<string>;
};

const minutesToHM = (secs: number | string) => {
  const adjustedSeconds = typeof secs === 'string' ? parseInt(secs) : secs;
  const hours = Math.floor(adjustedSeconds / 60);
  const minutes = Math.floor(adjustedSeconds) % 60;

  return [hours, minutes].map((v) => (v < 10 ? '0' + v : v)).join(':');
};

export default function Chart({ type, height, categories, series }: ChartType) {
  const chartOptions = {
    colors: ['#88CAFF', '#C6A07F'],
    chart: {
      type: 'bar',
      foreColor: '#E2E3E5',
      stacked: true,
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    tooltip: {
      theme: 'dark',
      y: {
        formatter: function (value: string) {
          return minutesToHM(value);
        },
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
      },
    },
    dataLabels: {
      style: {
        colors: ['#E2E3E5'],
      },
    },
    xaxis: {
      type: 'datetime',
      categories: categories,
    },
    yaxis: {
      title: {
        text: 'Minutes',
      },
    },
    legend: {
      position: 'bottom',
      offsetY: 7,
    },
    fill: {
      opacity: 0.8,
    },
  };
  return (
    <ApexChart
      type={type}
      height={height}
      series={series}
      options={chartOptions}
    />
  );
}
