"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Lock, Mail, Linkedin, Loader2, AlertCircle } from "lucide-react"
import { signIn } from "next-auth/react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [showErrorDialog, setShowErrorDialog] = useState<boolean>(false)

  const handleGoogleLogin = () => {
    signIn("google")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("http://127.0.0.1:8000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        if (data.user && data.user.archived === 1) {
          setError("Votre compte a été archivé. Veuillez contacter l'administrateur.")
          setShowErrorDialog(true)
          return
        }

        console.log("Login successful", data)
        localStorage.setItem("token", data.token)

        if (email === "admin@gmail.com") {
          router.push("/dashbord")
        } else {
          router.push("/dashbord_rec")
        }
      } else {
        console.error("Login failed", data.error)
        setError(data.error || "Identifiants incorrects")
        setShowErrorDialog(true)
      }
    } catch (error) {
      console.error("Erreur de connexion", error)
      setError("Une erreur s'est produite lors de la connexion")
      setShowErrorDialog(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoginWithLinkedIn = () => {
    // Remplacez par l'URL de votre authentification LinkedIn
    window.location.href =
      "https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=VOTRE_CLIENT_ID&redirect_uri=VOTRE_REDIRECT_URI&scope=r_liteprofile%20r_emailaddress"
  }

  const closeErrorDialog = () => {
    setShowErrorDialog(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-5xl overflow-hidden rounded-2xl shadow-xl">
        <div className="flex flex-col md:flex-row">
          {/* Image Section */}
          <div className="md:w-1/2 relative">
            <div
              className="h-48 md:h-full w-full bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: "url(/Logo.jpeg)",
                backgroundColor: "#ffffff",
                opacity: 0.9,
              }}
            />
          </div>

          {/* Form Section */}
          <div className="md:w-1/2 p-8 md:p-12 bg-white">
            <div className="max-w-md mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Bienvenue,</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      className="pl-10 bg-gray-50 border border-gray-300 focus:border-[#2c4999] focus:ring-[#2c4999]"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      className="pl-10 bg-gray-50 border border-gray-300 focus:border-[#2c4999] focus:ring-[#2c4999]"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                {/* Login Button */}
                <Button
                  type="submit"
                  className="w-full bg-[#2c4999] hover:bg-[#233a7a] text-white font-semibold py-3 rounded-lg transition-colors duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Chargement...
                    </>
                  ) : (
                    "Se connecter"
                  )}
                </Button>
              </form>

              {/* Additional Login Options */}
              <div className="mt-6 space-y-4">
                <Button
                  onClick={handleGoogleLogin}
                  className="w-full border border-red-500 text-red-500 bg-white hover:bg-red-100 py-3 rounded-lg flex items-center justify-center space-x-2"
                >
                  <Mail className="h-5 w-5" />
                  <span>Se connecter avec Google</span>
                </Button>

                <Button
                  onClick={handleLoginWithLinkedIn}
                  className="w-full border border-[#0077b5] text-[#0077b5] bg-white hover:bg-[#f3faff] py-3 rounded-lg flex items-center justify-center space-x-2"
                >
                  <Linkedin className="h-5 w-5" />
                  <span>Se connecter avec LinkedIn</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Error Dialog */}
      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <AlertCircle className="h-6 w-6 mr-2" />
              Erreur de connexion
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-center text-gray-700">{error}</p>
          </div>
          <DialogFooter>
            <Button onClick={closeErrorDialog} className="w-full bg-[#2c4999] hover:bg-[#233a7a]">
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Login

