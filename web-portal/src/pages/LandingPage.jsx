import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import MetroPolyline from '../components/MetroPolyline';
import PassCards from '../components/PassCards';
import HowItWorks from '../components/HowItWorks';
import VehicleModes from '../components/VehicleModes';
import RouteChecker from '../components/RouteChecker';
import PassStatusCard from '../components/PassStatusCard';
import WhyChooseUs from '../components/WhyChooseUs';
import Statistics from '../components/Statistics';
import UserJourney from '../components/UserJourney';
import Testimonials from '../components/Testimonials';
import FinalCTA from '../components/FinalCTA';
import Footer from '../components/Footer';
import StickyMobileBar from '../components/StickyMobileBar';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <Navbar />
      <main>
        <Hero />
        <MetroPolyline />
        <PassCards />
        <HowItWorks />
        <VehicleModes />
        <RouteChecker />
        <PassStatusCard />
        <WhyChooseUs />
        <Statistics />
        <UserJourney />
        <Testimonials />
        <FinalCTA />
      </main>
      <Footer />
      <StickyMobileBar />
    </div>
  );
};

export default LandingPage;
