import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

interface LeadStatusChartProps {
  data: {
    New: number;
    Contacted: number;
    FollowUp: number;
    Interested: number;
    Converted: number;
    Lost: number;
  };
}

const LeadStatusChart: React.FC<LeadStatusChartProps> = ({ data }) => {
  const series = [
    data.New,
    data.Contacted,
    data.FollowUp,
    data.Interested,
    data.Converted,
    data.Lost,
  ];

  const options: ApexOptions = {
    chart: {
      type: 'donut',
      fontFamily: 'Outfit, sans-serif',
    },
    labels: ['New', 'Contacted', 'Follow Up', 'Interested', 'Converted', 'Lost'],
    colors: ['#3C50E0', '#0EA5E9', '#F59E0B', '#10B981', '#8B5CF6', '#EF4444'],
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
            name: {
              show: true,
              fontSize: '14px',
              fontWeight: 600,
              color: undefined,
              offsetY: -10
            },
            value: {
              show: true,
              fontSize: '16px',
              fontWeight: 400,
              color: undefined,
              offsetY: 16,
              formatter: function (val) {
                return val.toString();
              }
            },
            total: {
              show: true,
              showAlways: false,
              label: 'Total',
              fontSize: '16px',
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 600,
              color: '#373d3f',
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
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: 0
    },
  };

  return (
    <div className="col-span-12 rounded-xl border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-gray-700 dark:bg-gray-800 sm:px-7.5 xl:col-span-6">
      <div className="mb-3 justify-between gap-4 sm:flex">
        <div>
          <h5 className="text-xl font-semibold text-black dark:text-white">
            Lead Status Breakdown
          </h5>
        </div>
      </div>
      <div className="mb-2">
        <div id="leadStatusChart" className="mx-auto flex justify-center">
          <ReactApexChart options={options} series={series} type="donut" width={380} />
        </div>
      </div>
    </div>
  );
};

export default LeadStatusChart;
