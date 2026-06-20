// Shared full-page loading state — previously this exact JSX (spinner +
// message) was copy-pasted in 8 different page files. Centralizing it here
// means a single place to tweak the loading UI for the whole app.
interface LoadingSpinnerProps {
  message?: string;
}

export default function LoadingSpinner({ message = "Loading..." }: LoadingSpinnerProps) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">{message}</p>
      </div>
    </div>
  );
}
