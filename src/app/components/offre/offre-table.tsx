"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Eye, Pencil } from "lucide-react"
import { useRouter } from "next/navigation"
import { OffreDetailsDialog } from "./offre-details-dialog"
import { OffreEditDialog } from "./offre-edit-dialog"

interface Offre {
  id: number
  departement: string
  poste: string
  description: string
  datePublication: string
  dateExpiration: string
  valider: boolean
}

export function OffreTable({ refresh }: { refresh: boolean }) {
  const router = useRouter()
  const [offres, setOffres] = useState<Offre[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedOffre, setSelectedOffre] = useState<Offre | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)

  const fetchOffres = useCallback(async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Vous devez être connecté pour voir les offres.")
        return
      }

      const response = await fetch("http://127.0.0.1:8000/api/offres-departement", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token")
          router.push("/auth/login")
          return
        }
        throw new Error("Erreur de récupération des offres")
      }

      const data = await response.json()
      setOffres(data)
      setError(null)
    } catch (error) {
      console.error("Erreur de récupération des offres:", error)
      setError("Erreur lors du chargement des offres")
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchOffres()
  }, [fetchOffres, refresh])

  const handleViewDetails = (offre: Offre) => {
    setSelectedOffre(offre)
    setIsDetailsOpen(true)
  }

  const handleCloseDetails = () => {
    setIsDetailsOpen(false)
    setSelectedOffre(null)
  }

  const handleCloseEdit = () => {
    setIsEditOpen(false)
    setSelectedOffre(null)
  }

  // Function to safely render HTML content
  const createMarkup = (htmlContent: string) => {
    return { __html: htmlContent }
  }

  if (loading) return <div className="p-4 text-gray-600">Chargement...</div>
  if (error) return <div className="p-4 text-red-500">{error}</div>

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Département</TableHead>
            <TableHead>Poste</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Date de publication</TableHead>
            <TableHead>Date d'expiration</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {offres.map((offre) => (
            <TableRow key={offre.id}>
              <TableCell>{offre.departement}</TableCell>
              <TableCell>{offre.poste}</TableCell>
              <TableCell className="max-w-xs truncate">
                <div dangerouslySetInnerHTML={createMarkup(offre.description)} />
              </TableCell>
              <TableCell>{new Intl.DateTimeFormat("fr-FR").format(new Date(offre.datePublication))}</TableCell>
              <TableCell>{new Intl.DateTimeFormat("fr-FR").format(new Date(offre.dateExpiration))}</TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded-full text-sm ${
                    offre.valider ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {offre.valider ? "Validée" : "En attente"}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="icon" onClick={() => handleViewDetails(offre)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setSelectedOffre(offre)
                      setIsEditOpen(true)
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <OffreDetailsDialog offre={selectedOffre} isOpen={isDetailsOpen} onClose={handleCloseDetails} />

      <OffreEditDialog
        offre={selectedOffre}
        isOpen={isEditOpen}
        onClose={handleCloseEdit}
        onOffreUpdated={fetchOffres}
      />
    </>
  )
}

