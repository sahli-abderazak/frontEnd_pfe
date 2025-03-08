"use client";

import { useEffect, useState } from "react";
import { Search } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

export function DashboardHeaderRec() {
  const [user, setUser] = useState<{
    nom: string;
    prenom: string;
    image: string | null;
  } | null>(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/user/info", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        Accept: "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => setUser(data))
      .catch((error) =>
        console.error(
          "Erreur lors de la récupération des infos utilisateur :",
          error
        )
      );
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <a href="/dashbord_rec" className="flex items-center space-x-2">
            <img src="/Logo.jpeg" alt="Logo" className="h-14 w-auto" />
            <span className="font-bold">Recruter Dashboard</span>
          </a>
          <div className="hidden md:flex md:w-full md:max-w-sm items-center space-x-2">
            <Input
              type="search"
              placeholder="Rechercher..."
              className="h-9 md:w-[300px] lg:w-[300px]"
            />
            <Button size="icon" variant="ghost">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-14 w-14 rounded-full p-0"
              >
                <img
                  src={user?.image || "/placeholder.svg?height=56&width=56"}
                  alt="Avatar"
                  className="rounded-full object-cover h-14 w-14"
                />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <a href="/">Déconnexion</a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}