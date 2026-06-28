import React from "react";

export default function Table({ children, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return <table {...props}>{children}</table>;
}
