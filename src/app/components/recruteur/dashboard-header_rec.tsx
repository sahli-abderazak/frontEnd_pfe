"use client"

import { useEffect, useState } from "react"
import { Search, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface Notification {
  id: number
  type: string
  message: string
  data: any
  read: boolean
  created_at: string
}

interface User {
  nom: string
  prenom: string
  image: string | null
}

export function DashboardHeaderRec() {
  const [user, setUser] = useState<User | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Fetch user info
    fetch("http://localhost:8000/api/user/info", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        Accept: "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => setUser(data))
      .catch((error) => console.error("Erreur lors de la récupération des infos utilisateur :", error))

    // Fetch notifications
    fetchNotifications()

    // Set up polling to check for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = () => {
    fetch("http://localhost:8000/api/notifications", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        Accept: "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        // Add null checks to handle unexpected response structure
        setNotifications(data?.notifications || [])
        setUnreadCount(data?.unread_count || 0)
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des notifications :", error)
        // Set default values on error
        setNotifications([])
        setUnreadCount(0)
      })
  }

  const markAsRead = (notification: Notification) => {
    fetch(`http://localhost:8000/api/notifications/${notification.id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        Accept: "application/json",
      },
    })
      .then(() => {
        // Update local state
        setNotifications(notifications.map((n) => (n.id === notification.id ? { ...n, read: true } : n)))
        setUnreadCount(Math.max(0, unreadCount - 1))

        // Handle navigation based on notification type
        if (notification.type === "offer_validated") {
          // Navigate to the validated job offer details
          window.location.href = `/offre`
        } else if (notification.type === "new_application") {
          // Navigate to the application details
          window.location.href = `/candidat`
        } else if (notification.type === "account_activated") {
          // Navigate to the dashboard
          window.location.href = `/dashbord_rec`
        }
      })
      .catch((error) => console.error("Erreur lors du marquage de la notification comme lue :", error))
  }

  const markAllAsRead = () => {
    fetch("http://localhost:8000/api/notifications", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        Accept: "application/json",
      },
    })
      .then(() => {
        // Update local state
        setNotifications(
          notifications.map((notification) => ({
            ...notification,
            read: true,
          })),
        )
        setUnreadCount(0)
      })
      .catch((error) => console.error("Erreur lors du marquage de toutes les notifications comme lues :", error))
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Function to get notification title based on type
  const getNotificationTitle = (type: string) => {
    switch (type) {
      case "offer_validated":
        return "Offre validée"
      case "new_application":
        return "Nouvelle candidature"
      case "account_activated":
        return "Compte activé"
      case "offer_rejected":
        return "Offre refusée"
      default:
        return "Notification"
    }
  }

  // Function to render notification details based on type
  const renderNotificationDetails = (notification: Notification) => {
    switch (notification.type) {
      case "offer_validated":
        return (
          <div className="text-xs text-muted-foreground mt-2 p-2 bg-green-50 dark:bg-green-950/30 rounded-md border-l-2 border-green-500">
            <div>
              Poste: <span className="font-medium">{notification.data.position}</span>
            </div>
            <div>
              Département: <span className="font-medium">{notification.data.department}</span>
            </div>
            <div className="mt-1 text-green-600 dark:text-green-400 font-medium">
              Votre offre est maintenant visible par les candidats
            </div>
          </div>
        )
      case "new_application":
        return (
          <div className="text-xs text-muted-foreground mt-2 p-2 bg-blue-50 dark:bg-blue-950/30 rounded-md border-l-2 border-blue-500">
            <div>
              Candidat: <span className="font-medium">{notification.data.candidate_name}</span>
            </div>
            <div>
              Poste: <span className="font-medium">{notification.data.position}</span>
            </div>
            <div className="mt-1 text-blue-600 dark:text-blue-400 font-medium">
              Un nouveau candidat a postulé à votre offre
            </div>
          </div>
        )
      case "account_activated":
        return (
          <div className="text-xs text-muted-foreground mt-2 p-2 bg-green-50 dark:bg-green-950/30 rounded-md border-l-2 border-green-500">
            <div className="mt-1 text-green-600 dark:text-green-400 font-medium">
              Votre compte a été activé par l'administrateur
            </div>
            <div>Vous pouvez maintenant publier des offres d'emploi</div>
          </div>
        )
      case "offer_rejected":
        return (
          <div className="text-xs text-muted-foreground mt-2 p-2 bg-red-50 dark:bg-red-950/30 rounded-md border-l-2 border-red-500">
            <div>
              Poste: <span className="font-medium">{notification.data.position}</span>
            </div>
            <div>
              Département: <span className="font-medium">{notification.data.department}</span>
            </div>
            <div className="mt-1 text-red-600 dark:text-red-400 font-medium">
              Votre offre a été refusée par l'administrateur
            </div>
            {notification.data.reason && (
              <div>
                Raison: <span className="font-medium">{notification.data.reason}</span>
              </div>
            )}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <a href="/dashbord_rec" className="flex items-center space-x-2">
            <img src="/Logo.jpeg" alt="Logo" className="h-14 w-auto" />
            <span className="font-bold">Recruter Dashboard</span>
          </a>
          <div className="hidden md:flex md:w-full md:max-w-sm items-center space-x-2">
            <Input type="search" placeholder="Rechercher..." className="h-9 md:w-[300px] lg:w-[300px]" />
            <Button size="icon" variant="ghost">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Notifications Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-xs bg-red-500 text-white border-0">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[350px] p-0 rounded-xl shadow-lg border-0">
              <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-t-xl">
                <h3 className="font-semibold text-blue-700 dark:text-blue-300">Notifications</h3>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs h-7 text-blue-600 hover:text-blue-800 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-800"
                  >
                    Tout marquer comme lu
                  </Button>
                )}
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {notifications?.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-20" />
                    <p className="text-muted-foreground">Aucune notification</p>
                  </div>
                ) : (
                  notifications?.map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className={`p-4 cursor-pointer border-b last:border-b-0 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors ${!notification.read ? "bg-blue-50/70 dark:bg-blue-950/50" : ""}`}
                      onClick={() => markAsRead(notification)}
                    >
                      <div className="flex gap-3 w-full">
                        <div
                          className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${!notification.read ? "bg-blue-500" : "bg-transparent"}`}
                        />
                        <div className="flex flex-col gap-1 w-full">
                          <div className="flex items-start justify-between">
                            <span className="font-medium text-blue-700 dark:text-blue-300">
                              {getNotificationTitle(notification.type)}
                            </span>
                            <span className="text-xs text-muted-foreground ml-2">
                              {formatDate(notification.created_at)}
                            </span>
                          </div>
                          <p className="text-sm">{notification.message}</p>
                          {renderNotificationDetails(notification)}
                          {!notification.read && (
                            <div className="flex justify-end mt-2">
                              <Badge
                                variant="secondary"
                                className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                              >
                                Nouveau
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
              </div>
              {notifications?.length > 0 && (
                <div className="p-3 border-t bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-b-xl">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-white hover:bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-800 dark:hover:bg-blue-800"
                    onClick={() => (window.location.href = "/notifications")}
                  >
                    Voir toutes les notifications
                  </Button>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-14 w-14 rounded-full p-0">
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
  )
}

