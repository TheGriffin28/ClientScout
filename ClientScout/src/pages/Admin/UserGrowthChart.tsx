import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { useTheme } from '../../context/ThemeContext';

interface UserGrowthChartProps {
  categories: string[];
  data: number[];
}

const UserGrowthChart: React.FC<UserGrowthChartProps> = ({ categories, data }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const options: ApexOptions = {
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'right',
      fontFamily: 'Outfit, sans-serif',
      labels: {
        colors: isDark ? '#E5E7EB' : '#4B5563',
      },
    },
    colors: ['#10B981'],
    chart: {
      fontFamily: 'Outfit, sans-serif',
      height: 350,
      type: 'area',
      toolbar: {
        show: false,
      },
      background: 'transparent',
    },
    theme: {
      mode: isDark ? 'dark' : 'light',
    },
    stroke: {
      curve: 'smooth',
      width: 2,
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
    grid: {
      borderColor: isDark ? '#374151' : '#E5E7EB',
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
    xaxis: {
      type: 'category',
      categories: categories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: isDark ? '#9CA3AF' : '#6B7280',
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: isDark ? '#9CA3AF' : '#6B7280',
        },
      },
    },
    tooltip: {
      theme: isDark ? 'dark' : 'light',
    },
  };

  const series = [
    {
      name: 'New Users',
      data: data,
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pt-7.5 pb-5 shadow-default dark:border-gray-800 dark:bg-white/[0.03] sm:px-7.5">
      <div className="mb-4 justify-between gap-4 sm:flex">
        <div>
          <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">
            User Growth
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            New user registrations in the last 7 days
          </p>
        </div>
      </div>

      <div>
        <div id="userGrowthChart" className="-ml-5">
          <ReactApexChart
            options={options}
            series={series}
            type="area"
            height={350}
          />
        </div>
      </div>
    </div>
  );
};

export default UserGrowthChart;
