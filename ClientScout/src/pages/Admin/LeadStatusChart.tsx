import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { useTheme } from '../../context/ThemeContext';

interface LeadStatusChartProps {
  data: {
    status: string;
    count: number;
  }[];
}

const LeadStatusChart: React.FC<LeadStatusChartProps> = ({ data }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const series = data.map((item) => item.count);
  const labels = data.map((item) => item.status);

  const options: ApexOptions = {
    chart: {
      type: 'donut',
      fontFamily: 'Outfit, sans-serif',
      background: 'transparent',
    },
    colors: ['#3C50E0', '#10B981', '#FF9C55', '#FF4560', '#775DD0', '#00E396'],
    labels: labels,
    legend: {
      show: true,
      position: 'bottom',
      fontFamily: 'Outfit, sans-serif',
      labels: {
        colors: isDark ? '#E5E7EB' : '#4B5563',
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          background: 'transparent',
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    responsive: [
      {
        breakpoint: 2600,
        options: {
          chart: {
            width: 380,
          },
        },
      },
      {
        breakpoint: 640,
        options: {
          chart: {
            width: 200,
          },
        },
      },
    ],
    theme: {
      mode: isDark ? 'dark' : 'light',
    },
    tooltip: {
      theme: isDark ? 'dark' : 'light',
    },
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pt-7.5 pb-5 shadow-default dark:border-gray-800 dark:bg-white/[0.03] sm:px-7.5">
      <div className="mb-3 justify-between gap-4 sm:flex">
        <div>
          <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">
            Lead Distribution
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            System-wide leads by status
          </p>
        </div>
      </div>

      <div className="mb-2">
        <div id="leadStatusChart" className="mx-auto flex justify-center">
          <ReactApexChart
            options={options}
            series={series}
            type="donut"
            width={380}
          />
        </div>
      </div>
      
      <div className="mt-4 flex flex-wrap items-center justify-center gap-y-3">
        {data.map((item, index) => (
          <div key={item.status} className="w-full px-8 sm:w-1/2">
            <div className="flex w-full items-center">
              <span 
                className="mr-2 block h-3 w-full max-w-3 rounded-full"
                style={{ backgroundColor: options.colors![index] }}
              ></span>
              <p className="flex w-full justify-between text-sm font-medium text-gray-800 dark:text-white/90">
                <span>{item.status}</span>
                <span>{item.count}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeadStatusChart;
