import React from 'react';

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  showText?: boolean;
  className?: string;
  colorClass?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  percentage,
  size = 28,
  strokeWidth = 3,
  showText = true,
  className = '',
  colorClass,
}) => {
  const cleanPercentage = Math.min(100, Math.max(0, isNaN(percentage) ? 0 : percentage));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (cleanPercentage / 100) * circumference;

  // Auto color mapping if not provided
  let strokeColor = 'stroke-blue-600';
  if (colorClass) {
    strokeColor = colorClass;
  } else if (cleanPercentage === 100) {
    strokeColor = 'stroke-emerald-600';
  } else if (cleanPercentage >= 60) {
    strokeColor = 'stroke-blue-600';
  } else if (cleanPercentage >= 30) {
    strokeColor = 'stroke-amber-500';
  } else {
    strokeColor = 'stroke-slate-400';
  }

  return (
    <div className={`relative inline-flex items-center justify-center flex-shrink-0 ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-slate-200 fill-transparent"
          strokeWidth={strokeWidth}
        />
        {/* Progress Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className={`${strokeColor} fill-transparent transition-all duration-300 ease-out`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      {showText && (
        <span className="absolute text-[9px] font-black text-slate-800 scale-90">
          {cleanPercentage === 100 ? '✓' : `${cleanPercentage}`}
        </span>
      )}
    </div>
  );
};
