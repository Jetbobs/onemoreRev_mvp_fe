'use client'

import { Header } from "@/components/header"
import { ProjectListNew } from "@/components/project-list-new"

export default function ProjectsNewPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <ProjectListNew />
      </main>
    </div>
  )
}