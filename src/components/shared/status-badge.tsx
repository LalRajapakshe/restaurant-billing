'use client';

interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

export function StatusBadge({ status, variant = 'default' }: StatusBadgeProps) {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`text-xs px-2 py-1 rounded-full ${variantClasses[variant]}`}>
      {status}
    </span>
  );
}
