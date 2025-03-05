"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Modal } from "@/components/ui/modal"

type UserData = {
  id: number
  prenom: string
  nom: string
  email: string
  password: string
  numTel: string
  adresse: string
}

const initialUserData: UserData = {
  id: 0,
  prenom: "",
  nom: "",
  email: "",
  password: "",
  numTel: "",
  adresse: "",
}

export default function UserInfoCard() {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [userData, setUserData] = useState<UserData>(initialUserData)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("token")
      if (!token) throw new Error("Token non trouvé")

      const response = await fetch("http://127.0.0.1:8000/api/users/profile", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des données")
      }
      const data = await response.json()
      setUserData({
        ...data,
        password: "", // Ne pas afficher le mot de passe dans l'UI
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur inconnue s'est produite")
    } finally {
      setIsLoading(false)
    }
  }

  const openModal = () => setIsOpen(true)
  const closeModal = () => setIsOpen(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      const formData = new FormData();
  
      // S'assurer d'ajouter tous les champs, même si vides ou non modifiés
      formData.append("prenom", userData.prenom);
      formData.append("nom", userData.nom);
      formData.append("email", userData.email);
      formData.append("numTel", userData.numTel);
      formData.append("adresse", userData.adresse);
      formData.append("password", userData.password || ""); // Ajouter le champ du mot de passe
  
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token non trouvé");
  
      const response = await fetch(`http://127.0.0.1:8000/api/user/updateRec/${userData.id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la mise à jour");
      }
  
      const result = await response.json();
      // Rafraîchir les données utilisateur après la mise à jour réussie
      await fetchUserData();
  
      alert("Utilisateur mis à jour avec succès !");
      closeModal();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Une erreur inconnue s'est produite");
    }
  };

  if (isLoading) {
    return <div>Chargement...</div>
  }

  if (error) {
    return <div>Erreur: {error}</div>
  }

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">Informations Personnelles</h4>
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
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">{userData.numTel}</p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Adresse</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">{userData.adresse}</p>
            </div>
          </div>
        </div>

        <Button onClick={openModal} variant="outline" className="w-full lg:w-auto">
          Modifier
        </Button>
      </div>

      <Modal open={isOpen} onOpenChange={setIsOpen}>
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <form className="flex flex-col" onSubmit={handleSave}>
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
              <div className="mt-7">
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <Label htmlFor="prenom">Prénom</Label>
                    <Input
                      id="prenom"
                      type="text"
                      value={userData.prenom}
                      onChange={(e) => setUserData({ ...userData, prenom: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2 lg:col-span-1">
                    <Label htmlFor="nom">Nom</Label>
                    <Input
                      id="nom"
                      type="text"
                      value={userData.nom}
                      onChange={(e) => setUserData({ ...userData, nom: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2 lg:col-span-1">
                    <Label htmlFor="email">Adresse e-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={userData.email}
                      onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2 lg:col-span-1">
                    <Label htmlFor="password">Mot de passe</Label>
                    <Input
                      id="password"
                      type="password"
                      value={userData.password}
                      onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                      placeholder="Laissez vide pour ne pas modifier"
                    />
                  </div>
                  <div className="col-span-2 lg:col-span-1">
                    <Label htmlFor="numTel">Téléphone</Label>
                    <Input
                      id="numTel"
                      type="text"
                      value={userData.numTel}
                      onChange={(e) => setUserData({ ...userData, numTel: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="adresse">Adresse</Label>
                    <Input
                      id="adresse"
                      type="text"
                      value={userData.adresse}
                      onChange={(e) => setUserData({ ...userData, adresse: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button type="button" variant="outline" onClick={closeModal}>
                Fermer
              </Button>
              <Button type="submit">Enregistrer les modifications</Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  )
}
