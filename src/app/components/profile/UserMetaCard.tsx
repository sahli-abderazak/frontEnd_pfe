"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Camera, Upload } from "lucide-react"

interface User {
  id: number
  nom: string
  prenom: string
  poste: string
  departement: string
  image?: string
  nom_societe?: string
  email?: string
  numTel?: string
  adresse?: string
  cv?: string
}

export default function UserMetaCard() {
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Token non trouvé")
      }

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
        throw new Error("Erreur lors de la récupération du profil")
      }

      const data: User = await response.json()
      setUser(data)
    } catch (error: any) {
      console.error(error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)
      setPreviewImage(URL.createObjectURL(file))
    }
  }

  const uploadImage = async () => {
    if (!imageFile || !user) return

    try {
      setIsUploading(true)
      const token = localStorage.getItem("token")
      if (!token) throw new Error("Token non trouvé")

      const formData = new FormData()
      formData.append("image", imageFile)

      const response = await fetch(`http://localhost:8000/api/user/updateRec`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token")
          window.location.href = "/login"
          throw new Error("Session expirée")
        }
        throw new Error("Erreur lors de l'upload de l'image")
      }

      await fetchUserProfile()
      setPreviewImage(null)
      setImageFile(null)
      alert("Photo de profil mise à jour avec succès")
    } catch (error: any) {
      console.error(error)
      alert(error.message)
    } finally {
      setIsUploading(false)
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
          <div className="text-red-500">Erreur : {error}</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex items-center justify-center py-10">
          <div>Aucune donnée disponible</div>
        </div>
      </div>
    )
  }

  const displayImage = previewImage || user.image || "/placeholder.svg?height=128&width=128"
  const initials = user.nom && user.prenom ? `${user.prenom[0]}${user.nom[0]}`.toUpperCase() : "?"

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
          <div className="relative group">
            <div className="w-24 h-24 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
              {displayImage ? (
                <img
                  src={displayImage || "/placeholder.svg"}
                  alt={`Photo de ${user.nom}`}
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.onerror = null
                    target.src = "/placeholder.svg?height=128&width=128"
                  }}
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-gray-200 dark:bg-gray-700">
                  <span className="text-2xl font-semibold text-gray-500 dark:text-gray-400">{initials}</span>
                </div>
              )}
            </div>
            <label
              htmlFor="profile-image"
              className="absolute bottom-0 right-0 flex items-center justify-center w-8 h-8 bg-primary text-white rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
            >
              <Camera className="w-4 h-4" />
              <input
                type="file"
                id="profile-image"
                className="hidden"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleImageChange}
              />
            </label>
          </div>

          <div className="order-3 xl:order-2 flex flex-col items-center xl:items-start">
            <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
              {user.prenom} {user.nom}
            </h4>
            <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
              <p className="text-sm text-gray-500 dark:text-gray-400">{user.poste || "Non spécifié"}</p>
              <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user.departement || "Non spécifié"}</p>
            </div>
            {user.nom_societe && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{user.nom_societe}</p>}
          </div>
        </div>

        {previewImage && (
          <Button onClick={uploadImage} disabled={isUploading} className="mt-2 xl:mt-0">
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Chargement...
              </>
            ) : (
              <>
                Enregistrer la photo
                <Upload className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}

