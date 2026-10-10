const colors: Record<Status, string> = {
  New: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  Contacted: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  FollowUp: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  Interested: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  Converted: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  Lost: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  Closed: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

type Status = "New" | "Contacted" | "FollowUp" | "Interested" | "Converted" | "Lost" | "Closed";

const StatusBadge = ({ status }: { status: Status | string }) => {
  const statusKey = status as Status;
  const colorClass = colors[statusKey] || colors.New;
  
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${colorClass}`}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
