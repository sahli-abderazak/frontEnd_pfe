import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { UserDetailsDialog } from "./UserDetailsDialog";
import { UserEditForm } from "./UserEditForm"; // Importer le formulaire de modification

interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  created_at: string;
  departement: string;
  numTel: string;
  poste: string;
  adresse: string;
  image?: string;
  cv?: string;
}

export function ReviewsTable({ refresh }: { refresh: boolean }) {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false); // Pour gérer l'ouverture du formulaire de modification

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Vous devez être connecté pour voir les utilisateurs.");
          return;
        }

        const response = await fetch("http://127.0.0.1:8000/api/users", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("token");
            router.push("/auth/login");
            return;
          }
          throw new Error("Erreur de récupération des utilisateurs");
        }

        const data = await response.json();
        setUsers(data);
        setError(null);
      } catch (error) {
        console.error("Erreur de récupération des utilisateurs:", error);
        setError("Erreur lors du chargement des utilisateurs");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [refresh]);

  // Fonction pour archiver un utilisateur
  const archiveUser = async (userId: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Vous devez être connecté pour archiver un utilisateur.");
      return;
    }

    const confirmed = window.confirm(
      "Êtes-vous sûr de vouloir archiver cet utilisateur ?"
    );
    if (!confirmed) return;

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/users/archive/${userId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de l'archivage de l'utilisateur");
      }

      // Mettre à jour l'état pour retirer l'utilisateur du tableau sans le supprimer définitivement
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
      alert("Utilisateur archivé avec succès!");
    } catch (error) {
      setError("Erreur lors de l'archivage de l'utilisateur.");
    }
  };

  // Fonction pour afficher les détails d'un utilisateur
  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setIsDetailsOpen(true);
  };

  // Fonction pour éditer un utilisateur
  const handleEditUser = (updatedUser: User) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === updatedUser.id ? updatedUser : user
      )
    );
  };

  if (loading) return <div className="p-4 text-gray-600">Chargement...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

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
            <TableHead className="text-right">Actions</TableHead>
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
              <TableCell>
                {new Intl.DateTimeFormat("fr-FR").format(
                  new Date(user.created_at)
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleViewDetails(user)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setSelectedUser(user);
                      setIsEditOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => archiveUser(user.id)} // Appeler archiveUser au lieu de deleteUser
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Afficher le formulaire de modification */}
      {selectedUser && (
        <UserEditForm
          user={selectedUser}
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onSubmit={handleEditUser}
        />
      )}

      {/* Afficher les détails */}
      {selectedUser && (
        <UserDetailsDialog
          user={selectedUser}
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
        />
      )}
    </>
  );
}
