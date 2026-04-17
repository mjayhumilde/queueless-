type Props = {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: "primary" | "danger" | "ghost" | "success" | "secondary";
  size?: "sm" | "md";
  className?: string;
};

const variants = {
  primary: "bg-blue-500 text-white hover:bg-blue-600",
  success: "bg-green-500 text-white hover:bg-green-600",
  danger: "text-red-400 underline hover:text-red-600",
  ghost: "bg-gray-600 text-white hover:bg-gray-700",
  secondary: "bg-purple-500 text-white hover:bg-purple-600",
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
}: Props) {
  return (
    <button
      onClick={onClick}
      className={`rounded ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}
