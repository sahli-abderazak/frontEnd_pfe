"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import "../styles/user-dialogs.css"

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
  nom_societe: string
}

interface UserDetailsDialogProps {
  user: User | null
  isOpen: boolean
  onClose: () => void
}

export function UserDetailsDialog({ user, isOpen, onClose }: UserDetailsDialogProps) {
  if (!user) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="user-details-dialog">
        <DialogHeader>
          <DialogTitle className="dialog-title">Détails du recruteur</DialogTitle>
        </DialogHeader>

        <div className="user-details-content">
          {/* Profile header with image and name */}
          <div className="profile-header">
            <div className="profile-image-container">
              {user.image ? (
                <Image
                  src={user.image || "/placeholder.svg"}
                  alt={`Photo de ${user.nom}`}
                  width={120}
                  height={120}
                  unoptimized
                  className="profile-image"
                />
              ) : (
                <div className="profile-image-placeholder">
                  {user.prenom?.[0]}
                  {user.nom?.[0]}
                </div>
              )}
            </div>
            <h2 className="profile-name">
              {user.prenom} {user.nom}
            </h2>
            <div className="profile-position">{user.poste || "Poste non spécifié"}</div>
            <div className="profile-company">{user.nom_societe || "Société non spécifiée"}</div>
          </div>

          {/* User information */}
          <div className="info-section">
            <h3 className="section-title">Informations de contact</h3>

            <div className="info-grid">
              <div className="info-item">
                <div className="info-icon">📧</div>
                <div className="info-content">
                  <Label className="info-label">Email</Label>
                  <div className="info-value">{user.email}</div>
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon">📱</div>
                <div className="info-content">
                  <Label className="info-label">Téléphone</Label>
                  <div className="info-value">{user.numTel || "Non renseigné"}</div>
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon">🏢</div>
                <div className="info-content">
                  <Label className="info-label">Département</Label>
                  <div className="info-value">{user.departement || "Non renseigné"}</div>
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon">📍</div>
                <div className="info-content">
                  <Label className="info-label">Adresse</Label>
                  <div className="info-value">{user.adresse || "Non renseignée"}</div>
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon">📅</div>
                <div className="info-content">
                  <Label className="info-label">Date d'inscription</Label>
                  <div className="info-value">{new Intl.DateTimeFormat("fr-FR").format(new Date(user.created_at))}</div>
                </div>
              </div>

              {user.cv && (
                <div className="info-item">
                  <div className="info-icon">📄</div>
                  <div className="info-content">
                    <Label className="info-label">CV</Label>
                    <a href={user.cv} target="_blank" rel="noopener noreferrer" className="cv-link">
                      Voir le CV
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}