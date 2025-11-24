import { cn } from "@/lib/utils";

interface UploadProgressProps {
  progress: number;
  fileName?: string;
  className?: string;
}

export function UploadProgress({ progress, fileName, className }: UploadProgressProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {fileName && (
        <div className="flex items-center justify-between text-sm">
          <span className="truncate">{fileName}</span>
          <span className="text-muted-foreground">{Math.round(progress)}%</span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full bg-primary transition-all duration-300 ease-in-out"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
