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
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && onEnter?.()}
      className="
        flex-1 w-full bg-white border border-brand-complementary/15
        rounded-xl px-3.5 py-2.5 text-[13px] text-brand-complementary
        placeholder:text-brand-complementary/30
        focus:outline-none focus:border-brand-tertiary
        focus:ring-2 focus:ring-brand-tertiary/20 transition-all
      "
    />
  );
}
