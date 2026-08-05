import React from 'react'
import { motion } from 'motion/react'
import { EASE } from '@/lib/motion'

// Sequential bar chart — magnitude is the job here (compare counts across
// genres/decades), so per the dataviz skill this gets one hue (the brand
// accent), never a categorical rainbow: bar length AND intensity both
// encode the value, growing "more-is-darker" from a shared baseline.
// A single series needs no legend — the value is direct-labeled at each
// bar's end instead of gated behind hover.
const SequentialBarChart = ({ data, valueSuffix = '' }) => {
  if (!data || data.length === 0) return null
  const maxValue = Math.max(...data.map((d) => d.value))

  return (
    <div className="flex flex-col gap-3">
      {data.map((d, i) => {
        const percent = maxValue > 0 ? (d.value / maxValue) * 100 : 0
        const intensity = maxValue > 0 ? 40 + (d.value / maxValue) * 60 : 40
        return (
          <div key={d.label} className="flex items-center gap-3">
            <span className="w-20 md:w-28 shrink-0 text-xs md:text-sm text-text-dark-muted truncate text-right">
              {d.label}
            </span>
            <div className="flex-1 h-4 md:h-5 bg-ink-elevated rounded-r-md overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percent}%` }}
                transition={{ duration: 0.6, delay: i * 0.05, ease: EASE }}
                className="h-full rounded-r-md"
                style={{
                  backgroundColor: `color-mix(in srgb, var(--color-accent2) ${intensity}%, transparent)`,
                }}
              />
            </div>
            <span className="w-8 shrink-0 text-xs md:text-sm text-text-dark font-medium tabular-nums">
              {d.value}
              {valueSuffix}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default SequentialBarChart
