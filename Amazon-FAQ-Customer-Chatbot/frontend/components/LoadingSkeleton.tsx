'use client'

export default function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-3">

      <div className="
        h-4
        bg-gray-300
        dark:bg-gray-700
        rounded
        w-3/4
      "/>

      <div className="
        h-4
        bg-gray-300
        dark:bg-gray-700
        rounded
        w-1/2
      "/>

      <div className="
        h-4
        bg-gray-300
        dark:bg-gray-700
        rounded
        w-5/6
      "/>

    </div>
  )
}
