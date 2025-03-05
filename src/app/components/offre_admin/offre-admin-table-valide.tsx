"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Trash2, AlertCircle } from "lucide-react"
import { ExpiringOfferActions } from "./expiring-offer-actions"
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

export function OffreAdminTableValide({ refresh }: { refresh: boolean }) {
  const router = useRouter()
  const [offres, setOffres] = useState<Offre[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState<number | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState<number | null>(null)
  const [selectedOffre, setSelectedOffre] = useState<Offre | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)

  // Function to safely render HTML content
  const createMarkup = (htmlContent: string) => {
    return { __html: htmlContent }
  }

  const fetchOffres = useCallback(async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Vous devez être connecté pour voir les offres.")
        return
      }

      const response = await fetch("http://127.0.0.1:8000/api/AlloffresValide", {
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
        throw new Error("Erreur de récupération des offres validées")
      }

      const data = await response.json()
      setOffres(data)
      setError(null)
    } catch (error) {
      console.error("Erreur de récupération des offres:", error)
      setError("Erreur lors du chargement des offres validées")
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchOffres()
  }, [fetchOffres])

  const handleSupprimer = async (offreId: number) => {
    setProcessing(offreId)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Vous devez être connecté pour supprimer une offre.")
        return
      }

      const response = await fetch(`http://127.0.0.1:8000/api/supprimerOffre/${offreId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erreur lors de la suppression de l'offre")
      }

      setOffres(offres.filter((offre) => offre.id !== offreId))
    } catch (error) {
      console.error("Erreur de suppression:", error)
      setError(error instanceof Error ? error.message : "Erreur lors de la suppression de l'offre")
    } finally {
      setProcessing(null)
      setDeleteConfirmation(null)
    }
  }

  // Fonction pour calculer les heures restantes avant expiration
  const calculateHoursRemaining = (expirationDate: string): number => {
    const now = new Date()
    const expiration = new Date(expirationDate)
    const diffMs = expiration.getTime() - now.getTime()
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60))
    return diffHours > 0 ? diffHours : 0
  }

  // Fonction pour déterminer si une offre expire bientôt (dans les 24h)
  const isExpiringSoon = (expirationDate: string): boolean => {
    const hoursRemaining = calculateHoursRemaining(expirationDate)
    return hoursRemaining <= 24 && hoursRemaining > 0
  }

  const handleEdit = (offre: Offre) => {
    setSelectedOffre(offre)
    setIsEditOpen(true)
  }

  const handleOffreUpdated = () => {
    fetchOffres()
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
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {offres.map((offre) => {
            const hoursRemaining = calculateHoursRemaining(offre.dateExpiration)
            const expiringSoon = isExpiringSoon(offre.dateExpiration)

            return (
              <TableRow key={offre.id} className={expiringSoon ? "bg-amber-50" : ""}>
                <TableCell>{offre.departement}</TableCell>
                <TableCell>{offre.poste}</TableCell>
                <TableCell className="max-w-md">
                  <div
                    className="prose prose-sm max-h-32 overflow-y-auto"
                    dangerouslySetInnerHTML={createMarkup(offre.description)}
                  />
                </TableCell>
                <TableCell>{new Date(offre.datePublication).toLocaleDateString("fr-FR")}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {new Date(offre.dateExpiration).toLocaleDateString("fr-FR")}
                    {expiringSoon && <span className="ml-2 text-amber-500 flex items-center"></span>}
                  </div>
                </TableCell>
                <TableCell>
                  {expiringSoon ? (
                    <ExpiringOfferActions
                      offre={offre}
                      hoursRemaining={hoursRemaining}
                      onDelete={handleSupprimer}
                      onOffreUpdated={handleOffreUpdated}
                    />
                  ) : (
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => setDeleteConfirmation(offre.id)}
                        disabled={processing === offre.id}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Supprimer
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      <Dialog open={deleteConfirmation !== null} onOpenChange={() => setDeleteConfirmation(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer cette offre ? Cette action est irréversible.
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmation(null)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={() => deleteConfirmation && handleSupprimer(deleteConfirmation)}>
              <AlertCircle className="w-4 h-4 mr-1" />
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <OffreEditDialog
        offre={selectedOffre}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onOffreUpdated={handleOffreUpdated}
        isExpiringSoon={selectedOffre ? isExpiringSoon(selectedOffre.dateExpiration) : false}
      />
    </>
  )
}