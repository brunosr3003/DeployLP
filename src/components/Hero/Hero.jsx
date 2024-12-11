// src/components/Hero.jsx
import React from "react";
import "./Hero.css"; // Crie um arquivo CSS para estilização

const Hero = () => {
  return (
    <main className="hero-main">
      <section className="hero-container">
        <img src="/Icon.jpg" alt="Agricoop Logo" className="hero-image" />
        <h1>Bem-vindo à Agricoop</h1>
        <p>Potencializando o desenvolvimento econômico dos produtores rurais.</p>
      </section>
    </main>
  );
};