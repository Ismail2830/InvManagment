import { toast as sonnerToast } from "sonner";

// A simple custom hook for showing Sonner toasts
export function useToast() {
  // Generic notification
  function toast({ title, description, variant = "default" }: {
    title: string
    description?: string
    variant?: "default" | "success" | "error" | "warning" | "info" | "destructive"
  }) {
    if (variant === "success") {
      sonnerToast.success(title, { description });
    } else if (variant === "error" || variant === "destructive") {
      sonnerToast.error(title, { description });
    } else if (variant === "warning") {
      sonnerToast.warning(title, { description });
    } else if (variant === "info") {
      sonnerToast.info(title, { description });
    } else {
      sonnerToast(title, { description });
    }
  }

  // You could add shortcuts for common cases if you want
  return { toast }
}