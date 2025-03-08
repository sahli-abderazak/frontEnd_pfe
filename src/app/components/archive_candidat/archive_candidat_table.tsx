"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye, Download, Undo, Mail, Phone, MapPin, Briefcase, Calendar, GraduationCap, Clock } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

// Modifier la définition de l'interface Candidat pour inclure l'offre directement
interface Candidat {
  id: number
  nom: string
  prenom: string
  email: string
  pays: string
  ville: string
  codePostal: string
  niveauExperience: string
  tel: string
  niveauEtude: string
  cv?: string
  offre_id: number
  archived: boolean
  created_at: string
  offre?: {
    id: number
    departement: string
    poste: string
    domaine: string
    datePublication: string
  }
}

interface Offre {
  id: number
  departement: string
  poste: string
  domaine: string
  date_publication: string
}

interface ArchiveCandidatsTableProps {
  refresh: boolean
}

const ArchiveCandidatsTable: React.FC<ArchiveCandidatsTableProps> = ({ refresh }) => {
  const router = useRouter()
  const [candidats, setCandidats] = useState<Candidat[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [unarchiving, setUnarchiving] = useState<number | null>(null)
  const [selectedCandidat, setSelectedCandidat] = useState<Candidat | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isUnarchiveDialogOpen, setIsUnarchiveDialogOpen] = useState(false)
  const [candidatToUnarchive, setCandidatToUnarchive] = useState<number | null>(null)

  useEffect(() => {
    fetchArchivedCandidats()
  }, [refresh])

  const fetchArchivedCandidats = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Vous devez être connecté pour voir les candidats.")
        return
      }

      const response = await fetch("http://127.0.0.1:8000/api/candidats_archived_societe", {
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
        throw new Error("Erreur de récupération des candidats archivés")
      }

      const data = await response.json()
      setCandidats(data)
      setError(null)
    } catch (error) {
      console.error("Erreur de récupération des candidats archivés:", error)
      setError("Erreur lors du chargement des candidats")
    } finally {
      setLoading(false)
    }
  }

  const handleUnarchive = async (candidatId: number) => {
    setCandidatToUnarchive(candidatId)
    setIsUnarchiveDialogOpen(true)
  }

  const confirmUnarchive = async () => {
    if (!candidatToUnarchive) return

    setUnarchiving(candidatToUnarchive)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Vous devez être connecté pour désarchiver un candidat.")
        return
      }

      // Utiliser le bon endpoint API pour désarchiver
      const response = await fetch(`http://127.0.0.1:8000/api/candidats_desarchiver/${candidatToUnarchive}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erreur lors de la désarchivation du candidat")
      }

      setCandidats(candidats.filter((candidat) => candidat.id !== candidatToUnarchive))
      setIsUnarchiveDialogOpen(false)
      setCandidatToUnarchive(null)
    } catch (error) {
      console.error("Erreur de désarchivation:", error)
      setError(error instanceof Error ? error.message : "Erreur lors de la désarchivation du candidat")
    } finally {
      setUnarchiving(null)
    }
  }

  // Fonction pour afficher les détails d'un candidat
  const handleViewDetails = (candidat: Candidat) => {
    setSelectedCandidat(candidat)
    setIsDetailsOpen(true)
  }

  // Fonction pour télécharger le CV
  const handleDownloadCV = (cvUrl: string) => {
    window.open(cvUrl, "_blank")
  }

  // Fonction pour obtenir les initiales
  const getInitials = (nom: string, prenom: string) => {
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase()
  }

  // Fonction pour obtenir une couleur basée sur le nom
  const getColorClass = (nom: string) => {
    const colors = [
      "bg-blue-500",
      "bg-emerald-500",
      "bg-violet-500",
      "bg-amber-500",
      "bg-rose-500",
      "bg-indigo-500",
      "bg-teal-500",
      "bg-pink-500",
    ]
    const index = nom.charCodeAt(0) % colors.length
    return colors[index]
  }

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )

  if (error)
    return (
      <div className="p-6 text-center">
        <div className="text-red-500 text-lg font-medium">{error}</div>
      </div>
    )

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {candidats.map((candidat) => {
          const offre = candidat.offre
          return (
            <Card
              key={candidat.id}
              className="overflow-hidden transition-all duration-300 hover:shadow-lg flex flex-col h-full"
            >
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-4">
                  <Avatar className={`h-12 w-12 ${getColorClass(candidat.nom)}`}>
                    <AvatarFallback className="text-white font-medium">
                      {getInitials(candidat.nom, candidat.prenom)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg leading-none tracking-tight">
                      {candidat.prenom} {candidat.nom}
                    </h3>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Briefcase className="mr-1 h-3 w-3" />
                      {offre?.poste || "N/A"}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-2 flex-grow">
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center">
                    <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${candidat.email}`} className="text-blue-600 hover:underline truncate">
                      {candidat.email}
                    </a>
                  </div>
                  <div className="flex items-center">
                    <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{candidat.tel}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>
                      {candidat.ville}, {candidat.pays}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <GraduationCap className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{candidat.niveauEtude}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{candidat.niveauExperience}</span>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {candidat.offre && (
                    <>
                      <Badge variant="outline" className="bg-blue-50">
                        {candidat.offre.departement}
                      </Badge>
                      <Badge variant="outline" className="bg-emerald-50">
                        {candidat.offre.domaine}
                      </Badge>
                    </>
                  )}
                  <Badge variant="outline" className="bg-amber-50">
                    <Calendar className="mr-1 h-3 w-3" />
                    {new Date(candidat.created_at).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </Badge>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2 mt-auto">
                <Button variant="outline" size="sm" onClick={() => handleViewDetails(candidat)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Détails
                </Button>
                <div className="flex gap-2">
                  {candidat.cv && (
                    <Button variant="outline" size="sm" onClick={() => handleDownloadCV(candidat.cv)}>
                      <Download className="mr-2 h-4 w-4" />
                      CV
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUnarchive(candidat.id)}
                    disabled={unarchiving === candidat.id}
                  >
                    <Undo className="mr-2 h-4 w-4" />
                    {unarchiving === candidat.id ? "Désarchivage..." : "Désarchiver"}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {candidats.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-muted-foreground text-lg">Aucun candidat archivé trouvé</div>
        </div>
      )}

      {selectedCandidat && isDetailsOpen && (
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Détails du candidat</DialogTitle>
              <DialogDescription>Informations complètes du candidat et de l'offre associée</DialogDescription>
            </DialogHeader>

            <div className="flex items-center space-x-4 mb-6">
              <Avatar className={`h-16 w-16 ${getColorClass(selectedCandidat.nom)}`}>
                <AvatarFallback className="text-white text-xl font-medium">
                  {getInitials(selectedCandidat.nom, selectedCandidat.prenom)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">
                  {selectedCandidat.prenom} {selectedCandidat.nom}
                </h2>
                <p className="text-muted-foreground flex items-center">
                  <Briefcase className="mr-1 h-4 w-4" />
                  {selectedCandidat.offre?.poste || "N/A"} • {selectedCandidat.offre?.departement || "N/A"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Informations personnelles</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <Mail className="mr-3 h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Email</p>
                      <a href={`mailto:${selectedCandidat.email}`} className="text-blue-600 hover:underline">
                        {selectedCandidat.email}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Phone className="mr-3 h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Téléphone</p>
                      <p>{selectedCandidat.tel}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="mr-3 h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Adresse</p>
                      <p>
                        {selectedCandidat.ville}, {selectedCandidat.codePostal}
                      </p>
                      <p>{selectedCandidat.pays}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Informations professionnelles</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <GraduationCap className="mr-3 h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Niveau d'étude</p>
                      <p>{selectedCandidat.niveauEtude}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Clock className="mr-3 h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Expérience</p>
                      <p>{selectedCandidat.niveauExperience}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Calendar className="mr-3 h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Dates</p>
                      <p>
                        Candidature:{" "}
                        {selectedCandidat.created_at
                          ? new Date(selectedCandidat.created_at).toLocaleDateString("fr-FR")
                          : "N/A"}
                      </p>
                      {selectedCandidat.offre?.datePublication && (
                        <p>
                          Publication: {new Date(selectedCandidat.offre.datePublication).toLocaleDateString("fr-FR")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Détails de l'offre</h3>
              {selectedCandidat.offre ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium">Poste</p>
                    <p>{selectedCandidat.offre.poste}</p>
                  </div>
                  <div>
                    <p className="font-medium">Département</p>
                    <p>{selectedCandidat.offre.departement}</p>
                  </div>
                  <div>
                    <p className="font-medium">Domaine</p>
                    <p>{selectedCandidat.offre.domaine}</p>
                  </div>
                </div>
              ) : (
                <div className="text-muted-foreground">Informations de l'offre non disponibles</div>
              )}
            </div>

            <div className="flex justify-between mt-6">
              {selectedCandidat.cv && (
                <Button onClick={() => handleDownloadCV(selectedCandidat.cv)}>
                  <Download className="mr-2 h-4 w-4" />
                  Télécharger le CV
                </Button>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={() => handleUnarchive(selectedCandidat.id)}
                  disabled={unarchiving === selectedCandidat.id}
                >
                  <Undo className="mr-2 h-4 w-4" />
                  {unarchiving === selectedCandidat.id ? "Désarchivage..." : "Désarchiver"}
                </Button>
                <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                  Fermer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog de confirmation de désarchivage */}
      <Dialog open={isUnarchiveDialogOpen} onOpenChange={setIsUnarchiveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmation de désarchivage</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir désarchiver ce candidat ? 
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setIsUnarchiveDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={confirmUnarchive} disabled={unarchiving === candidatToUnarchive}>
              <Undo className="mr-2 h-4 w-4" />
              {unarchiving === candidatToUnarchive ? "Désarchivage..." : "Désarchiver"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ArchiveCandidatsTable