import { cn } from "@/lib/utils";

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  className?: string;
}

export function LoadingOverlay({ 
  isVisible, 
  message = "Processing...", 
  className 
}: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className={cn(
      "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50",
      className
    )}>
      <div className="bg-card p-6 rounded-lg shadow-xl text-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-card-foreground font-medium">{message}</p>
      </div>
    </div>
  );
}
