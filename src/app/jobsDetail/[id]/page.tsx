"use client";

import { useState, useEffect, use } from "react";
import {
  Briefcase,
  MapPin,
  Clock,
  X,
  Upload,
  GraduationCap,
  Trophy,
} from "lucide-react";
import { Calendar, Timer, User } from "lucide-react";
import Link from "next/link";
import Footer from "../../components/index/footer";
import Header from "../../components/index/header";
import "../../components/styles/index.css";
import "../../components/styles/jobsDetail.css";

interface OffreDetail {
  id: number;
  poste: string;
  departement: string;
  societe: string;
  ville: string;
  heureTravail: string;
  niveauEtude: string;
  niveauExperience: string;
  typePoste: string;
  typeTravail: string;
  description: string;
  responsabilite: string[];
  experience: string[];
  datePublication: string;
  dateExpiration: string;
  statut: "urgent" | "normal";
}

export default function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Utiliser React.use() pour déballer la Promise params
  const { id } = use(params);
  const [offre, setOffre] = useState<OffreDetail | null>(null);
  const [relatedJobs, setRelatedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
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
  });
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    // Fetch job details
    const fetchJobDetail = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://127.0.0.1:8000/api/offreDetail/${id}`
        );
        if (!response.ok) {
          throw new Error(
            "Erreur lors de la récupération des détails de l'offre"
          );
        }
        const data = await response.json();
        setOffre(data);

        // À l'intérieur du useEffect après avoir défini setOffre(data)
        setFormData((prev) => ({
          ...prev,
          offre_id: data.id,
        }));

        // Fetch related jobs from the same department
        if (data.departement) {
          const relatedResponse = await fetch(
            `http://127.0.0.1:8000/api/offres_domaine/${data.domaine}`
          );
          if (relatedResponse.ok) {
            const relatedData = await relatedResponse.json();
            // Filter out the current job and limit to 3 related jobs
            const filteredRelatedJobs = relatedData
              .filter((job) => job.id !== data.id)
              .slice(0, 3);
            setRelatedJobs(filteredRelatedJobs);
          }
        }
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchJobDetail();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Veuillez sélectionner un CV");
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("nom", formData.nom);
      formDataToSend.append("prenom", formData.prenom);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("pays", formData.pays);
      formDataToSend.append("ville", formData.ville);
      formDataToSend.append("codePostal", formData.codePostal);
      formDataToSend.append("tel", formData.tel);
      formDataToSend.append("niveauEtude", formData.niveauEtude);
      formDataToSend.append("niveauExperience", formData.niveauExperience);
      formDataToSend.append("offre_id", formData.offre_id);
      formDataToSend.append("cv", file);

      const response = await fetch("http://127.0.0.1:8000/api/candidatStore", {
        method: "POST",
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Erreur lors de l'envoi de la candidature"
        );
      }

      const data = await response.json();
      alert("Candidature envoyée avec succès!");
      setShowForm(false);
    } catch (error) {
      console.error("Erreur:", error);
      alert(`Erreur lors de l'envoi de la candidature: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="job-detail-page">
        <Header />
        <div className="loading-container">
          <div className="loader"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!offre) {
    return (
      <div className="job-detail-page">
        <Header />
        <div className="error-container">
          <h2>Offre non trouvée</h2>
          <p>L'offre que vous recherchez n'existe pas ou a été supprimée.</p>
          <Link href="/jobs" className="theme-btn btn-style-one">
            Retour aux offres
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Format the responsibilities and skills as arrays if they're not already
  const responsabilites = Array.isArray(offre.responsabilite)
    ? offre.responsabilite
    : offre.responsabilite?.split("\n").filter((item) => item.trim() !== "") ||
      [];

  const competences = Array.isArray(offre.experience)
    ? offre.experience
    : offre.experience?.split("\n").filter((item) => item.trim() !== "") || [];

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
                    {offre.statut === "urgent" && (
                      <li className="required">Urgent</li>
                    )}
                  </ul>
                </div>

                <div className="btn-box">
                  <button
                    onClick={() => setShowForm(true)}
                    className="theme-btn btn-style-one"
                  >
                    Postulez
                  </button>
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
                    <p>
                      {offre.description || "Aucune description disponible."}
                    </p>
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
                          <span>
                            {offre.datePublication || "Non spécifiée"}
                          </span>
                        </li>
                        <li>
                          <Timer className="icon" />
                          <h5>Date d'expiration:</h5>
                          <span>{offre.dateExpiration || "Non spécifiée"}</span>
                        </li>
                        <li>
                          <MapPin className="icon" />
                          <h5>Emplacement:</h5>
                          <span>{`${offre.departement || ""}, ${
                            offre.ville || ""
                          }`}</span>
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
                          <span>
                            {offre.niveauExperience || "Non spécifié"}
                          </span>
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

      {/* Application Form Popup */}
      {showForm && (
        <div className="form-overlay">
          <div className="form-container">
            <button className="close-button" onClick={() => setShowForm(false)}>
              <X size={24} />
            </button>
            <h2>Postuler pour: {offre.poste}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-section">
                <h3>Informations personnelles</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="prenom">Prénom</label>
                    <input
                      type="text"
                      id="prenom"
                      name="prenom"
                      value={formData.prenom}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="nom">Nom</label>
                    <input
                      type="text"
                      id="nom"
                      name="nom"
                      value={formData.nom}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="email">Adresse email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>Adresse</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="pays">Pays</label>
                    <select
                      id="pays"
                      name="pays"
                      value={formData.pays}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Sélectionnez un pays</option>
                      <option value="Tunisie">Tunisie</option>
                      <option value="Algérie">Algérie</option>
                      <option value="Maroc">Maroc</option>
                      <option value="Libye">Libye</option>
                      <option value="Égypte">Égypte</option>
                      <option value="France">France</option>
                      <option value="Belgique">Belgique</option>
                      <option value="Koweït">Koweït</option>
                      <option value="Arabie Saoudite">Arabie Saoudite</option>
                      <option value="Émirats Arabes Unis">
                        Émirats Arabes Unis
                      </option>
                      <option value="Qatar">Qatar</option>
                      <option value="Bahreïn">Bahreïn</option>
                      <option value="Suisse">Suisse</option>
                      <option value="Canada">Canada</option>
                      <option value="Mauritanie">Mauritanie</option>
                      <option value="Comores">Comores</option>
                      <option value="Somalie">Somalie</option>
                      <option value="Djibouti">Djibouti</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="ville">Ville</label>
                    <input
                      type="text"
                      id="ville"
                      name="ville"
                      value={formData.ville}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="codePostal">Code postal</label>
                    <input
                      type="text"
                      id="codePostal"
                      name="codePostal"
                      value={formData.codePostal}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Téléphone</h3>
                <div className="form-group">
                  <label htmlFor="tel">Téléphone</label>
                  <input
                    type="tel"
                    id="tel"
                    name="tel"
                    value={formData.tel}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>Formation</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="niveauEtude">Niveau d'étude</label>
                    <select
                      id="niveauEtude"
                      name="niveauEtude"
                      value={formData.niveauEtude}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Sélectionnez</option>
                      <option value="BTP">BTP</option>
                      <option value="BTS">BTS</option>
                      <option value="BAC">BAC</option>
                      <option value="BAC+1">BAC+1</option>
                      <option value="BAC+2">BAC+2</option>
                      <option value="BAC+3">BAC+3</option>
                      <option value="BAC+4">BAC+4</option>
                      <option value="BAC+5">BAC+5</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="niveauExperience">
                      Niveau d'éxperience
                    </label>
                    <select
                      id="niveauExperience"
                      name="niveauExperience"
                      value={formData.niveauExperience}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Sélectionnez</option>
                      <option value="0ans">aucune Expérience</option>
                      <option value="1ans">1 ans</option>
                      <option value="2ans">2 ans</option>
                      <option value="3ans">3 ans</option>
                      <option value="4ans">4 ans</option>
                      <option value="5ans">5 ans</option>
                      <option value="plus_de_5ans">Plus de 5ans</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>CV</h3>
                <div
                  className={`file-upload-area ${
                    dragActive ? "drag-active" : ""
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    id="cv"
                    name="cv"
                    onChange={handleFileChange}
                    className="file-input"
                    accept=".pdf,.doc,.docx"
                  />
                  <div className="upload-icon">
                    <Upload size={40} />
                  </div>
                  <div className="upload-text">
                    <p>Parcourir les fichiers</p>
                    <p className="upload-hint">
                      Glissez et déposez votre CV ici
                    </p>
                  </div>
                  {file && (
                    <div className="file-list">
                      <p>Fichier sélectionné:</p>
                      <div className="selected-file">{file.name}</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-button">
                  Envoyer ma candidature
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowForm(false)}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function RelatedJobBlock({ job }) {
  return (
    <Link href={`/jobsDetail/${job.id}`} legacyBehavior passHref>
      <a
        className="job-block"
        style={{ textDecoration: "none", color: "inherit", display: "block" }}
      >
        <div className="inner-box">
          <div className="content">
            <h4>
              {/* Utiliser un span au lieu d'un Link imbriqué */}
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
                <GraduationCap className="icon" />{" "}
                {job.niveauEtude || "Non spécifié"}
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
  );
}
