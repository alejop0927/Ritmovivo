import { clsx } from "clsx";

interface BadgeProps {
  label: string;
  variant?: "purple" | "pink" | "green" | "yellow" | "red" | "gray";
}

const variants = {
  purple: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  pink: "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300",
  green: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  yellow: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  red: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  gray: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
};

export function Badge({ label, variant = "purple" }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant]
      )}
    >
      {label}
    </span>
  );
}
