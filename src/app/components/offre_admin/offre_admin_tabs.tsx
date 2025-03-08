"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OffreAdminTable } from "./offre_admin_table"
import { OffreAdminTableValide } from "./offre-admin-table-valide"

export function OffreAdminTabs({ refreshTrigger }: { refreshTrigger: boolean }) {
  return (
    <Tabs defaultValue="offre" className="w-full">
      <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
        <TabsTrigger
          value="offre"
          className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary"
        >
          Offre
        </TabsTrigger>
        <TabsTrigger
          value="offre_valide"
          className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary"
        >
          Offre Validé
        </TabsTrigger>
        {/* <TabsTrigger
          value="offre_expiree"
          className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary"
        >
          Offre Expiré
        </TabsTrigger> */}
      </TabsList>

      <TabsContent value="offre" className="p-6">
        <OffreAdminTable refresh={refreshTrigger} />
      </TabsContent>

      <TabsContent value="offre_valide" className="p-6">
        <OffreAdminTableValide refresh={refreshTrigger} />
      </TabsContent>


    </Tabs>
  )
}