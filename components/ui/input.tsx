import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "w-full min-w-0 bg-transparent border-0 p-0 rounded-none shadow-none outline-none focus-visible:ring-0 focus-visible:border-0",
        className
      )}
      {...props}
    />
  )
}

export { Input }
