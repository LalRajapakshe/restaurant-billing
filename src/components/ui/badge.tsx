import * as React from "react";

type BadgeVariant = "default" | "secondary" | "outline" | "success" | "warning" | "destructive";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: BadgeVariant;
}

function cn(...classes: Array<string | undefined | false | null>) {
    return classes.filter(Boolean).join(" ");
}

const variantClasses: Record<BadgeVariant, string> = {
    default: "bg-slate-900 text-white",
    secondary: "bg-slate-100 text-slate-900",
    outline: "border border-slate-200 bg-white text-slate-900",
    success: "bg-emerald-100 text-emerald-800",
    warning: "bg-amber-100 text-amber-800",
    destructive: "bg-red-100 text-red-800",
};

function Badge({ className, variant = "default", ...props }: BadgeProps) {
    return (
        <div
            className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
                variantClasses[variant],
                className
            )}
            {...props}
        />
    );
}

export { Badge };