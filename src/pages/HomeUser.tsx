// src/App.jsx
import React from "react";

import Header from "../components/Hero/Header";
import Hero from "../components/Hero/Hero";
import Footer from "../components/Hero/Footer";

const HomeUser = () => {
  return (
    <div className="App">
      <Header />
      <Hero />
      <Footer />
    </div>
  );
};

export default HomeUser;
