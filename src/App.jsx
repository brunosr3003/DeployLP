// src/App.jsx
import React, { useEffect } from "react";
import AOS from "aos"; 
import "aos/dist/aos.css";
import { AppRoutes } from "./routes";
import { AuthProvider } from "./AuthContext";
import ErrorBoundary from './components/ErrorBoundary';
import Modal from 'react-modal';
import { ToastContainer } from 'react-toastify'; // Importando ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // Importando estilos

// Define o elemento raiz para o modal
Modal.setAppElement('#root'); // Assegure-se de que seu elemento raiz tem o id 'root'

function App() {
  useEffect(() => {
    AOS.init({
      offset: 100,
      duration: 500,
      easing: "ease-in-sine",
      delay: 100,
    });
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppRoutes />
        <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
