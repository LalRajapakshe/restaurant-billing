"use client";

import * as React from "react";

type TabsContextValue = {
    value: string;
    onValueChange: (value: string) => void;
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

function cn(...classes: Array<string | undefined | false | null>) {
    return classes.filter(Boolean).join(" ");
}

export interface TabsProps {
    value: string;
    onValueChange: (value: string) => void;
    className?: string;
    children: React.ReactNode;
}

function Tabs({ value, onValueChange, className, children }: TabsProps) {
    return (
        <TabsContext.Provider value={{ value, onValueChange }}>
            <div className={className}>{children}</div>
        </TabsContext.Provider>
    );
}

export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> { }

function TabsList({ className, ...props }: TabsListProps) {
    return (
        <div
            role="tablist"
            className={cn("inline-flex items-center gap-1 rounded-xl bg-slate-100 p-1", className)}
            {...props}
        />
    );
}

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    value: string;
}

function TabsTrigger({ className, value, children, ...props }: TabsTriggerProps) {
    const context = React.useContext(TabsContext);

    if (!context) {
        throw new Error("TabsTrigger must be used inside Tabs");
    }

    const isActive = context.value === value;

    return (
        <button
            type="button"
            role="tab"
            aria-selected={isActive}
            data-state={isActive ? "active" : "inactive"}
            onClick={() => context.onValueChange(value)}
            className={cn(
                "inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2",
                isActive ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900",
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
    value: string;
}

function TabsContent({ className, value, children, ...props }: TabsContentProps) {
    const context = React.useContext(TabsContext);

    if (!context) {
        throw new Error("TabsContent must be used inside Tabs");
    }

    if (context.value !== value) return null;

    return (
        <div
            role="tabpanel"
            data-state="active"
            className={cn("mt-2", className)}
            {...props}
        >
            {children}
        </div>
    );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };