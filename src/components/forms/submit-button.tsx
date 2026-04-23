"use client";

import { LoaderCircle } from "lucide-react";
import { useFormStatus } from "react-dom";

import { Button, type ButtonProps } from "@/components/ui/button";

export function SubmitButton({
  children,
  ...props
}: ButtonProps & { children: React.ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <Button {...props} disabled={pending || props.disabled}>
      {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
      {children}
    </Button>
  );
}
