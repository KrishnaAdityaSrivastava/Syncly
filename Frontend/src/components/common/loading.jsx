import { Loader2 } from "lucide-react";

const Loading = ({ variant = "inline", text = "Loading..." }) => {
  const spinner = (
    <Loader2
      className="h-6 w-6 animate-spin text-blue-500 dark:text-blue-400"
      aria-label="Loading"
    />
  );

  if (variant === "button") {
    return (
      <span className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>{text}</span>
      </span>
    );
  }

  if (variant === "fullscreen") {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white dark:bg-gray-900 z-50">
        {spinner}
        <p className="mt-2 text-gray-600 dark:text-gray-300">{text}</p>
      </div>
    );
  }

  // default = inline
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      {spinner}
      <p className="text-gray-600 dark:text-gray-300 text-sm">{text}</p>
    </div>
  );
};

export default Loading;
