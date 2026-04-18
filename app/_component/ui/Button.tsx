type Props = {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: "primary" | "danger" | "ghost" | "success" | "secondary";
  size?: "sm" | "md";
  className?: string;
  disabled?: boolean;
};

const variants = {
  primary:
    "bg-brand-tertiary text-brand-complementary hover:bg-brand-secondary",
  success: "bg-brand-complementary text-brand-main hover:opacity-90",
  danger: "text-red-600 underline hover:text-red-800",
  ghost:
    "border border-brand-complementary text-brand-complementary hover:bg-brand-secondary",
  secondary:
    "bg-brand-secondary text-brand-complementary hover:bg-brand-tertiary",
};

const sizes = {
  sm: "px-3 py-1 text-sm",
  md: "px-4 py-2",
};

export default function Button({
  onClick,
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
}: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded font-medium transition-colors ${variants[variant]} ${sizes[size]} ${className}
        disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}
