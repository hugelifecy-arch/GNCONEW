'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface AccordionItem {
  question: string
  answer: string
}

interface AccordionProps {
  items: AccordionItem[]
}

export function Accordion({ items }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="divide-y divide-bg-border rounded-xl border border-bg-border">
      {items.map((item, index) => {
        const isOpen = openIndex === index
        return (
          <div key={index}>
            <button
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="flex w-full items-center justify-between px-6 py-5 text-left transition hover:bg-bg-elevated/50"
            >
              <span className="pr-4 font-semibold text-text-primary">{item.question}</span>
              <ChevronDown
                className={`h-5 w-5 shrink-0 text-text-tertiary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>
            <div
              className={`overflow-hidden transition-all duration-200 ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
            >
              <p className="px-6 pb-5 text-sm leading-relaxed text-text-secondary">{item.answer}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
