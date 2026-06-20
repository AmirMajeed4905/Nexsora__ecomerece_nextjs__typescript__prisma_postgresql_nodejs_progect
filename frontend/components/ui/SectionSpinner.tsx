// Inline loading state for a section of a page (e.g. an admin table or
// dashboard panel) — as opposed to LoadingSpinner, which takes over the
// whole viewport. This exact "h-64 flex + spinner" block was duplicated
// across 3 admin pages.
interface SectionSpinnerProps {
  heightClassName?: string;
  spinnerSizeClassName?: string;
}

export default function SectionSpinner({
  heightClassName = "h-64",
  spinnerSizeClassName = "w-8 h-8",
}: SectionSpinnerProps) {
  return (
    <div className={`flex items-center justify-center ${heightClassName}`}>
      <div className={`${spinnerSizeClassName} border-2 border-gray-900 border-t-transparent rounded-full animate-spin`} />
    </div>
  );
}
