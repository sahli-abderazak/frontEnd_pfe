"use client"

import { useState, useEffect } from "react"
import { DashboardHeaderRec } from "../components/recruteur/dashboard-header_rec"
import { DashboardSidebarRec } from "../components/recruteur/dashboard-sidebar_rec"
import { Loader2 } from "lucide-react"
import UserMetaCard from "../components/profile/UserMetaCard"
import UserInfoCard from "../components/profile/UserInfoCard"

export default function Profile() {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Vérifier si l'utilisateur est authentifié
    const token = localStorage.getItem("token")
    if (!token) {
      setIsLoading(false)
      if (typeof window !== "undefined") {
        window.location.href = "/login"
      }
      return
    }

    // Vérifier la validité du token
    const checkAuth = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/users/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          setIsAuthenticated(true)
        } else {
          if (response.status === 401) {
            localStorage.removeItem("token")
            if (typeof window !== "undefined") {
              window.location.href = "/login"
            }
          } else {
            const errorData = await response.json()
            setError(errorData.error || "Erreur lors de la vérification de l'authentification")
          }
        }
      } catch (error) {
        console.error("Erreur de vérification d'authentification:", error)
        setError("Erreur de connexion au serveur")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
          <h2 className="text-xl font-bold text-red-500 mb-2">Erreur</h2>
          <p className="text-gray-700 dark:text-gray-300">{error}</p>
          <button
            className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
            onClick={() => {
              localStorage.removeItem("token")
              window.location.href = "/login"
            }}
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Le useEffect redirigera vers la page de connexion
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <DashboardHeaderRec />
      <div className="container mx-auto p-4 md:p-6 lg:p-8 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          {/* Sidebar */}
          <div className="hidden md:block md:col-span-1 lg:col-span-1">
            <div className="sticky top-20">
              <DashboardSidebarRec />
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-5 lg:col-span-5 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Profil</h1>
                <p className="text-muted-foreground">Gérer vos informations personnelles</p>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
              <div className="space-y-6">
                <UserMetaCard />
                <UserInfoCard />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

