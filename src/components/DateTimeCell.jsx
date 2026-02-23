import { format } from 'date-fns';

/** Renders date on first line and time on second line (smaller). Use in tables. */
export default function DateTimeCell({ value, fallback = '-' }) {
  if (value == null || value === '') return <span className="text-gray-500">{fallback}</span>;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return <span className="text-gray-500">{fallback}</span>;
  return (
    <div className="whitespace-nowrap">
      <div>{format(d, 'dd MMM yyyy')}</div>
      <div className="text-xs text-gray-500">{format(d, 'h:mm a')}</div>
    </div>
  );
}
