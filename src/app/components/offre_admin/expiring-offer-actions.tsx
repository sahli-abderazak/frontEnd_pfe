"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Clock, Edit, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { OffreEditDialog } from "./offre-edit-dialog"

interface Offre {
  id: number
  departement: string
  poste: string
  description: string
  datePublication: string
  dateExpiration: string
  valider: boolean
}

interface ExpiringOfferActionsProps {
  offre: Offre
  hoursRemaining: number
  onDelete: (id: number) => Promise<void>
  onOffreUpdated: () => void
}

export function ExpiringOfferActions({ offre, hoursRemaining, onDelete, onOffreUpdated }: ExpiringOfferActionsProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)

  const handleEdit = () => {
    setIsEditOpen(true)
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete(offre.id)
      setDeleteDialogOpen(false)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={() => setDeleteDialogOpen(true)}
        variant="outline"
        size="sm"
        className="text-red-600 border-red-600 hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4 mr-1" />
        Supprimer
      </Button>
      <Button onClick={handleEdit} variant="outline" size="sm">
        <Edit className="h-4 w-4 mr-1" />
        Modifier
      </Button>
      {hoursRemaining <= 24 && (
        <div className="flex items-center text-amber-500 text-sm mr-2">
          <Clock className="h-4 w-4 mr-1" />
          <span>Expire dans {hoursRemaining}h</span>
        </div>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer cette offre qui expire bientôt ? Cette action est irréversible.
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <OffreEditDialog
        offre={offre}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onOffreUpdated={onOffreUpdated}
        isExpiringSoon={true}
      />
    </div>
  )
}
