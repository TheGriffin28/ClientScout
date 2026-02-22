import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

interface SourceChartProps {
  data: { [key: string]: number };
}

const SourceChart: React.FC<SourceChartProps> = ({ data }) => {
  const labels = Object.keys(data);
  const series = Object.values(data);

  const options: ApexOptions = {
    chart: {
      type: 'pie',
      fontFamily: 'Outfit, sans-serif',
    },
    labels: labels,
    legend: {
      position: 'bottom',
      fontFamily: 'Outfit, sans-serif',
      itemMargin: {
        horizontal: 10,
        vertical: 5
      }
    },
    dataLabels: { enabled: true },
    colors: ['#3C50E0', '#80CAEE', '#0FADCF', '#6577F3', '#8FD0EF'],
    stroke: { width: 0 },
  };

  return (
    <div className="col-span-12 rounded-xl border border-gray-200 bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-gray-700 dark:bg-gray-800 sm:px-7.5 xl:col-span-4">
      <div className="mb-3 justify-between gap-4 sm:flex">
        <div>
          <h5 className="text-xl font-semibold text-black dark:text-white">
            Lead Sources
          </h5>
        </div>
      </div>
      <div className="mb-2">
        <div id="sourceChart" className="mx-auto flex justify-center">
          <ReactApexChart options={options} series={series} type="pie" height={350} />
        </div>
      </div>
    </div>
  );
};

export default SourceChart;
