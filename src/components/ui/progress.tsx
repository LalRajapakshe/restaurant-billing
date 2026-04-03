"use client";

import * as React from "react";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
    value?: number;
}

function cn(...classes: Array<string | undefined | false | null>) {
    return classes.filter(Boolean).join(" ");
}

function Progress({ className, value = 0, ...props }: ProgressProps) {
    const safeValue = Math.max(0, Math.min(100, value));

    return (
        <div
            className={cn(
                "relative h-2 w-full overflow-hidden rounded-full bg-slate-200",
                className
            )}
            {...props}
        >
            <div
                className="h-full rounded-full bg-slate-900 transition-all"
                style={{ width: `${safeValue}%` }}
            />
        </div>
    );
}

export { Progress };