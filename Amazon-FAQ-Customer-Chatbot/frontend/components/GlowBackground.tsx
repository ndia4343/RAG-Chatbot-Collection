'use client'

export default function GlowBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">

      <div className="
        absolute
        w-[600px]
        h-[600px]
        bg-[#9ef01a]
        opacity-20
        blur-[150px]
        rounded-full
        top-[-200px]
        left-[20%]
      "/>

      <div className="
        absolute
        w-[500px]
        h-[500px]
        bg-[#9ef01a]
        opacity-10
        blur-[120px]
        rounded-full
        bottom-[-200px]
        right-[10%]
      "/>

    </div>
  )
}
