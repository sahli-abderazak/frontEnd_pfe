import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { User } from "./ReviewsTable"; // Assurez-vous que le chemin est correct

interface UserEditFormProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedUser: User) => void;
}

export function UserEditForm({ user, isOpen, onClose, onSubmit }: UserEditFormProps) {
  const [updatedUser, setUpdatedUser] = useState<User>(user);
  const [loading, setLoading] = useState(false); // Indicateur de chargement

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUpdatedUser((prev: User) => ({
      ...prev,
      [name]: value,
    }));
  };

  const updateUser = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token"); // Récupérer le token d'authentification
      if (!token) {
        alert("Utilisateur non authentifié");
        return;
      }

      const response = await fetch(`http://localhost:8000/api/user/update/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          departement: updatedUser.departement || null,
          poste: updatedUser.poste || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour de l'utilisateur");
      }

      const data = await response.json();
      alert("Utilisateur mis à jour avec succès !");
      onSubmit(updatedUser); // Met à jour l'état dans le parent
      onClose(); // Ferme le modal
    } catch (error) {
      console.error("Erreur :", error);
      alert("Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    updateUser();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modifier le recruteur</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Informations non modifiables */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right font-medium">Nom</Label>
            <div className="col-span-3 text-sm">{user.nom}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right font-medium">Prénom</Label>
            <div className="col-span-3 text-sm">{user.prenom}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right font-medium">Email</Label>
            <div className="col-span-3 text-sm">{user.email}</div>
          </div>

          {/* Champs modifiables */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right font-medium">Département</Label>
            <Input
              className="col-span-3"
              type="text"
              name="departement"
              value={updatedUser.departement}
              onChange={handleChange}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right font-medium">Poste</Label>
            <Input
              className="col-span-3"
              type="text"
              name="poste"
              value={updatedUser.poste}
              onChange={handleChange}
            />
          </div>

          {/* Autres informations */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right font-medium">Téléphone</Label>
            <div className="col-span-3 text-sm">{user.numTel}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right font-medium">Adresse</Label>
            <div className="col-span-3 text-sm">{user.adresse}</div>
          </div>

          {/* Boutons */}
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Annuler
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
