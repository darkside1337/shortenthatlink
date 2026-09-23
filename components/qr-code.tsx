"use client"

import { useEffect, useState } from "react"
import QRCode from "qrcode"

interface QRCodeImageProps {
  value: string
  size?: number
  className?: string
}

export function QRCodeImage({ value, size = 96, className }: QRCodeImageProps) {
  const [dataUrl, setDataUrl] = useState<string>("")

  useEffect(() => {
    QRCode.toDataURL(value, {
      width: size * 2,
      margin: 1,
      color: {
        dark: "#171717",
        light: "#ffffff",
      },
    })
      .then(setDataUrl)
      .catch((err) => console.error("QR Code generation error:", err))
  }, [value, size])

  if (!dataUrl) {
    return (
      <div
        className={`animate-pulse rounded-lg bg-muted flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={dataUrl}
      alt={`QR Code for ${value}`}
      width={size}
      height={size}
      className={`rounded-md border border-border/80 bg-white p-1 ${className}`}
    />
  )
}
