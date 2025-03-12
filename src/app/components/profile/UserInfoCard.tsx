"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Loader2, Save, X, FileText } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

interface User {
  id: number
  prenom: string
  nom: string
  email: string
  departement: string
  poste: string
  numTel: string
  adresse: string
  nom_societe?: string
  role?: string
  cv?: string
  image?: string
}

export default function UserInfoCard() {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [userData, setUserData] = useState<User | null>(null)
  const [formData, setFormData] = useState<Partial<User> & { password?: string }>({})
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("personal")
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("token")
      if (!token) throw new Error("Token non trouvé")

      const response = await fetch("http://localhost:8000/api/users/profile", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token")
          window.location.href = "/login"
          throw new Error("Session expirée")
        }
        throw new Error("Erreur lors de la récupération des données")
      }

      const data = await response.json()
      setUserData(data)
      setFormData({
        ...data,
        password: "", // Ne pas afficher le mot de passe dans l'UI
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur inconnue s'est produite")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCvFile(e.target.files[0])
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0])
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!userData) return

    try {
      setIsSaving(true)
      const token = localStorage.getItem("token")
      if (!token) throw new Error("Token non trouvé")

      const formDataToSend = new FormData()

      // Ajouter tous les champs du formulaire
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null && key !== "id" && key !== "image" && key !== "cv") {
          formDataToSend.append(key, value.toString())
        }
      })

      // Ajouter le CV si sélectionné
      if (cvFile) {
        formDataToSend.append("cv", cvFile)
      }

      // Ajouter l'image si sélectionnée
      if (imageFile) {
        formDataToSend.append("image", imageFile)
      }

      const response = await fetch(`http://localhost:8000/api/user/updateRec`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token")
          window.location.href = "/login"
          throw new Error("Session expirée")
        }

        const errorData = await response.json()
        throw new Error(errorData.error || "Erreur lors de la mise à jour")
      }

      await fetchUserData()
      setIsOpen(false)
      alert("Profil mis à jour avec succès !")
    } catch (err) {
      alert(err instanceof Error ? err.message : "Une erreur inconnue s'est produite")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex items-center justify-center py-10">
          <div className="text-red-500">Erreur: {error}</div>
        </div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex items-center justify-center py-10">
          <div>Aucune donnée disponible</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="w-full">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-6">Informations Personnelles</h4>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Prénom</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">{userData.prenom}</p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Nom</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">{userData.nom}</p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Adresse e-mail</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">{userData.email}</p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Téléphone</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">{userData.numTel || "-"}</p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Adresse</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">{userData.adresse || "-"}</p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Département</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">{userData.departement || "-"}</p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Poste</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">{userData.poste || "-"}</p>
            </div>
            {userData.role && (
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Rôle</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">{userData.role}</p>
              </div>
            )}
            {userData.nom_societe && (
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Société</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">{userData.nom_societe}</p>
              </div>
            )}
            {userData.cv && (
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">CV</p>
                <a
                  href={userData.cv}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-sm font-medium text-primary hover:text-primary/80"
                >
                  <FileText className="w-4 h-4 mr-1" />
                  Voir le CV
                </a>
              </div>
            )}
          </div>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full lg:w-auto">
              Modifier
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Modifier vos informations</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="mt-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="personal">Informations personnelles</TabsTrigger>
                  <TabsTrigger value="security">Sécurité</TabsTrigger>
                </TabsList>
                <TabsContent value="personal" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="prenom">Prénom</Label>
                      <Input id="prenom" name="prenom" value={formData.prenom || ""} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nom">Nom</Label>
                      <Input id="nom" name="nom" value={formData.nom || ""} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="numTel">Téléphone</Label>
                      <Input id="numTel" name="numTel" value={formData.numTel || ""} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="departement">Département</Label>
                      <Input
                        id="departement"
                        name="departement"
                        value={formData.departement || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="poste">Poste</Label>
                      <Input id="poste" name="poste" value={formData.poste || ""} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="adresse">Adresse</Label>
                      <Textarea
                        id="adresse"
                        name="adresse"
                        value={formData.adresse || ""}
                        onChange={handleInputChange}
                        rows={3}
                      />
                    </div>
                    {userData.nom_societe !== undefined && (
                      <div className="space-y-2">
                        <Label htmlFor="nom_societe">Société</Label>
                        <Input
                          id="nom_societe"
                          name="nom_societe"
                          value={formData.nom_societe || ""}
                          onChange={handleInputChange}
                        />
                      </div>
                    )}
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="cv">CV (PDF)</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="cv"
                          name="cv"
                          type="file"
                          accept=".pdf"
                          onChange={handleCvChange}
                          className="flex-1"
                        />
                        {userData.cv && (
                          <a
                            href={userData.cv}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-sm font-medium text-primary hover:text-primary/80"
                          >
                            <FileText className="w-4 h-4 mr-1" />
                            Actuel
                          </a>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {cvFile ? cvFile.name : "Laissez vide pour conserver le CV actuel"}
                      </p>
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="image">Photo de profil</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="image"
                          name="image"
                          type="file"
                          accept="image/jpeg,image/png,image/jpg"
                          onChange={handleImageChange}
                          className="flex-1"
                        />
                        {userData.image && (
                          <div className="w-10 h-10 rounded-full overflow-hidden">
                            <img
                              src={userData.image || "/placeholder.svg"}
                              alt="Photo de profil"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.onerror = null
                                target.src = "/placeholder.svg?height=40&width=40"
                              }}
                            />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {imageFile ? imageFile.name : "Laissez vide pour conserver l'image actuelle"}
                      </p>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="security" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Nouveau mot de passe</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password || ""}
                      onChange={handleInputChange}
                      placeholder="Laissez vide pour ne pas modifier"
                    />
                    <p className="text-xs text-gray-500">Le mot de passe doit contenir au moins 8 caractères</p>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-2 mt-6">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isSaving}>
                  <X className="w-4 h-4 mr-2" />
                  Annuler
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Enregistrer
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

