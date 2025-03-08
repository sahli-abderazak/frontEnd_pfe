"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Pencil, Trash2, Calendar, Clock, ChevronDown, ChevronUp } from "lucide-react"
import { useRouter } from "next/navigation"
import { OffreEditDialogExpiree } from "./offre-edit-dialog_Expiree"

interface Offre {
  id: number
  departement: string
  domaine: string
  poste: string
  description: string
  datePublication: string
  dateExpiration: string
  typePoste: string
  typeTravail: string
  heureTravail: string
  niveauExperience: string
  niveauEtude: string
  responsabilite: string
  experience: string
  valider: boolean
}

function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
}) {
  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <DialogDescription>{message}</DialogDescription>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm()
              onClose()
            }}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Supprimer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function OffreTableValide({ refresh }: { refresh: boolean }) {
  const router = useRouter()
  const [offres, setOffres] = useState<Offre[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedOffre, setSelectedOffre] = useState<Offre | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [expandedOffre, setExpandedOffre] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<Record<number, string>>({})

  const fetchOffres = useCallback(async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Vous devez être connecté pour voir les offres.")
        return
      }

      const response = await fetch("http://127.0.0.1:8000/api/offres-recruteur-valides", {
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

      // Initialize active tab for each offre
      const initialTabs: Record<number, string> = {}
      data.forEach((offre: Offre) => {
        initialTabs[offre.id] = "details"
      })
      setActiveTab(initialTabs)

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
  }, [fetchOffres, refresh])

  const handleDeleteClick = (offre: Offre) => {
    setSelectedOffre(offre)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedOffre) return

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Vous devez être connecté pour supprimer une offre.")
        return
      }

      const response = await fetch(`http://127.0.0.1:8000/api/supprimerOffre/${selectedOffre.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression de l'offre")
      }

      fetchOffres()
    } catch (error) {
      console.error("Erreur lors de la suppression:", error)
    } finally {
      setIsDeleteDialogOpen(false)
      setSelectedOffre(null)
    }
  }

  const toggleExpand = (offreId: number) => {
    setExpandedOffre(expandedOffre === offreId ? null : offreId)
  }

  const handleTabChange = (offreId: number, tab: string) => {
    setActiveTab((prev) => ({
      ...prev,
      [offreId]: tab,
    }))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR")
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

  if (loading) return <div>Chargement...</div>
  if (error) return <div className="text-red-500">{error}</div>

  return (
    <div className="space-y-4">
      {offres.map((offre) => {
        const hoursRemaining = calculateHoursRemaining(offre.dateExpiration)
        const expiringSoon = isExpiringSoon(offre.dateExpiration)

        return (
          <Card key={offre.id} className={expiringSoon ? "border-amber-300 bg-amber-50" : "border-green-200"}>
            <CardHeader className="p-4">
              <div className="flex flex-col space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {offre.domaine || offre.departement}
                    </Badge>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Validée
                    </Badge>
                    {expiringSoon && (
                      <Badge variant="secondary" className="bg-amber-100 text-amber-800 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Expire dans {hoursRemaining}h
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{offre.poste}</h3>
                  <div className="flex items-center gap-2">
                    {expiringSoon && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedOffre(offre)
                          setIsEditOpen(true)
                        }}
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        Modifier
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => handleDeleteClick(offre)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Supprimer
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => toggleExpand(offre.id)}>
                      {expandedOffre === offre.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex gap-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Publication: {formatDate(offre.datePublication)}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Expiration: {formatDate(offre.dateExpiration)}
                  </div>
                </div>
              </div>
            </CardHeader>

            {expandedOffre === offre.id && (
              <CardContent className="border-t">
                <div className="border-b">
                  <div className="flex">
                    <Button
                      variant={activeTab[offre.id] === "details" ? "secondary" : "ghost"}
                      onClick={() => handleTabChange(offre.id, "details")}
                      className="rounded-none"
                    >
                      Détails
                    </Button>
                    <Button
                      variant={activeTab[offre.id] === "description" ? "secondary" : "ghost"}
                      onClick={() => handleTabChange(offre.id, "description")}
                      className="rounded-none"
                    >
                      Description
                    </Button>
                    <Button
                      variant={activeTab[offre.id] === "responsabilites" ? "secondary" : "ghost"}
                      onClick={() => handleTabChange(offre.id, "responsabilites")}
                      className="rounded-none"
                    >
                      Responsabilités
                    </Button>
                    <Button
                      variant={activeTab[offre.id] === "experience" ? "secondary" : "ghost"}
                      onClick={() => handleTabChange(offre.id, "experience")}
                      className="rounded-none"
                    >
                      Expérience requise
                    </Button>
                  </div>
                </div>

                <div className="p-4">
                  {activeTab[offre.id] === "details" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Type de poste</h4>
                        <p>{offre.typePoste || "Non spécifié"}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Type de travail</h4>
                        <p>{offre.typeTravail || "Non spécifié"}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Heures de travail</h4>
                        <p>{offre.heureTravail || "Non spécifié"}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Niveau d'expérience</h4>
                        <p>{offre.niveauExperience || "Non spécifié"}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Niveau d'étude</h4>
                        <p>{offre.niveauEtude || "Non spécifié"}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Date de publication</h4>
                        <p>{formatDate(offre.datePublication)}</p>
                      </div>
                    </div>
                  )}

                  {activeTab[offre.id] === "description" && (
                    <div className="prose prose-sm max-w-none">{offre.description}</div>
                  )}

                  {activeTab[offre.id] === "responsabilites" && (
                    <div className="prose prose-sm max-w-none">
                      {offre.responsabilite || "Aucune responsabilité spécifiée"}
                    </div>
                  )}

                  {activeTab[offre.id] === "experience" && (
                    <div className="prose prose-sm max-w-none">
                      {offre.experience || "Aucune expérience requise spécifiée"}
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        )
      })}

      <OffreEditDialogExpiree
        offre={selectedOffre}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onOffreUpdated={fetchOffres}
        isExpiringSoon={selectedOffre ? isExpiringSoon(selectedOffre.dateExpiration) : false}
      />

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Confirmer la suppression"
        message="Êtes-vous sûr de vouloir supprimer cette offre ? Cette action est irréversible."
      />
    </div>
  )
}