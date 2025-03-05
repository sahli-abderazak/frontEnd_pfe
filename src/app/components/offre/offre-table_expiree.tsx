"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"


interface Offre {
  id: number
  departement: string
  poste: string
  description: string
  datePublication: string
  dateExpiration: string
  valider: boolean
}

export function OffreTableExpiree({ refresh }: { refresh: boolean }) {
  const router = useRouter()
  const [offres, setOffres] = useState<Offre[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState<number | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState<number | null>(null)
  const [selectedOffre, setSelectedOffre] = useState<Offre | null>(null)
  const [isProlongationOpen, setIsProlongationOpen] = useState(false)

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

      const response = await fetch("http://127.0.0.1:8000/api/offres-expirees-departement", {
        method: "GET",
        headers: {
          Authorization:  `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token")
          router.push("/auth/login")
          return
        }
        throw new Error("Erreur de récupération des offres expirées")
      }

      const data = await response.json()
      setOffres(data)
      setError(null)
    } catch (error) {
      console.error("Erreur de récupération des offres:", error)
      setError("Erreur lors du chargement des offres expirées")
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchOffres()
  }, [fetchOffres])

  
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {offres.map((offre) => (
            <TableRow key={offre.id} className="bg-red-50">
              <TableCell>{offre.departement}</TableCell>
              <TableCell>{offre.poste}</TableCell>
              <TableCell className="max-w-md">
                <div
                  className="prose prose-sm max-h-32 overflow-y-auto"
                  dangerouslySetInnerHTML={createMarkup(offre.description)}
                />
              </TableCell>
              <TableCell>{new Date(offre.datePublication).toLocaleDateString("fr-FR")}</TableCell>
              <TableCell>
                <div className="flex items-center text-red-600">
                  {new Date(offre.dateExpiration).toLocaleDateString("fr-FR")}
                  <span className="ml-2">(Expirée)</span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

     
      
    </>
  )
}