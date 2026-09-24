import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import SystemSection from "@/components/landing/SystemSection";
import Pricing from "@/components/landing/Pricing";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="page">
      <Navbar />
      <Hero />
      <Features />
      <SystemSection />
      <Pricing />
      <Footer />
    </div>
  );
  }
