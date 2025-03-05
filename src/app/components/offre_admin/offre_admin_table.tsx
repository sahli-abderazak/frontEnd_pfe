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
import { Check, Trash2, AlertCircle } from "lucide-react"

interface Offre {
  id: number
  departement: string
  poste: string
  description: string
  datePublication: string
  dateExpiration: string
}

export function OffreAdminTable({ refresh }: { refresh: boolean }) {
  const router = useRouter()
  const [offres, setOffres] = useState<Offre[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState<number | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState<number | null>(null)

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

      const response = await fetch("http://127.0.0.1:8000/api/Alloffresnvalide", {
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
        throw new Error("Erreur de récupération des offres non validées")
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

  const handleValider = async (offreId: number) => {
    setProcessing(offreId)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Vous devez être connecté pour valider une offre.")
        return
      }

      const response = await fetch(`http://127.0.0.1:8000/api/validerOffre/${offreId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erreur lors de la validation de l'offre")
      }

      setOffres(offres.filter((offre) => offre.id !== offreId))
    } catch (error) {
      console.error("Erreur de validation:", error)
      setError(error instanceof Error ? error.message : "Erreur lors de la validation de l'offre")
    } finally {
      setProcessing(null)
    }
  }

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
          {offres.map((offre) => (
            <TableRow key={offre.id}>
              <TableCell>{offre.departement}</TableCell>
              <TableCell>{offre.poste}</TableCell>
              <TableCell className="max-w-md">
                <div
                  className="prose prose-sm max-h-32 overflow-y-auto"
                  dangerouslySetInnerHTML={createMarkup(offre.description)}
                />
              </TableCell>
              <TableCell>{new Date(offre.datePublication).toLocaleDateString("fr-FR")}</TableCell>
              <TableCell>{new Date(offre.dateExpiration).toLocaleDateString("fr-FR")}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleValider(offre.id)}
                    disabled={processing === offre.id}
                    variant="outline"
                    size="sm"
                    className="text-green-600 border-green-600 hover:bg-green-50"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    {processing === offre.id ? "Validation..." : "Valider"}
                  </Button>
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
              </TableCell>
            </TableRow>
          ))}
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
    </>
  )
}

