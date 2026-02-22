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
    colors: ['#3C50E0', '#80CAEE', '#0FADCF', '#6577F3', '#8FD0EF', '#0FADCF'],
    labels: labels,
    legend: {
      show: true,
      position: 'bottom',
      fontFamily: 'Outfit, sans-serif',
      labels: {
        colors: isDark ? '#E5E7EB' : '#4B5563',
      },
      itemMargin: {
        horizontal: 10,
        vertical: 5
      }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          background: 'transparent',
          labels: {
            show: true,
            total: {
              show: true,
              showAlways: true,
              label: 'Total Leads',
              fontSize: '16px',
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 600,
              color: isDark ? '#fff' : '#000',
              formatter: function (w) {
                const total = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0);
                return total.toString();
              }
            },
            value: {
              show: true,
              fontSize: '28px',
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 'bold',
              color: isDark ? '#fff' : '#000',
            }
          }
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
    stroke: {
        show: false
    },
    tooltip: {
      theme: isDark ? 'dark' : 'light',
    },
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white px-5 pt-7.5 pb-5 shadow-default dark:border-gray-700 dark:bg-gray-800 sm:px-7.5">
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
    </div>
  );
};

export default LeadStatusChart;
