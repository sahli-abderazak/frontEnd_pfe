"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OffreAdminTable } from "./offre_admin_table"
import { OffreAdminTableValide } from "./offre-admin-table-valide"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

export function OffreAdminTabs({ refreshTrigger }: { refreshTrigger: boolean }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<any[] | null>(null)
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults(null)
      return
    }

    setIsSearching(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        console.error("Vous devez être connecté pour rechercher des offres.")
        return
      }

      const response = await fetch(`http://127.0.0.1:8000/api/recherche-offre/${encodeURIComponent(searchTerm)}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la recherche d'offres")
      }

      const data = await response.json()
      setSearchResults(data)
    } catch (error) {
      console.error("Erreur de recherche:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const clearSearch = () => {
    setSearchTerm("")
    setSearchResults(null)
  }

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Rechercher par nom de poste..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-8"
          />
        </div>
        <Button onClick={handleSearch} disabled={isSearching}>
          {isSearching ? "Recherche..." : "Rechercher"}
        </Button>
        {searchResults && (
          <Button variant="outline" onClick={clearSearch}>
            Effacer
          </Button>
        )}
      </div>

      {searchResults ? (
        <div className="border rounded-lg">
          <div className="p-4 bg-blue-50 border-b">
            <h3 className="font-medium">Résultats de recherche pour "{searchTerm}"</h3>
            <p className="text-sm text-muted-foreground">{searchResults.length} offre(s) trouvée(s)</p>
          </div>
          <div className="p-4">
            {searchResults.length > 0 ? (
              searchResults.map((offre) => (
                <div key={offre.id} className="border rounded-md p-4 mb-4 last:mb-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold">{offre.poste}</h4>
                      <p className="text-sm">
                        {offre.societe} - {offre.ville}, {offre.pays}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {offre.valider ? "Validée" : "En attente de validation"}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        clearSearch()
                      }}
                    >
                      Voir détails
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">Aucune offre trouvée pour cette recherche</div>
            )}
          </div>
        </div>
      ) : (
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
      )}
    </div>
  )
}

