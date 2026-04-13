interface SortDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
    >
      <option value="distance">Nearest first</option>
      <option value="rating">Highest rated</option>
      <option value="availability">Available now</option>
    </select>
  );
}