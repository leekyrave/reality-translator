const sizes = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-10 w-10 border-[3px]",
};

interface Props {
  size?: keyof typeof sizes;
  className?: string;
}

export function Spinner({ size = "md", className = "" }: Props) {
  return (
    <div
      className={`animate-spin rounded-full border-gray-200 border-t-gray-800 ${sizes[size]} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}
