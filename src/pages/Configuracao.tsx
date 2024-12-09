// src/pages/Configuracao.jsx

import React from "react";
import Config from "../components/Config/Config";
import Navbar2 from "../components/navbar/Navbar2";

const Configuracao = () => {
  return (
    <div className="dark:bg-slate-900 dark:text-white p-4">
            <div className="fixed left-0 right-0 top-0 z-50 bg-gradient-to-l from-blue-900 via-blue-800 to-blue-900 ">
              <Navbar2 />
            </div> 
      <h1 className="text-3xl mb-6">Configuração</h1>
      <Config />
    </div>
  );
};

export default Configuracao;
