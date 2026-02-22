import React, { ReactNode } from 'react';

interface CardDataStatsProps {
  title: string;
  total: string;
  rate?: string;
  levelUp?: boolean;
  levelDown?: boolean;
  children: ReactNode;
  iconColorClass?: string;
}

const CardDataStats: React.FC<CardDataStatsProps> = ({
  title,
  total,
  rate,
  levelUp,
  levelDown,
  children,
  iconColorClass = 'bg-gray-100 dark:bg-gray-700',
}) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white py-6 px-7.5 shadow-default hover:shadow-lg transition-shadow duration-300 dark:border-gray-700 dark:bg-gray-800">
      <div className={`flex h-11.5 w-11.5 items-center justify-center rounded-full ${iconColorClass}`}>
        {children}
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <h4 className="text-title-md font-bold text-black dark:text-white">
            {total}
          </h4>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</span>
        </div>

        {rate && (
          <span
            className={`flex items-center gap-1 text-sm font-medium ${
              levelUp ? 'text-green-500' : levelDown ? 'text-red-500' : 'text-gray-500'
            }`}
          >
            {rate}
            {levelUp && (
              <svg
                className="fill-current"
                width="10"
                height="11"
                viewBox="0 0 10 11"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4.35716 2.47737L0.908974 5.82987L5.0443e-07 4.94612L5 0.0848689L10 4.94612L9.09103 5.82987L5.64284 2.47737L5.64284 10.0849L4.35716 10.0849L4.35716 2.47737Z"
                  fill=""
                />
              </svg>
            )}
            {levelDown && (
              <svg
                className="fill-current"
                width="10"
                height="11"
                viewBox="0 0 10 11"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5.64284 8.69238L9.09103 5.33988L10 6.22363L5 11.0849L-8.98488e-07 6.22363L0.908973 5.33988L4.35716 8.69238L4.35716 1.08488L5.64284 1.08488L5.64284 8.69238Z"
                  fill=""
                />
              </svg>
            )}
          </span>
        )}
      </div>
    </div>
  );
};

export default CardDataStats;
