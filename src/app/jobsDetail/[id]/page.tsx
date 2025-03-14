"use client"

import { useState, useEffect, use } from "react"
import { Briefcase, MapPin, Clock, Upload, GraduationCap, Trophy, Calendar, Timer, User } from "lucide-react"
import Link from "next/link"
import Footer from "../../components/index/footer"
import Header from "../../components/index/header"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import "../../components/styles/index.css"
import "../../components/styles/jobsDetail.css"

interface OffreDetail {
  id: number
  poste: string
  departement: string
  societe: string
  ville: string
  heureTravail: string
  niveauEtude: string
  niveauExperience: string
  typePoste: string
  typeTravail: string
  description: string
  responsabilite: string[]
  experience: string[]
  datePublication: string
  dateExpiration: string
  statut: "urgent" | "normal"
  domaine: string
}

export default function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // Utiliser React.use() pour déballer la Promise params
  const { id } = use(params)
  const [offre, setOffre] = useState<OffreDetail | null>(null)
  const [relatedJobs, setRelatedJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    pays: "",
    ville: "",
    codePostal: "",
    tel: "",
    niveauEtude: "",
    niveauExperience: "",
    offre_id: id,
  })
  const [file, setFile] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showErrorDialog, setShowErrorDialog] = useState(false)

  useEffect(() => {
    // Fetch job details
    const fetchJobDetail = async () => {
      try {
        setLoading(true)
        const response = await fetch(`http://127.0.0.1:8000/api/offreDetail/${id}`)
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des détails de l'offre")
        }
        const data = await response.json()
        setOffre(data)

        // À l'intérieur du useEffect après avoir défini setOffre(data)
        setFormData((prev) => ({
          ...prev,
          offre_id: data.id,
        }))

        // Fetch related jobs from the same department
        if (data.domaine) {
          const relatedResponse = await fetch(`http://127.0.0.1:8000/api/offres_domaine/${data.domaine}`)
          if (relatedResponse.ok) {
            const relatedData = await relatedResponse.json()
            // Filter out the current job and limit to 3 related jobs
            const filteredRelatedJobs = relatedData.filter((job) => job.id !== data.id).slice(0, 3)
            setRelatedJobs(filteredRelatedJobs)
          }
        }
      } catch (error) {
        console.error("Erreur:", error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchJobDetail()
    }
  }, [id])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const resetForm = () => {
    setFormData({
      nom: "",
      prenom: "",
      email: "",
      pays: "",
      ville: "",
      codePostal: "",
      tel: "",
      niveauEtude: "",
      niveauExperience: "",
      offre_id: id,
    })
    setFile(null)
    setError(null)
    setSuccess(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setSubmitting(true)

    if (!file) {
      setError("Veuillez sélectionner un CV")
      setSubmitting(false)
      return
    }

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("nom", formData.nom)
      formDataToSend.append("prenom", formData.prenom)
      formDataToSend.append("email", formData.email)
      formDataToSend.append("pays", formData.pays)
      formDataToSend.append("ville", formData.ville)
      formDataToSend.append("codePostal", formData.codePostal)
      formDataToSend.append("tel", formData.tel)
      formDataToSend.append("niveauEtude", formData.niveauEtude)
      formDataToSend.append("niveauExperience", formData.niveauExperience)
      formDataToSend.append("offre_id", formData.offre_id)
      formDataToSend.append("cv", file)

      const response = await fetch("http://127.0.0.1:8000/api/candidatStore", {
        method: "POST",
        body: formDataToSend,
      })

      const data = await response.json()

      if (!response.ok) {
        // Check if the error is about already applied
        if (data.error && data.error === "Vous avez déjà postulé à cette offre.") {
          // Don't set this as an error, just show the info dialog
          setShowErrorDialog(true)
          // Don't throw an error in this case
        } else {
          setError(data.error || "Erreur lors de l'envoi de la candidature")
          throw new Error(data.error || "Erreur lors de l'envoi de la candidature")
        }
      } else {
        setSuccess(true)
        setTimeout(() => {
          setShowForm(false)
          resetForm()
        }, 2000)
      }
    } catch (error) {
      console.error("Erreur:", error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="job-detail-page">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!offre) {
    return (
      <div className="job-detail-page">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
          <h2 className="text-2xl font-bold mb-4">Offre non trouvée</h2>
          <p className="text-muted-foreground mb-6">L'offre que vous recherchez n'existe pas ou a été supprimée.</p>
          <Button asChild>
            <Link href="/jobs">Retour aux offres</Link>
          </Button>
        </div>
        <Footer />
      </div>
    )
  }

  // Format the responsibilities and skills as arrays if they're not already
  const responsabilites = Array.isArray(offre.responsabilite)
    ? offre.responsabilite
    : offre.responsabilite?.split("\n").filter((item) => item.trim() !== "") || []

  const competences = Array.isArray(offre.experience)
    ? offre.experience
    : offre.experience?.split("\n").filter((item) => item.trim() !== "") || []

  return (
    <div className="job-detail-page">
      <Header />
      {/* Job Detail Section */}
      <section className="job-detail-section">
        {/* Upper Box */}
        <div className="upper-box">
          <div className="auto-container">
            {/* Job Block */}
            <div className="job-block-seven">
              <div className="inner-box">
                <div className="content">
                  <h4>
                    <Link href="#">{offre.poste}</Link>
                  </h4>
                  <ul className="job-info">
                    <li>
                      <Briefcase className="icon" /> {offre.societe}
                    </li>
                    <li>
                      <MapPin className="icon" /> {offre.ville}
                    </li>
                    <li>
                      <Clock className="icon" /> {offre.heureTravail}
                    </li>
                    <li>
                      <GraduationCap className="icon" /> {offre.niveauEtude}
                    </li>
                  </ul>
                  <ul className="job-other-info">
                    <li className="time">{offre.typeTravail}</li>
                    <li className="privacy">{offre.typePoste}</li>
                    {offre.statut === "urgent" && <li className="required">Urgent</li>}
                  </ul>
                </div>

                <div className="btn-box">
                  <Button onClick={() => setShowForm(true)}>Postulez</Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="job-detail-outer">
          <div className="auto-container">
            <div className="row">
              <div className="content-column">
                <div className="job-detail">
                  <div className="description-section">
                    <h4>Description</h4>
                    <p>{offre.description || "Aucune description disponible."}</p>
                  </div>

                  {responsabilites.length > 0 && (
                    <div className="responsibilities-section">
                      <h4>Responsabilité</h4>
                      <ul className="list-style-three">
                        {responsabilites.map((item, index) => (
                          <li key={index}>
                            <span className="bullet"></span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {competences.length > 0 && (
                    <div className="experience-section">
                      <h4>Experience et skills</h4>
                      <ul className="list-style-three">
                        {competences.map((item, index) => (
                          <li key={index}>
                            <span className="bullet"></span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Related Jobs */}
                {relatedJobs.length > 0 && (
                  <div className="related-jobs">
                    <div className="title-box">
                      <h3>Offres similaires</h3>
                      <div className="text"></div>
                    </div>

                    {/* Job Block */}
                    {relatedJobs.map((job) => (
                      <RelatedJobBlock key={job.id} job={job} />
                    ))}
                  </div>
                )}
              </div>

              <div className="sidebar-column">
                <aside className="sidebar">
                  <div className="sidebar-widget">
                    {/* Job Overview */}
                    <h4 className="widget-title">Aperçu du poste</h4>
                    <div className="widget-content">
                      <ul className="job-overview">
                        <li>
                          <Calendar className="icon" />
                          <h5>Date de publication:</h5>
                          <span>{offre.datePublication || "Non spécifiée"}</span>
                        </li>
                        <li>
                          <Timer className="icon" />
                          <h5>Date d'expiration:</h5>
                          <span>{offre.dateExpiration || "Non spécifiée"}</span>
                        </li>
                        <li>
                          <MapPin className="icon" />
                          <h5>Emplacement:</h5>
                          <span>{`${offre.departement || ""}, ${offre.ville || ""}`}</span>
                        </li>
                        <li>
                          <User className="icon" />
                          <h5>Titre de poste:</h5>
                          <span>{offre.poste}</span>
                        </li>
                        <li>
                          <Clock className="icon" />
                          <h5>Heure:</h5>
                          <span>{offre.heureTravail || "Non spécifiée"}</span>
                        </li>
                        <li>
                          <GraduationCap className="icon" />
                          <h5>Niveau d'etude:</h5>
                          <span>{offre.niveauEtude || "Non spécifié"}</span>
                        </li>
                        <li>
                          <Trophy className="icon" />
                          <h5>Niveau d'experience:</h5>
                          <span>{offre.niveauExperience || "Non spécifié"}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />

      {/* Modern Application Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Postuler pour: {offre?.poste}</DialogTitle>
            <DialogDescription>Remplissez le formulaire ci-dessous pour soumettre votre candidature.</DialogDescription>
          </DialogHeader>

          {success ? (
            <div className="py-6">
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <AlertTitle className="text-green-800">Candidature envoyée</AlertTitle>
                <AlertDescription className="text-green-700">
                  Votre candidature a été envoyée avec succès. Nous vous contacterons bientôt.
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && !showErrorDialog && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Erreur</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Informations personnelles</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prenom">Prénom</Label>
                    <Input id="prenom" name="prenom" value={formData.prenom} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nom">Nom</Label>
                    <Input id="nom" name="nom" value={formData.nom} onChange={handleChange} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Adresse email</Label>
                  <Input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Adresse</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pays">Pays</Label>
                    <Select value={formData.pays} onValueChange={(value) => handleSelectChange("pays", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un pays" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Tunisie">Tunisie</SelectItem>
                        <SelectItem value="Algérie">Algérie</SelectItem>
                        <SelectItem value="Maroc">Maroc</SelectItem>
                        <SelectItem value="Libye">Libye</SelectItem>
                        <SelectItem value="Égypte">Égypte</SelectItem>
                        <SelectItem value="France">France</SelectItem>
                        <SelectItem value="Belgique">Belgique</SelectItem>
                        <SelectItem value="Koweït">Koweït</SelectItem>
                        <SelectItem value="Arabie Saoudite">Arabie Saoudite</SelectItem>
                        <SelectItem value="Émirats Arabes Unis">Émirats Arabes Unis</SelectItem>
                        <SelectItem value="Qatar">Qatar</SelectItem>
                        <SelectItem value="Bahreïn">Bahreïn</SelectItem>
                        <SelectItem value="Suisse">Suisse</SelectItem>
                        <SelectItem value="Canada">Canada</SelectItem>
                        <SelectItem value="Mauritanie">Mauritanie</SelectItem>
                        <SelectItem value="Comores">Comores</SelectItem>
                        <SelectItem value="Somalie">Somalie</SelectItem>
                        <SelectItem value="Djibouti">Djibouti</SelectItem>
                        <SelectItem value="Autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ville">Ville</Label>
                    <Input id="ville" name="ville" value={formData.ville} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="codePostal">Code postal</Label>
                    <Input
                      id="codePostal"
                      name="codePostal"
                      value={formData.codePostal}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Téléphone</h3>
                <div className="space-y-2">
                  <Label htmlFor="tel">Téléphone</Label>
                  <Input type="tel" id="tel" name="tel" value={formData.tel} onChange={handleChange} required />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Formation</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="niveauEtude">Niveau d'étude</Label>
                    <Select
                      value={formData.niveauEtude}
                      onValueChange={(value) => handleSelectChange("niveauEtude", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BTP">BTP</SelectItem>
                        <SelectItem value="BTS">BTS</SelectItem>
                        <SelectItem value="BAC">BAC</SelectItem>
                        <SelectItem value="BAC+1">BAC+1</SelectItem>
                        <SelectItem value="BAC+2">BAC+2</SelectItem>
                        <SelectItem value="BAC+3">BAC+3</SelectItem>
                        <SelectItem value="BAC+4">BAC+4</SelectItem>
                        <SelectItem value="BAC+5">BAC+5</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="niveauExperience">Niveau d'éxperience</Label>
                    <Select
                      value={formData.niveauExperience}
                      onValueChange={(value) => handleSelectChange("niveauExperience", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0ans">Aucune Expérience</SelectItem>
                        <SelectItem value="1ans">1 ans</SelectItem>
                        <SelectItem value="2ans">2 ans</SelectItem>
                        <SelectItem value="3ans">3 ans</SelectItem>
                        <SelectItem value="4ans">4 ans</SelectItem>
                        <SelectItem value="5ans">5 ans</SelectItem>
                        <SelectItem value="plus_de_5ans">Plus de 5ans</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">CV</h3>
                <div
                  className={cn(
                    "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                    dragActive ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary/50",
                    file && "border-green-500 bg-green-50",
                  )}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById("cv").click()}
                >
                  <input
                    type="file"
                    id="cv"
                    name="cv"
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                  />
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Upload className={cn("h-10 w-10", file ? "text-green-500" : "text-gray-400")} />
                    <div className="space-y-1">
                      <p className="font-medium">{file ? "Fichier sélectionné" : "Parcourir les fichiers"}</p>
                      <p className="text-sm text-muted-foreground">
                        {file ? file.name : "Glissez et déposez votre CV ici ou cliquez pour parcourir"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></span>
                      Envoi en cours...
                    </>
                  ) : (
                    "Envoyer ma candidature"
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Error Dialog for Already Applied */}
      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-blue-600">Information</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Alert className="mb-4 border-blue-200 bg-blue-50">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              <AlertTitle className="text-blue-800">Candidature existante</AlertTitle>
              <AlertDescription className="text-blue-700">
                Vous avez déjà postulé à cette offre avec cet e-mail.
              </AlertDescription>
            </Alert>
            <p className="text-sm text-muted-foreground mb-4">
              Veuillez contacter notre équipe de recrutement.
            </p>
          </div>
          <div className="flex justify-end">
            <Button
              onClick={() => {
                setShowErrorDialog(false)
              }}
            >
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function RelatedJobBlock({ job }) {
  return (
    <Link href={`/jobsDetail/${job.id}`} legacyBehavior passHref>
      <a className="job-block" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
        <div className="inner-box">
          <div className="content">
            <h4>
              <span>{job.poste}</span>
            </h4>
            <ul className="job-info">
              <li>
                <Briefcase className="icon" /> {job.societe}
              </li>
              <li>
                <MapPin className="icon" /> {job.ville}
              </li>
              <li>
                <Clock className="icon" /> {job.heureTravail || "Non spécifié"}
              </li>
              <li>
                <GraduationCap className="icon" /> {job.niveauEtude || "Non spécifié"}
              </li>
            </ul>
            <ul className="job-other-info">
              <li className="time">{job.typeTravail}</li>
              <li className="privacy">{job.typePoste}</li>
              {job.statut === "urgent" && <li className="required">Urgent</li>}
            </ul>
          </div>
        </div>
      </a>
    </Link>
  )
}