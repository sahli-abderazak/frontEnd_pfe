"use client"
import Image from "next/image"
import { Upload, Briefcase, Mail } from "lucide-react"
import { useEffect, useState } from "react"

import TestimonialsSection from "../components/index/testimonials-section"
import FeaturedJobs from "../components/index/featured-jobs"
import JobCategories from "../components/index/job-categories"
import RecruitersSection from "../components/index/news-section" // Import the new component

import "../components/styles/index.css"
import Header from "../components/index/header"
import Footer from "../components/index/footer"

export default function Index() {
  const [departement, setDepartement] = useState("")
  const [domaine, setDomaine] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  // State variables for departments and domains
  const [departements, setDepartements] = useState([])
  const [domaines, setDomaines] = useState([])

  useEffect(() => {
    const handleMouseMove = (e) => {
      const cards = document.querySelectorAll(".floating-card")
      const mouseX = e.clientX / window.innerWidth - 0.5
      const mouseY = e.clientY / window.innerHeight - 0.5

      cards.forEach((card) => {
        // Get a random movement factor for each card to create varied movement
        const moveFactor = Number.parseFloat(card.getAttribute("data-move-factor") || "30")

        // Calculate the movement offset based on mouse position
        const moveX = mouseX * moveFactor
        const moveY = mouseY * moveFactor

        // Apply the transformation
        card.style.transform = `translate(${moveX}px, ${moveY}px)`
        card.style.transition = "transform 0.2s ease-out"
      })
    }

    // Add mouse move event listener
    window.addEventListener("mousemove", handleMouseMove)

    // Initialize random movement factors for each card
    document.querySelectorAll(".floating-card").forEach((card) => {
      // Set a random movement factor between 20 and 40
      const randomFactor = 20 + Math.random() * 20
      card.setAttribute("data-move-factor", randomFactor)
    })

    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Hero Section */}
      <section className="relative bg-slate-50 py-16 lg:py-24 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                  Il ya <span className="text-primary">93,178</span> Poste ici pour toi !
                </h1>
                <p className="text-lg text-muted-foreground">Trouvez un Poste, Stage & Des Opportunitiés de carrière</p>
              </div>
            </div>

            {/* Right Side Content */}
            <div className="relative hidden lg:block">
              <Image
                src="/image.png"
                alt="Professional at work"
                width={600}
                height={700}
                className="object-contain"
                priority
              />

              {/* Floating Cards */}
              <div className="absolute top-12 left-0 bg-white rounded-lg shadow-lg p-4 flex items-center gap-4 floating-card">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <Mail className="text-amber-600 w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium">Opportunités par </p>
                  <p className="text-sm text-muted-foreground">Talent Match</p>
                </div>
              </div>

              {/* Creative Agency */}
              <div className="absolute bottom-32 right-8 bg-white rounded-lg shadow-lg p-4 flex flex-col items-start floating-card">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center">
                    <Briefcase className="text-rose-600 w-4 h-4" />
                  </div>
                  <span className="font-medium">Des entreprises creatives</span>
                </div>
                <p className="text-sm text-muted-foreground">Startup</p>
              </div>

              {/* Upload Your CV */}
              <div className="absolute bottom-16 left-8 bg-white rounded-lg shadow-lg p-4 flex items-center gap-4 floating-card">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Upload className="text-green-600 w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium">Ajouter ton CV</p>
                  <p className="text-sm text-muted-foreground">Il prend juste des secondes</p>
                </div>
              </div>

              {/* 10k+ Candidates */}
              <div className="absolute top-1/3 right-8 bg-white rounded-lg shadow-lg p-4 floating-card">
                <img src="/multi-peoples.png" alt="Candidates" className="w-32 h-auto" />
                <p className="font-medium">10k+ Candidates</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <JobCategories />
      <FeaturedJobs />
      <TestimonialsSection />
      <RecruitersSection /> 
      <Footer />
    </div>
  )
}