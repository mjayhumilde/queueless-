type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  onEnter?: () => void;
};

export default function Input({
  value,
  onChange,
  placeholder,
  onEnter,
}: Props) {
  return (
    <input
      className="border p-2 flex-1 rounded w-full"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && onEnter?.()}
    />
  );
}
