"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye, Download, Archive, Mail, Phone, MapPin, Briefcase, Calendar, GraduationCap, Clock } from "lucide-react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Offre {
  id: number
  departement: string
  domaine: string
  datePublication: string
  poste: string
}

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
  cv: string
  offre_id: number
  offre: Offre
  created_at: string
}

export function CandidatsTable({ refresh }: { refresh: boolean }) {
  const router = useRouter()
  const [candidats, setCandidats] = useState<Candidat[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCandidat, setSelectedCandidat] = useState<Candidat | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false)
  const [candidatToArchive, setCandidatToArchive] = useState<number | null>(null)

  useEffect(() => {
    const fetchCandidats = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          setError("Vous devez être connecté pour voir les candidats.")
          return
        }

        const response = await fetch("http://127.0.0.1:8000/api/candidats-offre", {
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
          throw new Error("Erreur de récupération des candidats")
        }

        const data = await response.json()
        setCandidats(data)
        setError(null)
      } catch (error) {
        console.error("Erreur de récupération des candidats:", error)
        setError("Erreur lors du chargement des candidats")
      } finally {
        setLoading(false)
      }
    }

    fetchCandidats()
  }, [refresh, router])

  // Fonction pour ouvrir le dialogue d'archivage
  const openArchiveDialog = (candidatId: number) => {
    setCandidatToArchive(candidatId)
    setIsArchiveDialogOpen(true)
  }

  // Fonction pour archiver un candidat
  const archiveCandidat = async () => {
    if (!candidatToArchive) return

    const token = localStorage.getItem("token")
    if (!token) {
      setError("Vous devez être connecté pour archiver un candidat.")
      return
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/candidats/archiver/${candidatToArchive}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Erreur lors de l'archivage du candidat")
      }

      // Mettre à jour l'état pour retirer le candidat du tableau
      setCandidats((prevCandidats) => prevCandidats.filter((candidat) => candidat.id !== candidatToArchive))
      setIsArchiveDialogOpen(false)
      setCandidatToArchive(null)
    } catch (error) {
      setError("Erreur lors de l'archivage du candidat.")
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
        {candidats.map((candidat) => (
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
                    {candidat.offre?.poste}
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
                <Badge variant="outline" className="bg-blue-50">
                  {candidat.offre?.departement}
                </Badge>
                <Badge variant="outline" className="bg-emerald-50">
                  {candidat.offre?.domaine}
                </Badge>
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
                <Button variant="outline" size="sm" onClick={() => openArchiveDialog(candidat.id)}>
                  <Archive className="mr-2 h-4 w-4" />
                  Archiver
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {candidats.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-muted-foreground text-lg">Aucun candidat trouvé</div>
        </div>
      )}

      {selectedCandidat && isDetailsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
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
                  {selectedCandidat.offre?.poste} • {selectedCandidat.offre?.departement}
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
                      <p>Candidature: {new Date(selectedCandidat.created_at).toLocaleDateString("fr-FR")}</p>
                      <p>
                        Publication: {new Date(selectedCandidat.offre?.datePublication).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Détails de l'offre</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">Poste</p>
                  <p>{selectedCandidat.offre?.poste}</p>
                </div>
                <div>
                  <p className="font-medium">Département</p>
                  <p>{selectedCandidat.offre?.departement}</p>
                </div>
                <div>
                  <p className="font-medium">Domaine</p>
                  <p>{selectedCandidat.offre?.domaine}</p>
                </div>
              </div>
            </div>

            {selectedCandidat.cv && (
              <div className="mt-6">
                <Button onClick={() => handleDownloadCV(selectedCandidat.cv)} className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Télécharger le CV
                </Button>
              </div>
            )}

            <div className="flex justify-end mt-6">
              <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Archive Confirmation Dialog */}
      <Dialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Archiver le candidat</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir archiver ce candidat ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 justify-end">
            <Button variant="outline" onClick={() => setIsArchiveDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={archiveCandidat}>
              Archiver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}