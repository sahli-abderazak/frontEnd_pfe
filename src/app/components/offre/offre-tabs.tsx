"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OffreTable } from "./offre-table"
import { OffreTableExpiree } from "./offre-table_expiree"

export function OffreTabs({ refreshTrigger }: { refreshTrigger: boolean }) {
  return (
    <Tabs defaultValue="offre" className="w-full">
      <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
        <TabsTrigger
          value="offre"
          className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary"
        >
          offre
        </TabsTrigger>
        <TabsTrigger
          value="offre_expiree"
          className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary"
        >
          offre Expiré
        </TabsTrigger>
      </TabsList>
      <TabsContent value="offre" className="p-6">
        <OffreTable refresh={refreshTrigger} />
      </TabsContent>

      <TabsContent value="offre_expiree" className="p-6">
        <OffreTableExpiree refresh={refreshTrigger} />
      </TabsContent>
    </Tabs>
  )
}