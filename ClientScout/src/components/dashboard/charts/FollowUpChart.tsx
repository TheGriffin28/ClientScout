import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

interface FollowUpChartProps {
  data: {
    Overdue: number;
    Today: number;
    Upcoming: number;
  };
}

const FollowUpChart: React.FC<FollowUpChartProps> = ({ data }) => {
  const series = [
    {
      name: 'Follow-ups',
      data: [data.Overdue, data.Today, data.Upcoming],
    },
  ];

  const options: ApexOptions = {
    chart: {
      type: 'bar',
      height: 350,
      fontFamily: 'Outfit, sans-serif',
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '45%',
        borderRadius: 4,
        distributed: true,
      },
    },
    dataLabels: {
      enabled: true,
      offsetY: -20,
      style: {
        fontSize: '12px',
        colors: ["#304758"]
      }
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories: ['Overdue', 'Today', 'Upcoming'],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      show: false,
    },
    grid: {
      show: false,
      padding: {
        left: 0,
        right: 0
      }
    },
    fill: {
      opacity: 1,
    },
    colors: ['#EF4444', '#F59E0B', '#10B981'], // Red, Yellow, Green
    legend: {
      show: false,
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val.toString();
        },
      },
    },
  };

  return (
    <div className="col-span-12 rounded-xl border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-6">
      <div className="mb-4 justify-between gap-4 sm:flex">
        <div>
          <h4 className="text-xl font-semibold text-black dark:text-white">
            Follow-ups Timeline
          </h4>
        </div>
      </div>
      <div>
        <div id="followUpChart" className="-ml-5">
          <ReactApexChart options={options} series={series} type="bar" height={350} />
        </div>
      </div>
    </div>
  );
};

export default FollowUpChart;
