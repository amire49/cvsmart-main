import * as React from "react";
import { cn } from "@/lib/utils";

type AlertProps = React.ComponentProps<"div"> & {
  variant?: "default" | "success" | "error" | "warning" | "info";
};

const variantClasses = {
  default: "bg-muted text-foreground border",
  success: "bg-green-50 text-green-800 border border-green-300",
  error: "bg-red-50 text-red-800 border border-red-300",
  warning: "bg-yellow-50 text-yellow-800 border border-yellow-300",
  info: "bg-blue-50 text-blue-800 border border-blue-300",
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
