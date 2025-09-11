import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, GitBranch } from "lucide-react";
import Link from "next/link";

export default function ProjectsPage() {


  return (
    <div className="min-h-screen">
      <Header />
    <main className="p-8 flex items-center justify-center">
      <Button asChild variant="outline" className="bg-black text-white font-bold hover:bg-black hover:text-white transition-all duration-200 active:scale-95 hover:scale-105">
        <Link href="/projects/create">프로젝트 생성</Link>
      </Button>
    </main>
    </div>
  );
}