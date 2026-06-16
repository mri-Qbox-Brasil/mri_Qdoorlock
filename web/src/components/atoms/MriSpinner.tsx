export interface MriSpinnerProps {
  size?: "sm" | "md" | "lg";
}

export const MriSpinner = ({ size = "md" }: MriSpinnerProps) => {
  const sizes = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-4",
    lg: "w-12 h-12 border-4",
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizes[size]} border-t-accent border-white rounded-full animate-spin`}
      />
    </div>
  );
};
