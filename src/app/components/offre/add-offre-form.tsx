"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Editor } from "@tinymce/tinymce-react"
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
import { useRouter } from "next/navigation"

export function AddOffreForm({ onOffreAdded }: { onOffreAdded: () => void }) {
  const router = useRouter()
  const editorRef = useRef<any>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [userDepartement, setUserDepartement] = useState<string>("")

  const [formData, setFormData] = useState({
    departement: "",
    poste: "",
    description: "",
    dateExpiration: "",
  })

  useEffect(() => {
    const fetchUserDepartement = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          setError("Vous devez être connecté pour ajouter une offre.")
          router.push("/auth/login")
          return
        }

        const response = await fetch("http://127.0.0.1:8000/api/user", {
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
          throw new Error("Erreur lors de la récupération des informations utilisateur")
        }

        const userData = await response.json()
        setUserDepartement(userData.departement)
        setFormData((prev) => ({
          ...prev,
          departement: userData.departement,
        }))
      } catch (error) {
        console.error("Erreur:", error)
        setError("Erreur lors de la récupération du département")
      }
    }

    if (isOpen) {
      fetchUserDepartement()
    }
  }, [isOpen, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Vous devez être connecté pour ajouter une offre.")
        return
      }

      const response = await fetch("http://127.0.0.1:8000/api/addOffres", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          description: editorRef.current ? editorRef.current.getContent() : "",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Une erreur est survenue lors de l'ajout de l'offre.")
        return
      }

      setSuccess("Offre ajoutée avec succès !")

      setFormData({
        departement: userDepartement,
        poste: "",
        description: "",
        dateExpiration: "",
      })

      onOffreAdded()

      setTimeout(() => {
        setIsOpen(false)
        setSuccess(null)
      }, 2000)
    } catch (error) {
      setError("Erreur lors de l'ajout de l'offre.")
    } finally {
      setLoading(false)
    }
  }

  const today = new Date().toISOString().split("T")[0]

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter une offre
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Ajouter une offre</DialogTitle>
          <DialogDescription>Remplissez les informations de la nouvelle offre d'emploi.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="departement" className="text-right">
                Département
              </Label>
              <Input
                id="departement"
                name="departement"
                value={formData.departement}
                className="col-span-3 bg-muted"
                disabled
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="poste" className="text-right">
                Poste
              </Label>
              <Input
                id="poste"
                name="poste"
                value={formData.poste}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>

            {/* TinyMCE pour la description */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">
                Description
              </Label>
              <div className="col-span-3">
                <Editor
                  apiKey="9hyyyy3l4891dlltjtv5lokxspcs8107vmaju12bwhtywf1k"
                  onInit={(_evt, editor) => (editorRef.current = editor)}
                  initialValue={formData.description}
                  init={{
                    height: 250,
                    menubar: false,
                    plugins: [],
                    toolbar: "bold italic | alignleft aligncenter alignright alignjustify",
                    formats: {
                      alignleft: { selector: "p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img", classes: "text-left" },
                      aligncenter: {
                        selector: "p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img",
                        classes: "text-center",
                      },
                      alignright: {
                        selector: "p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img",
                        classes: "text-right",
                      },
                      alignjustify: {
                        selector: "p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img",
                        classes: "text-justify",
                      },
                    },
                    forced_root_block: "p",
                    content_style: `
                      body { 
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                        font-size: 14px;
                        line-height: 1.4;
                        margin: 1rem;
                      }
                      .text-left { text-align: left; }
                      .text-center { text-align: center; }
                      .text-right { text-align: right; }
                      .text-justify { text-align: justify; }
                    `,
                    branding: false,
                    promotion: false,
                    statusbar: false,
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dateExpiration" className="text-right">
                Date d'expiration
              </Label>
              <Input
                id="dateExpiration"
                name="dateExpiration"
                type="date"
                min={today}
                value={formData.dateExpiration}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          {success && <p className="text-green-500 text-sm mt-2">{success}</p>}

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Ajout en cours..." : "Ajouter l'offre"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

