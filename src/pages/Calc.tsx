// src/pages/Calc.jsx

import React from "react";
import Navbar2 from "../components/navbar/Navbar2";
import CalcProposta from "../components/Calc/CalcProposta";

export const Calc = () => {
  return (
    <>
      <div className="dark:bg-slate-900 dark:text-white pt-16"> {/* Adicionado pt-16 */}
        <div className="fixed left-0 right-0 top-0 z-50 bg-gradient-to-l from-blue-900 via-blue-800 to-blue-900 h-16"> {/* Definida altura h-16 */}
          <Navbar2 />
        </div>
        
        <CalcProposta />
        
        {/* <Footer /> */} 
      </div>
    </>
  );
};
