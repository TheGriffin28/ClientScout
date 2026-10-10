import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

interface ScoreDistributionChartProps {
  data: {
    Hot: number;
    Warm: number;
    Cold: number;
  };
}

const ScoreDistributionChart: React.FC<ScoreDistributionChartProps> = ({ data }) => {
  const series = [data.Hot, data.Warm, data.Cold];

  const options: ApexOptions = {
    chart: {
      type: 'donut',
      fontFamily: 'Outfit, sans-serif',
    },
    labels: ['Hot (80+)', 'Warm (40-79)', 'Cold (<40)'],
    colors: ['#10B981', '#F59E0B', '#3C50E0'],
    legend: {
      position: 'bottom',
      fontFamily: 'Outfit, sans-serif',
      itemMargin: {
        horizontal: 10,
        vertical: 5
      }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total',
              formatter: function (w) {
                return w.globals.seriesTotals.reduce((a: number, b: number) => {
                  return a + b
                }, 0)
              }
            }
          },
        },
      },
    },
    dataLabels: { enabled: false },
    stroke: { width: 0 },
  };

  return (
    <div className="col-span-12 rounded-xl border border-gray-200 bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-gray-700 dark:bg-gray-800 sm:px-7.5 xl:col-span-4">
      <div className="mb-3 justify-between gap-4 sm:flex">
        <div>
          <h5 className="text-xl font-semibold text-black dark:text-white">
            Lead Quality
          </h5>
        </div>
      </div>
      <div className="mb-2">
        <div id="scoreDistributionChart" className="mx-auto flex justify-center">
          <ReactApexChart options={options} series={series} type="donut" height={350} />
        </div>
      </div>
    </div>
  );
};

export default ScoreDistributionChart;
