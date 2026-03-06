import * as React from "react";
import { cn } from "@/lib/utils";

type AlertProps = React.ComponentProps<"div"> & {
  variant?: "default" | "success" | "error" | "warning" | "info";
};

const variantClasses = {
  default: "bg-muted text-foreground border-border",
  success: "bg-success/10 text-success border border-success/30",
  error: "bg-destructive/10 text-destructive border border-destructive/30",
  warning: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30",
  info: "bg-primary/10 text-primary border border-primary/30",
};

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="alert"
        data-slot="alert"
        className={cn(
          "rounded-xl px-4 py-3 text-sm shadow-sm",
          variantClasses[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Alert.displayName = "Alert";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentProps<"p">
>(({ className, ...props }, ref) => {
  return (
    <p
      ref={ref}
      data-slot="alert-description"
      className={cn("text-sm text-muted-foreground mt-1", className)}
      {...props}
    />
  );
});

AlertDescription.displayName = "AlertDescription";
export { Alert, AlertDescription };
