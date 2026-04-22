"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Maximize2, Minimize2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type PanelMode = "normal" | "minimized" | "maximized";

type PanelShellProps = {
    title: string;
    description?: string;
    summary?: React.ReactNode;
    headerRight?: React.ReactNode;
    minimizedContent?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
};

export default function PanelShell({
    title,
    description,
    summary,
    headerRight,
    minimizedContent,
    children,
    className = "",
}: PanelShellProps) {
    const [panelMode, setPanelMode] = useState<PanelMode>("normal");

    const isMinimized = panelMode === "minimized";
    const isMaximized = panelMode === "maximized";

    const cardClassName = [
        "border-white/60 bg-white/95 shadow-sm backdrop-blur transition-all rounded-[28px]",
        isMaximized ? "h-[calc(100vh-4rem)] w-full overflow-auto" : "",
        className,
    ]
        .filter(Boolean)
        .join(" ");

    const cardContent = (
        <Card className={cardClassName}>
            <CardHeader>
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <CardTitle className="text-xl">{title}</CardTitle>
                        {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
                        {summary ? <div className="mt-3">{summary}</div> : null}
                    </div>

                    <div className="flex items-start gap-2">
                        {headerRight}
                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-2xl"
                            onClick={() =>
                                setPanelMode((prev) => (prev === "minimized" ? "normal" : "minimized"))
                            }
                            title={isMinimized ? "Expand panel" : "Minimize panel"}
                        >
                            {isMinimized ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                        </Button>

                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-2xl"
                            onClick={() =>
                                setPanelMode((prev) => (prev === "maximized" ? "normal" : "maximized"))
                            }
                            title={isMaximized ? "Restore panel size" : "Maximize panel"}
                        >
                            {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                        </Button>

                        {isMaximized ? (
                            <Button
                                variant="outline"
                                size="icon"
                                className="rounded-2xl"
                                onClick={() => setPanelMode("normal")}
                                title="Close maximized panel"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        ) : null}
                    </div>
                </div>
            </CardHeader>

            {isMinimized ? (
                <CardContent className="pt-0">
                    {minimizedContent ?? (
                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                            Panel minimized
                        </div>
                    )}
                </CardContent>
            ) : (
                <CardContent>{children}</CardContent>
            )}
        </Card>
    );

    if (isMaximized) {
        return (
            <>
                <div
                    className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm"
                    onClick={() => setPanelMode("normal")}
                />
                <div className="fixed inset-4 z-50">{cardContent}</div>
            </>
        );
    }

    return cardContent;
}
