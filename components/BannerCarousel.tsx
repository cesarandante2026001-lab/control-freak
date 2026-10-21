"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

type Banner = {
  id: string
  title: string
  subtitle: string | null
  imageUrl: string
  linkUrl: string | null
  linkText: string | null
}

export function BannerCarousel({ banners }: { banners: Banner[] }) {
  const [actual, setActual] = useState(0)

  useEffect(() => {
    if (banners.length <= 1) return
    const interval = setInterval(() => {
      setActual((prev) => (prev + 1) % banners.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [banners.length])

  if (banners.length === 0) return null

  const banner = banners[actual]

  function irA(idx: number) {
    setActual((idx + banners.length) % banners.length)
  }

  return (
    <section className="relative w-full bg-gray-50">
      <div className="relative max-w-[1600px] mx-auto overflow-hidden">
        <Link
          href={banner.linkUrl || "/productos"}
          className="block relative w-full aspect-[1920/700] max-h-[600px]"
        >
          <img
            src={banner.imageUrl}
            alt={banner.title}
            className="w-full h-full object-cover"
          />

          {(banner.title || banner.subtitle || banner.linkText) && (
            <div className="absolute inset-0 flex flex-col justify-center items-start px-8 md:px-16 bg-gradient-to-r from-black/40 via-black/10 to-transparent">
              {banner.title && (
                <h2 className="text-white text-3xl md:text-5xl font-light tracking-tight mb-2 max-w-2xl drop-shadow-lg">
                  {banner.title}
                </h2>
              )}
              {banner.subtitle && (
                <p className="text-white/90 text-sm md:text-base mb-6 max-w-xl drop-shadow">
                  {banner.subtitle}
                </p>
              )}
              {banner.linkText && (
                <span className="inline-block bg-white text-black px-6 py-3 text-xs tracking-widest uppercase font-medium hover:bg-gray-100 transition">
                  {banner.linkText}
                </span>
              )}
            </div>
          )}
        </Link>

        {banners.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.preventDefault()
                irA(actual - 1)
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-md transition"
              aria-label="Anterior"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.preventDefault()
                irA(actual + 1)
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-md transition"
              aria-label="Siguiente"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.preventDefault()
                    setActual(i)
                  }}
                  className={`w-2 h-2 rounded-full transition ${
                    i === actual ? "bg-white w-6" : "bg-white/50 hover:bg-white/80"
                  }`}
                  aria-label={`Banner ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}