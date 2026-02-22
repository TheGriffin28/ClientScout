import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

interface IndustryChartProps {
  data: { [key: string]: number };
}

const IndustryChart: React.FC<IndustryChartProps> = ({ data }) => {
  // Sort and take top 5
  const sortedData = Object.entries(data)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const series = [{
    name: 'Leads',
    data: sortedData.map(([, count]) => count),
  }];

  const options: ApexOptions = {
    chart: {
      type: 'bar',
      height: 350,
      fontFamily: 'Outfit, sans-serif',
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: true,
        barHeight: '50%',
        distributed: true,
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: sortedData.map(([industry]) => industry),
      labels: {
        style: { colors: '#64748B' }
      }
    },
    yaxis: {
      labels: {
        style: { colors: '#64748B' },
        maxWidth: 160
      }
    },
    colors: ['#3C50E0', '#80CAEE', '#0FADCF', '#6577F3', '#8FD0EF'],
    legend: { show: false },
    grid: {
      borderColor: '#E2E8F0',
      strokeDashArray: 4,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: false } },
    },
    tooltip: {
      theme: 'light',
      y: { formatter: (val) => val.toString() }
    }
  };

  return (
    <div className="col-span-12 rounded-xl border border-gray-200 bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-gray-700 dark:bg-gray-800 sm:px-7.5 xl:col-span-6">
      <div className="mb-4 justify-between gap-4 sm:flex">
        <div>
          <h4 className="text-xl font-semibold text-black dark:text-white">
            Top Industries
          </h4>
        </div>
      </div>
      <div>
        <div id="industryChart" className="-ml-5">
          <ReactApexChart options={options} series={series} type="bar" height={350} />
        </div>
      </div>
    </div>
  );
};

export default IndustryChart;
