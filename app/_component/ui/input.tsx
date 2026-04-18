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
      className="border border-brand-complementary/30 bg-white p-2 flex-1 rounded w-full
        text-brand-complementary placeholder:text-brand-complementary/40
        focus:outline-none focus:border-brand-tertiary focus:ring-1 focus:ring-brand-tertiary"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && onEnter?.()}
    />
  );
}
