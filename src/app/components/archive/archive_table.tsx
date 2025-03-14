"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye, Undo, Mail, Phone, MapPin, Briefcase, Calendar, Building, User } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

interface ArchiveTableProps {
  refresh: boolean
}

const ArchiveTable: React.FC<ArchiveTableProps> = ({ refresh }) => {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [unarchiving, setUnarchiving] = useState<number | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [userToUnarchive, setUserToUnarchive] = useState<number | null>(null)

  useEffect(() => {
    fetchArchivedUsers()
  }, [refresh])

  const fetchArchivedUsers = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Vous devez être connecté pour voir les utilisateurs.")
        return
      }

      const response = await fetch("http://127.0.0.1:8000/api/users/archived", {
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
        throw new Error("Erreur de récupération des utilisateurs archivés")
      }

      const data = await response.json()
      setUsers(data)
      setError(null)
    } catch (error) {
      console.error("Erreur de récupération des utilisateurs archivés:", error)
      setError("Erreur lors du chargement des utilisateurs")
    } finally {
      setLoading(false)
    }
  }

  const confirmUnarchive = (userId: number) => {
    setUserToUnarchive(userId)
    setIsConfirmOpen(true)
  }

  const handleUnarchive = async () => {
    if (!userToUnarchive) return

    setUnarchiving(userToUnarchive)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Vous devez être connecté pour désarchiver un utilisateur.")
        return
      }

      const response = await fetch(`http://127.0.0.1:8000/api/users/unarchive/${userToUnarchive}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erreur lors de la désarchivation de l'utilisateur")
      }

      setUsers(users.filter((user) => user.id !== userToUnarchive))
      setIsConfirmOpen(false)

      // Utiliser une notification plus moderne au lieu de alert
      // Pour l'instant on garde alert pour ne pas ajouter de nouveaux composants
    } catch (error) {
      console.error("Erreur de désarchivation:", error)
      setError(error instanceof Error ? error.message : "Erreur lors de la désarchivation de l'utilisateur")
    } finally {
      setUnarchiving(null)
      setUserToUnarchive(null)
    }
  }

  // Fonction pour afficher les détails d'un utilisateur
  const handleViewDetails = (user: User) => {
    setSelectedUser(user)
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

  // Formater la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
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
        {users.map((user) => (
          <Card
            key={user.id}
            className="overflow-hidden transition-all duration-300 hover:shadow-lg flex flex-col h-full"
          >
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-4">
                <Avatar className={`h-12 w-12 ${getColorClass(user.nom)}`}>
                  <AvatarFallback className="text-white font-medium">
                    {getInitials(user.nom, user.prenom)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg leading-none tracking-tight">
                    {user.prenom} {user.nom}
                  </h3>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Briefcase className="mr-1 h-3 w-3" />
                    {user.poste || "N/A"}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-2 flex-grow">
              <div className="grid gap-2 text-sm">
                <div className="flex items-center">
                  <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                  <a
                    href={`https://mail.google.com/mail/?view=cm&fs=1&to=${user.email}`}
                    className="text-blue-600 hover:underline truncate"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {user.email}
                  </a>
                </div>
                <div className="flex items-center">
                  <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{user.numTel}</span>
                </div>
                {user.nom_societe && (
                  <div className="flex items-center">
                    <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{user.nom_societe}</span>
                  </div>
                )}
                {user.adresse && (
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{user.adresse}</span>
                  </div>
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-blue-50">
                  {user.departement}
                </Badge>
                <Badge variant="outline" className="bg-amber-50">
                  <Calendar className="mr-1 h-3 w-3" />
                  {formatDate(user.created_at)}
                </Badge>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-2 mt-auto">
              <Button variant="outline" size="sm" onClick={() => handleViewDetails(user)}>
                <Eye className="mr-2 h-4 w-4" />
                Détails
              </Button>
              <div className="flex gap-2">
                {user.cv && (
                  <Button variant="outline" size="sm" onClick={() => handleDownloadCV(user.cv)}>
                    <User className="mr-2 h-4 w-4" />
                    CV
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => confirmUnarchive(user.id)}
                  disabled={unarchiving === user.id}
                >
                  <Undo className="mr-2 h-4 w-4" />
                  {unarchiving === user.id ? "Désarchivage..." : "Désarchiver"}
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {users.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-muted-foreground text-lg">Aucun utilisateur archivé trouvé</div>
        </div>
      )}

      {selectedUser && isDetailsOpen && (
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Détails de l'utilisateur</DialogTitle>
              <DialogDescription>Informations complètes de l'utilisateur archivé</DialogDescription>
            </DialogHeader>

            <div className="flex items-center space-x-4 mb-6">
              <Avatar className={`h-16 w-16 ${getColorClass(selectedUser.nom)}`}>
                <AvatarFallback className="text-white text-xl font-medium">
                  {getInitials(selectedUser.nom, selectedUser.prenom)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">
                  {selectedUser.prenom} {selectedUser.nom}
                </h2>
                <p className="text-muted-foreground flex items-center">
                  <Briefcase className="mr-1 h-4 w-4" />
                  {selectedUser.poste} • {selectedUser.departement}
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
                      <a
                        href={`https://mail.google.com/mail/?view=cm&fs=1&to=${selectedUser.email}`}
                        className="text-blue-600 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {selectedUser.email}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Phone className="mr-3 h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Téléphone</p>
                      <p>{selectedUser.numTel}</p>
                    </div>
                  </div>
                  {selectedUser.adresse && (
                    <div className="flex items-start">
                      <MapPin className="mr-3 h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Adresse</p>
                        <p>{selectedUser.adresse}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Informations professionnelles</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <Building className="mr-3 h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Département</p>
                      <p>{selectedUser.departement}</p>
                    </div>
                  </div>
                  {selectedUser.nom_societe && (
                    <div className="flex items-start">
                      <Building className="mr-3 h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Société</p>
                        <p>{selectedUser.nom_societe}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start">
                    <Briefcase className="mr-3 h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Poste</p>
                      <p>{selectedUser.poste}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Calendar className="mr-3 h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Date d'inscription</p>
                      <p>{formatDate(selectedUser.created_at)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              {selectedUser.cv && (
                <Button onClick={() => handleDownloadCV(selectedUser.cv)}>
                  <User className="mr-2 h-4 w-4" />
                  Voir CV
                </Button>
              )}

              <Button onClick={() => confirmUnarchive(selectedUser.id)} disabled={unarchiving === selectedUser.id}>
                <Undo className="mr-2 h-4 w-4" />
                {unarchiving === selectedUser.id ? "Désarchivage..." : "Désarchiver"}
              </Button>
              <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                Fermer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Boîte de dialogue de confirmation de désarchivage */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmer la désarchivation</DialogTitle>
            <DialogDescription>Êtes-vous sûr de vouloir désarchiver cet utilisateur ?</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleUnarchive} disabled={unarchiving !== null}>
              {unarchiving !== null ? (
                <div className="flex items-center">
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent border-white rounded-full"></div>
                  Désarchivage...
                </div>
              ) : (
                <>
                  <Undo className="mr-2 h-4 w-4" />
                  Désarchiver
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ArchiveTable