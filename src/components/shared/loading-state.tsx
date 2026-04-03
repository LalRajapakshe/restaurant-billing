'use client';

export function LoadingState() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    </div>
  );
}
