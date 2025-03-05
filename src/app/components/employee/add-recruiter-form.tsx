"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"

export function AddRecruiterForm({ onRecruiterAdded }: { onRecruiterAdded: () => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    password: "",
    departement: "",
    numTel: "",
    poste: "",
    adresse: "",
    image: null as File | null,
    cv: null as File | null,
  })

  // Gestion des champs texte
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Gestion des fichiers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target
    if (files && files.length > 0) {
      setFormData((prev) => ({ ...prev, [name]: files[0] })) // Stocke le fichier
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Vous devez être connecté pour ajouter un recruteur.")
        return
      }

      // Ajouter "recruteur" comme rôle
      const formDataToSend = new FormData()
      Object.entries({...formData, role: "recruteur"}).forEach(([key, value]) => {
        if (value) formDataToSend.append(key, value)
      })

      const response = await fetch("http://127.0.0.1:8000/api/register", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Une erreur est survenue.")
        return
      }

      setSuccess("Recruteur ajouté avec succès !")
      setTimeout(() => {
        setIsOpen(false)
        setSuccess(null)
        onRecruiterAdded()
      }, 2000)

      // Réinitialiser les champs
      setFormData({
        nom: "",
        prenom: "",
        email: "",
        password: "",
        departement: "",
        numTel: "",
        poste: "",
        adresse: "",
        image: null,
        cv: null,
      })
    } catch (error) {
      setError("Erreur lors de l'ajout du recruteur.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un recruteur
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ajouter un recruteur</DialogTitle>
          <DialogDescription>Remplissez les informations du nouveau recruteur.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="grid gap-4 py-4">
            {[{ id: "nom", label: "Nom" },
              { id: "prenom", label: "Prénom" },
              { id: "email", label: "Email", type: "email" },
              { id: "password", label: "Mot de passe", type: "password" },
              { id: "departement", label: "Département" },
              { id: "numTel", label: "Téléphone" },
              { id: "poste", label: "Poste" },
              { id: "adresse", label: "Adresse" },
            ].map(({ id, label, type = "text" }) => (
              <div key={id} className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor={id} className="text-right">
                  {label}
                </Label>
                <Input
                  id={id}
                  name={id}
                  type={type}
                  value={(formData as any)[id]}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
            ))}

            {/* Champ pour l'image */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="image" className="text-right">
                Image
              </Label>
              <Input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="col-span-3"
                required
              />
            </div>

            {/* Champ pour le CV */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cv" className="text-right">
                CV (PDF)
              </Label>
              <Input
                id="cv"
                name="cv"
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="col-span-3"
                required
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-500 text-sm">{success}</p>}

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Ajout en cours..." : "Ajouter le recruteur"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
