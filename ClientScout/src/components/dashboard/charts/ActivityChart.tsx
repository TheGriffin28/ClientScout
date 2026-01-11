import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

interface ActivityChartProps {
  categories: string[];
  series: {
    name: string;
    data: number[];
  }[];
}

const ActivityChart: React.FC<ActivityChartProps> = ({ categories, series }) => {
  const options: ApexOptions = {
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'right',
      fontFamily: 'Outfit, sans-serif',
    },
    colors: ['#3C50E0', '#10B981'], // Blue for Leads, Green for Contacts
    chart: {
      fontFamily: 'Outfit, sans-serif',
      height: 350,
      type: 'area',
      toolbar: {
        show: false,
      },
    },
    stroke: {
      curve: 'smooth',
      width: [2, 2],
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.1,
        stops: [0, 90, 100]
      },
    },
    markers: {
      size: 4,
      colors: ['#fff'],
      strokeColors: ['#3C50E0', '#10B981'],
      strokeWidth: 2,
      hover: {
        size: 7,
      },
    },
    grid: {
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      enabled: true,
      x: {
        show: true,
      },
    },
    xaxis: {
      type: 'category',
      categories: categories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      title: {
        style: {
          fontSize: '0px',
        },
      },
    },
  };

  return (
    <div className="col-span-12 rounded-xl border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-12">
      <div className="mb-3 justify-between gap-4 sm:flex">
        <div>
          <h5 className="text-xl font-semibold text-black dark:text-white">
            Weekly Lead Activity
          </h5>
        </div>
      </div>
      <div className="mb-2">
        <div id="activityChart" className="-ml-5">
          <ReactApexChart options={options} series={series} type="area" height={350} />
        </div>
      </div>
    </div>
  );
};

export default ActivityChart;
