"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"

type UploadTriggerFilesHandler = (files: File[]) => void | Promise<void>

type UploadTriggerFileRejection = {
  file: File
  reason: "file-too-large"
}

type UploadTriggerProps = React.ComponentProps<typeof Button> & {
  accept: readonly string[]
  maxSize: number
  multiple?: boolean
  name?: string
  onFilesRejected?: (rejections: UploadTriggerFileRejection[]) => void
  onFilesSelected?: UploadTriggerFilesHandler
}

function UploadTrigger({
  accept,
  children,
  disabled,
  maxSize,
  multiple = false,
  name,
  onClick,
  onFilesRejected,
  onFilesSelected,
  type = "button",
  ...props
}: UploadTriggerProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleClick: NonNullable<UploadTriggerProps["onClick"]> = (event) => {
    onClick?.(event)

    if (!event.defaultPrevented && !disabled) {
      inputRef.current?.click()
    }
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.currentTarget.files ?? [])
    const selectedFiles = multiple ? files : files.slice(0, 1)
    const acceptedFiles = maxSize
      ? selectedFiles.filter((file) => file.size <= maxSize)
      : selectedFiles
    const rejectedFiles = maxSize
      ? selectedFiles
          .filter((file) => file.size > maxSize)
          .map((file) => ({ file, reason: "file-too-large" }) as const)
      : []

    if (rejectedFiles.length) {
      onFilesRejected?.(rejectedFiles)
    }

    if (acceptedFiles.length) {
      onFilesSelected?.(acceptedFiles)
    }

    event.currentTarget.value = ""
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        name={name}
        accept={accept.join(",")}
        multiple={multiple}
        disabled={disabled}
        className="sr-only"
        onChange={handleChange}
      />
      <Button type={type} disabled={disabled} onClick={handleClick} {...props}>
        {children}
      </Button>
    </>
  )
}

export {
  UploadTrigger,
  type UploadTriggerFileRejection,
  type UploadTriggerFilesHandler,
  type UploadTriggerProps,
}
