import Splash from "@/components/Splash";
import EffectsManager from "@/components/EffectsManager";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Works from "@/components/Works";
import { About, Services, TechMarquee, Numbers, Footer } from "@/components/Sections";

export default function Home() {
  return (
    <>
      <Splash />
      <EffectsManager />
      <div className="wrapper">
        <div className="Bg" aria-hidden="true" />
        <Header />
        <main id="main">
          <Hero />
          <About />
          <Services />
          <TechMarquee />
          <Works />
          <Numbers />
        </main>
        <Footer />
      </div>
    </>
  );
}
