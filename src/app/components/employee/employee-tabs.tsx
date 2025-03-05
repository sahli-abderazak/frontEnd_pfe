"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReviewsTable } from "./employee-table"

export function ReviewsTabs({ refreshTrigger }: { refreshTrigger: boolean }) {
  return (
    <Tabs defaultValue="recruteur" className="w-full">
      <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
        <TabsTrigger
          value="recruteur"
          className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary"
        >
          Recruteurs
        </TabsTrigger>
      </TabsList>
      <TabsContent value="recruteur" className="p-6">
        <ReviewsTable refresh={refreshTrigger} />
      </TabsContent>
    </Tabs>
  )
}

