import { Suspense } from "react";
import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import Stats from "@/components/landing/Stats";
import Solution from "@/components/landing/Solution";
import Features from "@/components/landing/Features";
import WhyChoose from "@/components/landing/WhyChoose";
import Pricing from "@/components/landing/Pricing";
import Footer from "@/components/landing/Footer";
import { renderSchemaTags } from "@/libs/seo";

export default function Home() {
  return (
    <>
      {renderSchemaTags()}
      <Suspense>
        <Header />
      </Suspense>
      <main className="min-h-screen bg-[#FDFDF9]">
        <Hero />
        <Stats />
        <Solution />
        <Features />
        <WhyChoose />
        <Pricing />
      </main>
      <Footer />
    </>
  );
}
