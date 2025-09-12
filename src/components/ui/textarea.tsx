'use client';

import * as React from "react"
import { cn } from "@/lib/utils"
import { TiptapEditor } from "./tiptap-editor"

interface TextareaProps extends Omit<React.ComponentProps<"textarea">, 'onChange'> {
  useTiptap?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement> | string) => void;
}

const Textarea = React.forwardRef<
  HTMLTextAreaElement | HTMLDivElement,
  TextareaProps
>(({ className, useTiptap = true, onChange, value, ...props }, ref) => {
  // If useTiptap is true, use TiptapEditor
  if (useTiptap) {
    const handleTiptapChange = (content: string) => {
      if (onChange) {
        // Create a fake event object for compatibility
        const fakeEvent = {
          target: { value: content },
          currentTarget: { value: content }
        } as React.ChangeEvent<HTMLTextAreaElement>;
        onChange(fakeEvent);
      }
    };

    return (
      <TiptapEditor
        ref={ref as React.Ref<HTMLDivElement>}
        value={value as string}
        onChange={handleTiptapChange}
        onBlur={props.onBlur as (() => void) | undefined}
        placeholder={props.placeholder}
        className={className}
        id={props.id}
        rows={props.rows}
      />
    );
  }

  // Fallback to regular textarea
  return (
    <textarea
      className={cn(
        "flex min-h-[60px] w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-gray-400 placeholder:text-sm focus-visible:outline-none focus:placeholder:opacity-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      ref={ref as React.Ref<HTMLTextAreaElement>}
      value={value}
      onChange={onChange as React.ChangeEventHandler<HTMLTextAreaElement>}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
