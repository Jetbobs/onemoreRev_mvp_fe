"use client"

import * as React from "react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function DatePicker({
  value,
  onChange,
  placeholder = "날짜를 선택하세요"
}: {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
}) {
  const [date, setDate] = React.useState<Date | undefined>(value)

  React.useEffect(() => {
    setDate(value)
  }, [value])

  const handleSelect = (newDate: Date | undefined) => {
    setDate(newDate)
    if (onChange) {
      onChange(newDate)
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "yyyy년 MM월 dd일", { locale: ko }) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white border shadow-md" align="start">
        <div className="p-3">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            initialFocus
            className="rounded-md"
            formatters={{
              formatCaption: (month) => {
                return format(month, "yyyy년 MMMM", { locale: ko })
              },
              formatWeekdayName: (day) => {
                return format(day, "EEEEE", { locale: ko })
              },
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}