"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Editor } from "@tinymce/tinymce-react"
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
  poste: string
  description: string
  datePublication: string
  dateExpiration: string
  valider: boolean
}

interface OffreEditDialogProps {
  offre: Offre | null
  isOpen: boolean
  onClose: () => void
  onOffreUpdated: () => void
}

export function OffreEditDialog({ offre, isOpen, onClose, onOffreUpdated }: OffreEditDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Offre>>({
    departement: "",
    poste: "",
    description: "",
    dateExpiration: "",
  })
  const editorRef = useRef<any>(null)

  useEffect(() => {
    if (offre) {
      setFormData({
        departement: offre.departement,
        poste: offre.poste,
        description: offre.description,
        dateExpiration: offre.dateExpiration.split("T")[0],
      })
    }
  }, [offre])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!offre) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Vous devez être connecté pour modifier une offre.")
        return
      }

      const updatedFormData = {
        ...formData,
        description: editorRef.current ? editorRef.current.getContent() : formData.description,
      }

      const response = await fetch(`http://127.0.0.1:8000/api/offres-departement/${offre.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedFormData),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 400 && data.error) {
          setError(data.error)
        } else {
          throw new Error("Erreur lors de la modification de l'offre")
        }
        return
      }

      setSuccess("Offre modifiée avec succès !")
      onOffreUpdated()

      setTimeout(() => {
        onClose()
        setSuccess(null)
      }, 2000)
    } catch (error) {
      setError("Erreur lors de la modification de l'offre.")
    } finally {
      setLoading(false)
    }
  }

  const today = new Date().toISOString().split("T")[0]

  if (!offre) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Modifier l'offre</DialogTitle>
          <DialogDescription>
            Modifiez les informations de l'offre d'emploi.
            {offre.valider && (
              <span className="block text-yellow-600 mt-2">
                Attention : Cette offre est déjà validée et ne peut pas être modifiée.
              </span>
            )}
          </DialogDescription>
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
                onChange={handleInputChange}
                className="col-span-3"
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
                disabled={offre.valider}
              />
            </div>
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
                  disabled={offre.valider}
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
                disabled={offre.valider}
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          {success && <p className="text-green-500 text-sm mt-2">{success}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading || offre.valider}>
              {loading ? "Modification en cours..." : "Modifier l'offre"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}