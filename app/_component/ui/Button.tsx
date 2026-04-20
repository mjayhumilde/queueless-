type Variant =
  | "primary"
  | "success"
  | "danger"
  | "ghost"
  | "outline"
  | "monitor";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-brand-complementary text-brand-main hover:opacity-90",
  success: "bg-brand-tertiary text-brand-complementary hover:opacity-90",
  danger: "bg-red-100 text-red-700 hover:bg-red-200",
  ghost:
    "bg-transparent text-brand-complementary border border-brand-complementary/25 hover:bg-brand-complementary/5",
  outline:
    "bg-brand-complementary/6 text-brand-complementary/50 border border-brand-complementary/15 hover:bg-brand-complementary/10",
  monitor: "bg-brand-tertiary text-brand-complementary hover:opacity-90",
};

const sizes: Record<Size, string> = {
  sm: "px-2.5 py-1 text-[11px] font-bold rounded-lg",
  md: "px-4 py-2.5 text-[13px] font-bold rounded-xl",
  lg: "px-6 py-3.5 text-[14px] font-bold rounded-xl w-full",
};

type Props = {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  className?: string;
};

export default function Button({
  onClick,
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
}: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`transition-all ${variants[variant]} ${sizes[size]} disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}
