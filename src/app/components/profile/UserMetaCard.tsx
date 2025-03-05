import { useState, useEffect } from "react";
import Image from "next/image";


interface User {
  id: number; 
  nom: string;
  prenom: string;
  poste: string;
  departement: string;
  image?: string;
}

export default function UserMetaCard() {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [updatedUser, setUpdatedUser] = useState<User | null>(null);
 

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Token non trouvé");
        }

        const response = await fetch(
          "http://localhost:8000/api/users/profile",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Profil non trouvé");
          } else {
            throw new Error("Erreur lors de la récupération du profil");
          }
        }

        const data: User = await response.json();
        setUser(data);
        setUpdatedUser(data);
      } catch (error: any) {
        console.error(error);
        setError(error.message);
      }
    };

    fetchUserProfile();
  }, []);

  
  

  if (error) {
    return <p>Erreur : {error}</p>;
  }

  if (!user) {
    return <p>Chargement...</p>;
  }

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
          <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
            {user.image ? (
              <Image
                src={user.image || "/placeholder.svg"}
                alt={`Photo de ${user.nom}`}
                width={128}
                height={128}
                unoptimized
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-gray-200 dark:bg-gray-700">
                <span className="text-2xl font-semibold text-gray-500 dark:text-gray-400">
                  {user.nom[0]}
                </span>
              </div>
            )}
          </div>
          <div className="order-3 xl:order-2">
            <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
              {user.nom} {user.prenom}
            </h4>
            <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user.poste}
              </p>
              <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user.departement}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
