"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CandidatsTable } from "./candidat-table"

export function CandidatsTabs({ refreshTrigger }: { refreshTrigger: boolean }) {
  return (
    <Tabs defaultValue="candidat" className="w-full">
      <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
        <TabsTrigger
          value="candidat"
          className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary"
        >
          Candidats
        </TabsTrigger>
      </TabsList>
      <TabsContent value="candidat" className="p-6">
        <CandidatsTable refresh={refreshTrigger} />
      </TabsContent>
    </Tabs>
  )
}