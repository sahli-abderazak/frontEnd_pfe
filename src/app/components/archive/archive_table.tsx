'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: number
  nom: string
  prenom: string
  email: string
  created_at: string
  departement: string
  numTel: string
  poste: string
  adresse: string
  image?: string
  cv?: string
}

interface ArchiveTableProps {
  refresh: boolean
}

const ArchiveTable: React.FC<ArchiveTableProps> = ({ refresh }) => {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [unarchiving, setUnarchiving] = useState<number | null>(null)

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

  const handleUnarchive = async (userId: number) => {
    setUnarchiving(userId)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Vous devez être connecté pour désarchiver un utilisateur.")
        return
      }

      const response = await fetch(`http://127.0.0.1:8000/api/users/unarchive/${userId}`, {
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

      setUsers(users.filter((user) => user.id !== userId))
    } catch (error) {
      console.error("Erreur de désarchivation:", error)
      setError(error instanceof Error ? error.message : "Erreur lors de la désarchivation de l'utilisateur")
    } finally {
      setUnarchiving(null)
    }
  }

  if (loading) return <div className="p-4 text-gray-600">Chargement...</div>
  if (error) return <div className="p-4 text-red-500">{error}</div>

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Prénom</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Département</TableHead>
            <TableHead>Poste</TableHead>
            <TableHead>Téléphone</TableHead>
            <TableHead>Date d'inscription</TableHead>
            <TableHead>CV</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.nom}</TableCell>
              <TableCell>{user.prenom}</TableCell>
              <TableCell>
                <a
                  href={`https://mail.google.com/mail/?view=cm&fs=1&to=${user.email}`}
                  className="text-blue-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {user.email}
                </a>
              </TableCell>
              <TableCell>{user.departement}</TableCell>
              <TableCell>{user.poste}</TableCell>
              <TableCell>{user.numTel}</TableCell>
              <TableCell>{new Intl.DateTimeFormat("fr-FR").format(new Date(user.created_at))}</TableCell>
              <TableCell>
                {user.cv ? (
                  <a href={user.cv} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Voir CV
                  </a>
                ) : (
                  "Pas de CV"
                )}
              </TableCell>
              <TableCell>
                <Button onClick={() => handleUnarchive(user.id)} disabled={unarchiving === user.id}>
                  {unarchiving === user.id ? "Désarchivage..." : "Désarchiver"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}

export default ArchiveTable
