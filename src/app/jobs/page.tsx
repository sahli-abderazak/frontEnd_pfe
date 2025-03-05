"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import "../components/styles/jobs.css"
import "../components/styles/index.css"
import {
  Search,
  MapPin,
  Briefcase,
  Clock,
  ChevronRight,
  ChevronLeft,
  GraduationCap,
  Clock3,
  AlarmClock,
  X,
  Building,
  Calendar,
  Filter,
  ArrowUpRight,
} from "lucide-react"
import Footer from "../components/index/footer"
import Header from "../components/index/header"
import Link from "next/link"

interface Offre {
  id: number
  departement: string
  poste: string
  datePublication: string
  dateExpiration: string
  typePoste: string
  typeTravail: string
  heureTravail: string
  niveauEtude: string
  ville: string
  societe: string
  statut: "urgent" | "normal"
}

interface SearchParams {
  poste: string
  ville: string
  domaine: string
  typePoste?: string
  typeTravail?: string
}

export default function JobsPage() {
  const [showFilters, setShowFilters] = useState(false)
  const [offres, setOffres] = useState<Offre[]>([])
  const [loading, setLoading] = useState(true)
  const [villes, setVilles] = useState<string[]>([])
  const [domaines, setDomaines] = useState<string[]>([])
  const [typesPoste, setTypesPoste] = useState({
    cdi: false,
    cdd: false,
    alternance: false,
    stage: false,
  })
  const [selectedTypeTravail, setSelectedTypeTravail] = useState<string | null>(null)
  const [selectedDatePublication, setSelectedDatePublication] = useState<string>("tous")
  const [selectedExperienceLevel, setSelectedExperienceLevel] = useState<string>("tous")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [allPostes, setAllPostes] = useState<string[]>([])
  const searchInputRef = useRef<HTMLInputElement>(null)

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(6)

  const [searchParams, setSearchParams] = useState<SearchParams>({
    poste: "",
    ville: "",
    domaine: "",
  })

  
  

  const fetchOffres = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch("http://127.0.0.1:8000/api/offres-candidat")
      const data = await response.json()
      setOffres(data)

      // Extraire tous les titres de poste uniques pour l'autocomplétion
      const uniquePostes = Array.from(new Set(data.map((offre: Offre) => offre.poste)))
      setAllPostes(uniquePostes as string[])

      setLoading(false)
    } catch (error) {
      console.error("Erreur lors de la récupération des offres:", error)
      setLoading(false)
    }
  }, [])

  const searchOffres = useCallback(
    async (params: SearchParams) => {
      setCurrentPage(1) // Réinitialiser à la première page lors d'une nouvelle recherche
      try {
        setLoading(true)

        // Create form data for the POST request
        const formData = new FormData()
        if (params.poste) formData.append("poste", params.poste)
        if (params.ville) formData.append("ville", params.ville)
        if (params.domaine) formData.append("domaine", params.domaine)

        // Add typePoste to the form data if any job types are selected
        if (params.typePoste) formData.append("typePoste", params.typePoste)
        if (params.typeTravail) formData.append("typeTravail", params.typeTravail)

        // Ajouter les nouveaux filtres
        if (selectedDatePublication && selectedDatePublication !== "tous")
          formData.append("datePublication", selectedDatePublication)

        if (selectedExperienceLevel === "plus_de_3ans") {
          formData.append("niveauExperience_min", "4ans")
        } else if (selectedExperienceLevel && selectedExperienceLevel !== "tous") {
          formData.append("niveauExperience", selectedExperienceLevel)
        }

        // Make POST request to the new endpoint
        const response = await fetch("http://127.0.0.1:8000/api/offresRecherche", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error("Erreur lors de la recherche")
        }

        const data = await response.json()
        setOffres(data)
      } catch (error) {
        console.error("Erreur lors de la recherche:", error)
      } finally {
        setLoading(false)
      }
    },
    [selectedDatePublication, selectedExperienceLevel],
  )

  const fetchVillesEtDomaines = useCallback(async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/villes-domaines")
      if (!response.ok) {
        console.error("Erreur API:", response.status, response.statusText)
        return
      }
      const data = await response.json()
      setVilles(data.villes || [])
      setDomaines(data.domaines || [])
    } catch (error) {
      console.error("Erreur lors de la récupération des villes et domaines:", error)
    }
  }, [])

  useEffect(() => {
    fetchOffres()
    fetchVillesEtDomaines()

    // Ajouter un gestionnaire d'événements pour fermer les suggestions lors d'un clic à l'extérieur
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [fetchOffres, fetchVillesEtDomaines])

  const handleSearch = (e: React.FormEvent) => {
    setCurrentPage(1) // Réinitialiser à la première page lors d'une nouvelle recherche
    e.preventDefault()

    // Get selected job types
    const selectedTypes = Object.entries(typesPoste)
      .filter(([_, isChecked]) => isChecked)
      .map(([type]) => type.toUpperCase())
    const typePosteParam = selectedTypes.length > 0 ? selectedTypes.join(",") : ""

    // Search with all parameters
    searchOffres({
      ...searchParams,
      typePoste: typePosteParam,
      typeTravail: selectedTypeTravail || undefined,
    })

    // Fermer les suggestions après la recherche
    setShowSuggestions(false)
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentPage(1) // Réinitialiser à la première page lors d'une nouvelle recherche
    const { name, checked } = e.target

    // Update the checkbox state
    setTypesPoste((prev) => ({ ...prev, [name]: checked }))

    // Get all selected job types after this change
    const updatedTypesPoste = { ...typesPoste, [name]: checked }
    const selectedTypes = Object.entries(updatedTypesPoste)
      .filter(([_, isChecked]) => isChecked)
      .map(([type]) => type.toUpperCase())
    const typePosteParam = selectedTypes.length > 0 ? selectedTypes.join(",") : ""

    // Search with all parameters
    searchOffres({
      ...searchParams,
      typePoste: typePosteParam,
      typeTravail: selectedTypeTravail || undefined,
    })
  }

  const handleTypeTravailChange = (typeTravail: string) => {
    setCurrentPage(1) // Réinitialiser à la première page lors d'une nouvelle recherche
    // Si on clique sur le type déjà sélectionné, on le désélectionne
    const newTypeTravail = selectedTypeTravail === typeTravail ? null : typeTravail
    setSelectedTypeTravail(newTypeTravail)

    // Récupérer les types de poste sélectionnés
    const selectedTypes = Object.entries(typesPoste)
      .filter(([_, isChecked]) => isChecked)
      .map(([type]) => type.toUpperCase())
    const typePosteParam = selectedTypes.length > 0 ? selectedTypes.join(",") : ""

    // Rechercher avec tous les paramètres, y compris typeTravail
    searchOffres({
      ...searchParams,
      typePoste: typePosteParam,
      typeTravail: newTypeTravail || undefined,
    })
  }

  const handleDatePublicationChange = (dateValue: string) => {
    setCurrentPage(1) // Réinitialiser à la première page lors d'une nouvelle recherche
    setSelectedDatePublication(dateValue)

    // Récupérer les types de poste sélectionnés
    const selectedTypes = Object.entries(typesPoste)
      .filter(([_, isChecked]) => isChecked)
      .map(([type]) => type.toUpperCase())
    const typePosteParam = selectedTypes.length > 0 ? selectedTypes.join(",") : ""

    // Rechercher avec tous les paramètres
    const formData = new FormData()
    if (searchParams.poste) formData.append("poste", searchParams.poste)
    if (searchParams.ville) formData.append("ville", searchParams.ville)
    if (searchParams.domaine) formData.append("domaine", searchParams.domaine)
    if (typePosteParam) formData.append("typePoste", typePosteParam)
    if (selectedTypeTravail) formData.append("typeTravail", selectedTypeTravail)
    if (selectedExperienceLevel && selectedExperienceLevel !== "tous")
      formData.append("niveauExperience", selectedExperienceLevel)

    // N'ajouter la date que si ce n'est pas "tous"
    if (dateValue !== "tous") {
      formData.append("datePublication", dateValue)
    }

    // Appel direct à l'API pour éviter les problèmes de dépendances
    setLoading(true)
    fetch("http://127.0.0.1:8000/api/offresRecherche", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erreur lors de la recherche")
        }
        return response.json()
      })
      .then((data) => {
        setOffres(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error("Erreur lors de la recherche:", error)
        setLoading(false)
      })
  }

  const handleExperienceLevelChange = (experienceValue: string) => {
    setCurrentPage(1) // Réinitialiser à la première page lors d'une nouvelle recherche
    setSelectedExperienceLevel(experienceValue)

    // Récupérer les types de poste sélectionnés
    const selectedTypes = Object.entries(typesPoste)
      .filter(([_, isChecked]) => isChecked)
      .map(([type]) => type.toUpperCase())
    const typePosteParam = selectedTypes.length > 0 ? selectedTypes.join(",") : ""

    // Rechercher avec tous les paramètres
    const formData = new FormData()
    if (searchParams.poste) formData.append("poste", searchParams.poste)
    if (searchParams.ville) formData.append("ville", searchParams.ville)
    if (searchParams.domaine) formData.append("domaine", searchParams.domaine)
    if (typePosteParam) formData.append("typePoste", typePosteParam)
    if (selectedTypeTravail) formData.append("typeTravail", selectedTypeTravail)
    if (selectedDatePublication !== "tous") formData.append("datePublication", selectedDatePublication)

    // Traitement spécial pour "Plus de 3 ans"
    if (experienceValue === "plus_de_3ans") {
      // Utiliser une requête personnalisée pour le backend
      formData.append("niveauExperience_min", "4ans")
    } else if (experienceValue !== "tous") {
      // Pour les autres valeurs, utiliser le filtrage standard
      formData.append("niveauExperience", experienceValue)
    }

    // Appel direct à l'API
    setLoading(true)
    fetch("http://127.0.0.1:8000/api/offresRecherche", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erreur lors de la recherche")
        }
        return response.json()
      })
      .then((data) => {
        setOffres(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error("Erreur lors de la recherche:", error)
        setLoading(false)
      })
  }

  // Fonction pour gérer la saisie dans le champ de recherche
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchParams({ ...searchParams, poste: value })

    // Filtrer les suggestions en fonction de la saisie
    if (value.trim() === "") {
      setSuggestions([])
      setShowSuggestions(false)
    } else {
      const filteredSuggestions = allPostes.filter((poste) => poste.toLowerCase().includes(value.toLowerCase()))
      setSuggestions(filteredSuggestions)
      setShowSuggestions(true)
    }
  }

  // Fonction pour sélectionner une suggestion
  const handleSelectSuggestion = (suggestion: string) => {
    setSearchParams({ ...searchParams, poste: suggestion })
    setShowSuggestions(false)
  }

  // Fonction pour effacer le champ de recherche
  const handleClearSearch = () => {
    setSearchParams({ ...searchParams, poste: "" })
    setSuggestions([])
    setShowSuggestions(false)
  }

  // Fonction pour gérer le changement de page
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
    // Faire défiler vers le haut de la liste des offres
    window.scrollTo({
      top: document.querySelector(".ls-outer")?.getBoundingClientRect().top + window.scrollY - 100 || 0,
      behavior: "smooth",
    })
  }

  // Fonction pour obtenir l'icône correspondant au type de travail
  const getWorkTypeIcon = (typeTravail: string) => {
    switch (typeTravail) {
      case "À Temps plein":
        return <Briefcase className="work-type-icon" />
      case "À temps partiel":
        return <Clock3 className="work-type-icon" />
      case "Free mission":
        return <AlarmClock className="work-type-icon" />
      default:
        return <Briefcase className="work-type-icon" />
    }
  }

  // Fonction pour basculer l'affichage des filtres sur mobile
  const toggleFilters = () => {
    setShowFilters(!showFilters)
  }

  return (
    <div className="jobs-page">
      <Header />

      {/* Bouton de filtre mobile */}
      <button className="filter-toggle-btn" onClick={toggleFilters}>
        <Filter size={24} />
      </button>

      {/* Header Section */}
      <section className="page-title">
        <div className="auto-container">
          <div className="job-search-form">
            <form className="search-form" onSubmit={handleSearch}>
              <div className="form-group search-field">
                <div className="search-container" ref={searchInputRef}>
                  <div className="search-input-wrapper">
                    <Search className="icon" />
                    <input
                      type="text"
                      placeholder="Titre de poste"
                      value={searchParams.poste}
                      onChange={handleSearchInputChange}
                      onFocus={() => {
                        if (searchParams.poste && suggestions.length > 0) {
                          setShowSuggestions(true)
                        }
                      }}
                    />
                    {searchParams.poste && (
                      <button
                        type="button"
                        className="clear-button"
                        onClick={handleClearSearch}
                        aria-label="Effacer la recherche"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  {showSuggestions && suggestions.length > 0 && (
                    <div className="suggestions-container">
                      {suggestions.map((suggestion, index) => (
                        <div key={index} className="suggestion-item" onClick={() => handleSelectSuggestion(suggestion)}>
                          {highlightMatch(suggestion, searchParams.poste)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group category-field">
                <MapPin className="icon" />
                <select
                  value={searchParams.ville}
                  onChange={(e) => setSearchParams({ ...searchParams, ville: e.target.value })}
                >
                  <option value="">Ville</option>
                  {villes.map((ville, index) => (
                    <option key={index} value={ville}>
                      {ville}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group category-field">
                <Building className="icon" />
                <select
                  value={searchParams.domaine}
                  onChange={(e) => setSearchParams({ ...searchParams, domaine: e.target.value })}
                >
                  <option value="">Domaines</option>
                  {domaines.map((domaine, index) => (
                    <option key={index} value={domaine}>
                      {domaine}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group button-field">
                <button type="submit" className="find-jobs-btn">
                
                  Chercher poste
                  
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Listing Section */}
      <section className="ls-section">
        <div className="auto-container">
          <div className="row">
            {/* Filters Column */}
            <div className={`filters-column ${showFilters ? "show" : ""}`}>
              <div className="inner-column">
                <div className="filters-outer">
                  {/* Job Type */}
                  <div className="switchbox-outer">
                    <h4>Type de poste</h4>
                    <ul className="switchbox">
                      <li>
                        <span className="title">CDD</span>
                        <label className="switch">
                          <input type="checkbox" name="cdd" checked={typesPoste.cdd} onChange={handleCheckboxChange} />
                          <span className="slider round"></span>
                        </label>
                      </li>
                      <li>
                        <span className="title">CDI</span>
                        <label className="switch">
                          <input type="checkbox" name="cdi" checked={typesPoste.cdi} onChange={handleCheckboxChange} />
                          <span className="slider round"></span>
                        </label>
                      </li>
                      <li>
                        <span className="title">Alternance</span>
                        <label className="switch">
                          <input
                            type="checkbox"
                            name="alternance"
                            checked={typesPoste.alternance}
                            onChange={handleCheckboxChange}
                          />
                          <span className="slider round"></span>
                        </label>
                      </li>
                      <li>
                        <span className="title">Stage</span>
                        <label className="switch">
                          <input
                            type="checkbox"
                            name="stage"
                            checked={typesPoste.stage}
                            onChange={handleCheckboxChange}
                          />
                          <span className="slider round"></span>
                        </label>
                      </li>
                    </ul>
                  </div>

                  {/* Date Posted */}
                  <div className="checkbox-outer">
                    <h4>Date de publication</h4>
                    <ul className="checkboxes">
                      <li>
                        <input
                          id="check-f"
                          type="radio"
                          name="datePublication"
                          checked={selectedDatePublication === "tous"}
                          onChange={() => handleDatePublicationChange("tous")}
                        />
                        <label htmlFor="check-f">Tous</label>
                      </li>
                      <li>
                        <input
                          id="check-a"
                          type="radio"
                          name="datePublication"
                          checked={selectedDatePublication === "derniere_heure"}
                          onChange={() => handleDatePublicationChange("derniere_heure")}
                        />
                        <label htmlFor="check-a">Derniere heure</label>
                      </li>
                      <li>
                        <input
                          id="check-b"
                          type="radio"
                          name="datePublication"
                          checked={selectedDatePublication === "24_heure"}
                          onChange={() => handleDatePublicationChange("24_heure")}
                        />
                        <label htmlFor="check-b">24 Heures</label>
                      </li>
                      <li>
                        <input
                          id="check-c"
                          type="radio"
                          name="datePublication"
                          checked={selectedDatePublication === "derniers_7_jours"}
                          onChange={() => handleDatePublicationChange("derniers_7_jours")}
                        />
                        <label htmlFor="check-c">Derniers 7 jours</label>
                      </li>
                    </ul>
                  </div>

                  {/* Experience Level */}
                  <div className="checkbox-outer">
                    <h4>Niveau d'expérience</h4>
                    <ul className="checkboxes square">
                      <li>
                        <input
                          id="check-ba"
                          type="radio"
                          name="niveauExperience"
                          checked={selectedExperienceLevel === "tous"}
                          onChange={() => handleExperienceLevelChange("tous")}
                        />
                        <label htmlFor="check-ba">Tous</label>
                      </li>
                      <li>
                        <input
                          id="check-bb"
                          type="radio"
                          name="niveauExperience"
                          checked={selectedExperienceLevel === "1ans"}
                          onChange={() => handleExperienceLevelChange("1ans")}
                        />
                        <label htmlFor="check-bb">1 ans</label>
                      </li>
                      <li>
                        <input
                          id="check-bc"
                          type="radio"
                          name="niveauExperience"
                          checked={selectedExperienceLevel === "2ans"}
                          onChange={() => handleExperienceLevelChange("2ans")}
                        />
                        <label htmlFor="check-bc">2 ans</label>
                      </li>
                      <li>
                        <input
                          id="check-bd"
                          type="radio"
                          name="niveauExperience"
                          checked={selectedExperienceLevel === "3ans"}
                          onChange={() => handleExperienceLevelChange("3ans")}
                        />
                        <label htmlFor="check-bd">3 ans</label>
                      </li>
                      <li>
                        <input
                          id="check-be"
                          type="radio"
                          name="niveauExperience"
                          checked={selectedExperienceLevel === "plus_de_3ans"}
                          onChange={() => handleExperienceLevelChange("plus_de_3ans")}
                        />
                        <label htmlFor="check-be">Plus de 3 ans</label>
                      </li>
                    </ul>
                  </div>

                  {/* Tags */}
                  <div className="filter-block">
                    <h4>Types de travilles</h4>
                    <div className="work-type-tags">
                      <button
                        onClick={() => handleTypeTravailChange("À Temps plein")}
                        className={`modern-work-button ${selectedTypeTravail === "À Temps plein" ? "active" : ""}`}
                      >
                        <Briefcase size={18} className="mr-2" />
                        <span>À Temps plein</span>
                      </button>
                      <button
                        onClick={() => handleTypeTravailChange("À temps partiel")}
                        className={`modern-work-button ${selectedTypeTravail === "À temps partiel" ? "active" : ""}`}
                      >
                        <Clock3 size={18} className="mr-2" />
                        <span>À temps partiel</span>
                      </button>
                      <button
                        onClick={() => handleTypeTravailChange("Free mission")}
                        className={`modern-work-button ${selectedTypeTravail === "Free mission" ? "active" : ""}`}
                      >
                        <AlarmClock size={18} className="mr-2" />
                        <span>Free mission</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Column */}
            <div className="content-column">
              <div className="ls-outer">
                {/* Job Listings */}
                {loading ? (
                  <div className="loader-container">
                    <div className="loader"></div>
                  </div>
                ) : offres.length > 0 ? (
                  <>
                    {/* Affichage des offres paginées */}
                    {offres.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((offre, index) => (
                      <JobBlock key={index} offre={offre} />
                    ))}

                    {/* Pagination en bas */}
                    {offres.length > itemsPerPage && (
                      <nav className="ls-pagination">
                        <ul>
                          <li className={`prev ${currentPage === 1 ? "disabled" : ""}`}>
                            <a
                              href="#"
                              onClick={(e) => {
                                e.preventDefault()
                                if (currentPage > 1) handlePageChange(currentPage - 1)
                              }}
                            >
                              <ChevronLeft />
                            </a>
                          </li>
                          {Array.from({ length: Math.ceil(offres.length / itemsPerPage) }, (_, i) => (
                            <li key={i}>
                              <a
                                href="#"
                                className={currentPage === i + 1 ? "current-page" : ""}
                                onClick={(e) => {
                                  e.preventDefault()
                                  handlePageChange(i + 1)
                                }}
                              >
                                {i + 1}
                              </a>
                            </li>
                          ))}
                          <li
                            className={`next ${currentPage === Math.ceil(offres.length / itemsPerPage) ? "disabled" : ""}`}
                          >
                            <a
                              href="#"
                              onClick={(e) => {
                                e.preventDefault()
                                if (currentPage < Math.ceil(offres.length / itemsPerPage))
                                  handlePageChange(currentPage + 1)
                              }}
                            >
                              <ChevronRight />
                            </a>
                          </li>
                        </ul>
                      </nav>
                    )}
                  </>
                ) : (
                  <div className="text-center py-10">Aucune offre disponible pour le moment</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}

// Fonction pour mettre en évidence les parties correspondantes dans les suggestions
function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query) return text

  const parts = text.split(new RegExp(`(${query})`, "gi"))

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <span key={index} className="highlight">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  )
}

function JobBlock({ offre }: { offre: Offre }) {
  return (
    <Link href={`/jobsDetail/${offre.id}`} legacyBehavior passHref>
      <a className="job-block" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
        <div className="inner-box">
          <div className="content">
            <h4>
              {offre.poste}
              <ArrowUpRight size={16} className="ml-auto text-gray-400" />
            </h4>
            <ul className="job-info">
              <li>
                <Building className="icon" /> {offre.societe}
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
        </div>
      </a>
    </Link>
  )
}