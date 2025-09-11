"use client"

import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { useState } from "react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"

export default function CreateProjectPage() {
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [endDate, setEndDate] = useState<Date>()

  return (
    <div className="min-h-screen">
      <Header />
      <main className="p-8 flex items-center justify-center bg-gray-50 min-h-[calc(100vh-64px)]">
        <Card className="w-full max-w-sm shadow-lg">
      <CardHeader>
        <CardTitle>프로젝트 생성</CardTitle>
        <CardDescription>
          새로운 프로젝트의 기본 정보를 입력해주세요.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="flex flex-col gap-6">
            {/* 프로젝트명 */}
            <div className="grid gap-2">
              <Label htmlFor="projectName">프로젝트명</Label>
              <Input
                id="projectName"
                type="text"
                placeholder="프로젝트 이름을 입력하세요"
                required
              />
            </div>

            {/* 프로젝트 설명 */}
            <div className="grid gap-2">
              <Label htmlFor="description">프로젝트 설명</Label>
              <Textarea
                id="description"
                placeholder="프로젝트에 대한 설명을 입력하세요"
                rows={3}
              />
            </div>

            {/* 시작일 */}
            <div className="grid gap-2">
              <Label>시작일</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP", { locale: ko }) : "날짜 선택"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* 마감일 */}
            <div className="grid gap-2">
              <Label>마감일</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP", { locale: ko }) : "날짜 선택"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* 예산 */}
            <div className="grid gap-2">
              <Label htmlFor="budget">예산</Label>
              <Input
                id="budget"
                type="number"
                placeholder="0"
                min="0"
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button variant="outline" className="flex-1">
          취소
        </Button>
        <Button type="submit" className="flex-1">
          생성
        </Button>
      </CardFooter>
        </Card>
      </main>
    </div>
  )
}
