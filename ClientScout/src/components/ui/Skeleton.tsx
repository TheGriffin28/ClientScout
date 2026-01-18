import React from "react";

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: "rect" | "circle" | "text";
}

const Skeleton: React.FC<SkeletonProps> = ({
  className = "",
  width,
  height,
  variant = "rect",
}) => {
  const baseClasses = "animate-pulse bg-gray-200 dark:bg-gray-700";
  
  const variantClasses = {
    rect: "rounded-md",
    circle: "rounded-full",
    text: "rounded h-4 w-full",
  };

  const style: React.CSSProperties = {
    width: width,
    height: height,
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
};

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({
  rows = 5,
  cols = 5,
}) => {
  return (
    <div className="w-full animate-pulse">
      <div className="flex border-b border-gray-200 dark:border-gray-700 py-4">
        {[...Array(cols)].map((_, i) => (
          <div key={i} className="flex-1 px-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        ))}
      </div>
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex border-b border-gray-100 dark:border-gray-800 py-4">
          {[...Array(cols)].map((_, j) => (
            <div key={j} className="flex-1 px-4">
              <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-6 bg-gray-100 dark:bg-gray-800 rounded w-1/3"></div>
        </div>
      </div>
    </div>
  );
};

export const ChartSkeleton: React.FC = () => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 animate-pulse">
      <div className="mb-4 h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
      <div className="flex items-end gap-2 h-48">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-t"
            style={{ height: `${Math.random() * 100}%` }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export const ProfileSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-gray-200 dark:bg-gray-700"></div>
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-32"></div>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        </div>
        <div className="space-y-6">
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        </div>
      </div>
    </div>
  );
};

export default Skeleton;
