import * as React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={`rounded-xl border border-neutral-200 bg-white text-neutral-900 shadow-sm ${className || ""}`}
      {...props}
    />
  )
);
Card.displayName = "Card";

export { Card };
