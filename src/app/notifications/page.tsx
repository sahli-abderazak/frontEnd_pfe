"use client"

import { useEffect, useState } from "react"
import { Bell, ArrowLeft, Search, CheckCircle, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu"

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
  role?: string
}

export default function NotificationsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    // Fetch user info to determine role
    fetch("http://localhost:3000/api/user", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        Accept: "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => setUser(data))
      .catch((error) => console.error("Erreur lors de la récupération des infos utilisateur :", error))

    // Fetch all notifications (not just recent ones)
    fetchAllNotifications()
  }, [])

  const fetchAllNotifications = () => {
    fetch("http://localhost:3000/notifications", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        Accept: "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setNotifications(data?.notifications || [])
        setUnreadCount(data?.unread_count || 0)

        // Extract all unique notification types for filter
        const types = [...new Set(data?.notifications?.map((n: Notification) => n.type) || [])]
        setSelectedTypes(types)
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des notifications :", error)
        setNotifications([])
        setUnreadCount(0)
      })
  }

  const markAsRead = (notification: Notification) => {
    if (notification.read) return

    fetch(`http://localhost:3000/notifications/${notification.id}`, {
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

        // Handle navigation based on role and notification type
        if (user?.role === "admin") {
          handleAdminNotificationNavigation(notification)
        } else {
          handleRecruiterNotificationNavigation(notification)
        }
      })
      .catch((error) => console.error("Erreur lors du marquage de la notification comme lue :", error))
  }

  const handleAdminNotificationNavigation = (notification: Notification) => {
    if (notification.type === "new_job_offer") {
      window.location.href = `/offre_admin`
    } else if (notification.type === "new_recruiter") {
      window.location.href = `/employees`
    } else if (notification.type === "new_contact") {
      window.location.href = `/contact_admin`
    } else if (notification.type === "new_testimonial") {
      window.location.href = `/temoiniage_admin`
    }
  }

  const handleRecruiterNotificationNavigation = (notification: Notification) => {
    if (notification.type === "offer_validated") {
      window.location.href = `/offre`
    } else if (notification.type === "new_application") {
      window.location.href = `/candidat`
    } else if (notification.type === "account_activated") {
      window.location.href = `/dashbord_rec`
    }
  }

  const markAllAsRead = () => {
    fetch("http://localhost:3000/notifications", {
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
    // Admin notification types
    if (type === "new_recruiter") return "Nouveau recruteur"
    if (type === "new_job_offer") return "Nouvelle offre d'emploi"
    if (type === "new_contact") return "Nouveau message de contact"
    if (type === "new_testimonial") return "Nouveau témoignage"

    // Recruiter notification types
    if (type === "offer_validated") return "Offre validée"
    if (type === "new_application") return "Nouvelle candidature"
    if (type === "account_activated") return "Compte activé"
    if (type === "offer_rejected") return "Offre refusée"

    return "Notification"
  }

  // Function to render notification details based on type
  const renderNotificationDetails = (notification: Notification) => {
    // Admin notification types
    if (notification.type === "new_recruiter") {
      return (
        <div className="text-sm text-muted-foreground mt-2 p-3 bg-purple-50 dark:bg-purple-950/30 rounded-md border-l-2 border-purple-500">
          <div>
            Société: <span className="font-medium">{notification.data.company}</span>
          </div>
        </div>
      )
    }

    if (notification.type === "new_job_offer") {
      return (
        <div className="text-sm text-muted-foreground mt-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-md border-l-2 border-blue-500">
          <div>
            Poste: <span className="font-medium">{notification.data.position}</span>
          </div>
          <div>
            Département: <span className="font-medium">{notification.data.department}</span>
          </div>
          <div>
            Ajouté par: <span className="font-medium">{notification.data.recruiter_name}</span>
          </div>
        </div>
      )
    }

    if (notification.type === "new_contact") {
      return (
        <div className="text-sm text-muted-foreground mt-2 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-md border-l-2 border-amber-500">
          <div>
            De: <span className="font-medium">{notification.data.name}</span> (
            <span className="text-amber-700 dark:text-amber-400">{notification.data.email}</span>)
          </div>
          <div>
            Sujet: <span className="font-medium">{notification.data.subject}</span>
          </div>
          <div className="mt-2 italic bg-white dark:bg-black/20 p-2 rounded">{notification.data.message_preview}</div>
        </div>
      )
    }

    if (notification.type === "new_testimonial") {
      return (
        <div className="text-sm text-muted-foreground mt-2 p-3 bg-green-50 dark:bg-green-950/30 rounded-md border-l-2 border-green-500">
          <div>
            De: <span className="font-medium">{notification.data.name}</span> (
            <span className="text-green-700 dark:text-green-400">{notification.data.email}</span>)
          </div>
          <div className="mt-2 italic bg-white dark:bg-black/20 p-2 rounded">
            {notification.data.testimonial_preview}
          </div>
        </div>
      )
    }

    // Recruiter notification types
    if (notification.type === "offer_validated") {
      return (
        <div className="text-sm text-muted-foreground mt-2 p-3 bg-green-50 dark:bg-green-950/30 rounded-md border-l-2 border-green-500">
          <div>
            Poste: <span className="font-medium">{notification.data.position}</span>
          </div>
          <div>
            Département: <span className="font-medium">{notification.data.department}</span>
          </div>
          <div className="mt-2 text-green-600 dark:text-green-400 font-medium">
            Votre offre est maintenant visible par les candidats
          </div>
        </div>
      )
    }

    if (notification.type === "new_application") {
      return (
        <div className="text-sm text-muted-foreground mt-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-md border-l-2 border-blue-500">
          <div>
            Candidat: <span className="font-medium">{notification.data.candidate_name}</span>
          </div>
          <div>
            Poste: <span className="font-medium">{notification.data.position}</span>
          </div>
          <div className="mt-2 text-blue-600 dark:text-blue-400 font-medium">
            Un nouveau candidat a postulé à votre offre
          </div>
        </div>
      )
    }

    if (notification.type === "account_activated") {
      return (
        <div className="text-sm text-muted-foreground mt-2 p-3 bg-green-50 dark:bg-green-950/30 rounded-md border-l-2 border-green-500">
          <div className="mt-1 text-green-600 dark:text-green-400 font-medium">
            Votre compte a été activé par l'administrateur
          </div>
          <div>Vous pouvez maintenant publier des offres d'emploi</div>
        </div>
      )
    }

    if (notification.type === "offer_rejected") {
      return (
        <div className="text-sm text-muted-foreground mt-2 p-3 bg-red-50 dark:bg-red-950/30 rounded-md border-l-2 border-red-500">
          <div>
            Poste: <span className="font-medium">{notification.data.position}</span>
          </div>
          <div>
            Département: <span className="font-medium">{notification.data.department}</span>
          </div>
          <div className="mt-2 text-red-600 dark:text-red-400 font-medium">
            Votre offre a été refusée par l'administrateur
          </div>
          {notification.data.reason && (
            <div>
              Raison: <span className="font-medium">{notification.data.reason}</span>
            </div>
          )}
        </div>
      )
    }

    return null
  }

  // Filter notifications based on search query, selected types, and active tab
  const filteredNotifications = notifications.filter((notification) => {
    // Filter by search query
    const matchesSearch =
      searchQuery === "" ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      JSON.stringify(notification.data).toLowerCase().includes(searchQuery.toLowerCase())

    // Filter by type
    const matchesType = selectedTypes.includes(notification.type)

    // Filter by tab
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "unread" && !notification.read) ||
      (activeTab === "read" && notification.read)

    return matchesSearch && matchesType && matchesTab
  })

  // Group notifications by date
  const groupedNotifications: { [key: string]: Notification[] } = {}
  filteredNotifications.forEach((notification) => {
    const date = new Date(notification.created_at)
    const dateKey = date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })

    if (!groupedNotifications[dateKey]) {
      groupedNotifications[dateKey] = []
    }
    groupedNotifications[dateKey].push(notification)
  })

  // Sort dates in descending order
  const sortedDates = Object.keys(groupedNotifications).sort((a, b) => {
    const dateA = new Date(a.split("/").reverse().join("/"))
    const dateB = new Date(b.split("/").reverse().join("/"))
    return dateB.getTime() - dateA.getTime()
  })

  const handleTypeToggle = (type: string) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter((t) => t !== type))
    } else {
      setSelectedTypes([...selectedTypes, type])
    }
  }

  // Get unique notification types for filter
  const uniqueTypes = [...new Set(notifications.map((n) => n.type))]

  // Theme color based on user role
  const isAdmin = user?.role === "admin"
  const themeColor = isAdmin ? "purple" : "blue"

  return (
    <div className="container max-w-5xl py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => window.history.back()} className="mr-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Toutes les notifications</h1>
          {unreadCount > 0 && (
            <Badge
              className={
                isAdmin
                  ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 ml-2"
                  : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 ml-2"
              }
            >
              {unreadCount} non lues
            </Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            className={
              isAdmin
                ? "text-purple-600 border-purple-200 hover:bg-purple-50 hover:text-purple-700 dark:text-purple-400 dark:border-purple-800 dark:hover:bg-purple-950"
                : "text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-950"
            }
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Tout marquer comme lu
          </Button>
        )}
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-64 flex-1 sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <Filter className="h-4 w-4" />
                Filtrer
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="p-2">
                <h4 className="mb-2 font-medium">Types de notifications</h4>
                {uniqueTypes.map((type) => (
                  <DropdownMenuItem
                    key={type}
                    onSelect={(e) => {
                      e.preventDefault()
                      handleTypeToggle(type)
                    }}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <div
                      className={`h-4 w-4 rounded border ${selectedTypes.includes(type) ? (isAdmin ? "bg-purple-600 border-purple-600" : "bg-blue-600 border-blue-600") : "border-gray-300"} flex items-center justify-center`}
                    >
                      {selectedTypes.includes(type) && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-white"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      )}
                    </div>
                    <span className="text-sm">{getNotificationTitle(type)}</span>
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <Tabs defaultValue="all" className="w-auto" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">Toutes</TabsTrigger>
              <TabsTrigger value="unread">Non lues</TabsTrigger>
              <TabsTrigger value="read">Lues</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <Card>
        <CardHeader
          className={
            isAdmin
              ? "bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900"
              : "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900"
          }
        >
          <CardTitle className={isAdmin ? "text-purple-700 dark:text-purple-300" : "text-blue-700 dark:text-blue-300"}>
            Historique des notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Bell className="h-16 w-16 text-muted-foreground opacity-20 mb-4" />
              <p className="text-muted-foreground text-center">Aucune notification à afficher</p>
              <p className="text-muted-foreground text-center text-sm mt-1">
                {selectedTypes.length === 0 || searchQuery
                  ? "Essayez de modifier vos filtres de recherche"
                  : "Vous n'avez pas encore reçu de notifications"}
              </p>
            </div>
          ) : (
            <>
              {sortedDates.map((dateKey) => (
                <div key={dateKey}>
                  <div className="sticky top-0 z-10 px-4 py-2 bg-muted/80 backdrop-blur supports-[backdrop-filter]:bg-muted/60 font-medium text-sm">
                    {dateKey}
                  </div>
                  <div className="divide-y">
                    {groupedNotifications[dateKey].map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 ${isAdmin ? "hover:bg-purple-50/50 dark:hover:bg-purple-950/30" : "hover:bg-blue-50/50 dark:hover:bg-blue-950/30"} cursor-pointer transition-colors ${!notification.read ? (isAdmin ? "bg-purple-50/70 dark:bg-purple-950/50" : "bg-blue-50/70 dark:bg-blue-950/50") : ""}`}
                        onClick={() => markAsRead(notification)}
                      >
                        <div className="flex gap-3">
                          <div
                            className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${!notification.read ? (isAdmin ? "bg-purple-500" : "bg-blue-500") : "bg-transparent"}`}
                          />
                          <div className="w-full">
                            <div className="flex items-start justify-between gap-4">
                              <h3
                                className={
                                  isAdmin
                                    ? "font-medium text-purple-700 dark:text-purple-300"
                                    : "font-medium text-blue-700 dark:text-blue-300"
                                }
                              >
                                {getNotificationTitle(notification.type)}
                              </h3>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  {formatDate(notification.created_at)}
                                </span>
                                {!notification.read && (
                                  <Badge
                                    variant="secondary"
                                    className={`text-xs ${isAdmin ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"}`}
                                  >
                                    Nouveau
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <p className="mt-1">{notification.message}</p>
                            {renderNotificationDetails(notification)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

