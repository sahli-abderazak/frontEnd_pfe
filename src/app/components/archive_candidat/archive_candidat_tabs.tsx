"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ArchiveCandidatsTable from "./archive_candidat_table"


export function ArchiveCandidatsTabs({ refreshTrigger }: { refreshTrigger: boolean }) {
  return (
    <Tabs defaultValue="archive" className="w-full">
      <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
        <TabsTrigger
          value="archive"
          className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary"
        >
          Archive 
        </TabsTrigger>
      </TabsList>
      <TabsContent value="archive" className="p-6">
        <ArchiveCandidatsTable refresh={refreshTrigger} />
      </TabsContent>
    </Tabs>
  )
}