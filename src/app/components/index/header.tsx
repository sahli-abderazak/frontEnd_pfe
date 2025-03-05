"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="border-b sticky top-0 bg-background z-50">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            {/* Ajout du logo */}
            <Link href="/">
              <Image
                src="/Logo.jpeg"
                alt="Talent Match Logo"
                width={70}
                height={70}
              />
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-sm font-medium">
                Acceuil
              </Link>
              <Link href="/jobs" className="text-sm font-medium">
                Annonces
              </Link>
              <Link href="/temoiniage" className="text-sm font-medium">
                Témoinages
              </Link>
              <Link href="/contact" className="text-sm font-medium">
                Contact
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button>
              <a href="/register">S'inscrire</a>
            </Button>
            <Button>
              <a href="/login">Se connecter</a>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}