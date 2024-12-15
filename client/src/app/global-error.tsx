'use client'
import ErrorCard from "@/components/ErrorCard"

 // Error boundaries must be Client Components
 
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
  }) {
  console.log(error)
  return (
    // global-error must include html and body tags
    <html>
      <body className="flex flex-col items-center w-screen h-screen">
        <ErrorCard error={error.message} />
      </body>
    </html>
  )
}