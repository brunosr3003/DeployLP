// pages/geradorcontratos.tsx
import React from "react"
import { Link } from "react-router-dom"
import Navbar2 from "../components/navbar/Navbar2"
import Footer from "../components/Footer/Footer"
import Forms from "../components//Forms/Forms"




export const GeradorContratos = () => {
    return <>
        <div className="dark:bg-slate-900 dark:text-white">
            <div className="fixed left-0 right-0 top-0 z-50 bg-gradient-to-l from-blue-900 via-blue-800 to-blue-900 ">
            <Navbar2 />
            </div>                
            <Forms/>             
            
            <Footer />
      </div>
    </>
}  