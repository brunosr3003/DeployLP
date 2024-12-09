import React from "react";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaMobileAlt,
} from "react-icons/fa";

const Footer = () => {
  
  return (
    <div className="rounded-t-3xl bg-gradient-to-r from-blue-950 via-blue-800 to-blue-950">
      <section className="mx-auto max-w-[1200px] text-white">
        <div className="grid py-3 md:grid-cols-3">
          <div className="px-4 py-8">
            <h1 className="mb-3 text-justify text-xl font-bold sm:text-left sm:text-3xl">
              <a href="/#home" className="">
                Multiluz
                <span className="inline-block font-bold text-primary">Solar</span>
              </a>
            </h1>
            <p className="">
              NOSSO SUCESSO VEM DO COMPROMETIMENTO COM A SUA ECONOMIA{" "}
            </p>
            <br />

            <div className="mt-3 flex items-center gap-3">
              <FaMobileAlt />
              <a
                href="https://api.whatsapp.com/send/?phone=553136173862&text=Oi%21+Vi+o+perfil+no+Insta+e+gostaria+de+saber+mais+sobre+energia+solar&type=phone_number&app_absent=0"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                Suporte Técnico (34) 99672-8437
              </a>
            </div>
          </div>

          <div className="col-span-2 grid grid-cols-2 sm:grid-cols-3 md:pl-10">
            {/* Espaço vazio para alinhar as redes sociais à direita */}
            <div className="col-span-2"></div>

            <div className="ml-auto px-2 py-2">
              <h1 className="mb-3 text-justify text-xl font-bold sm:text-left sm:text-xl">
                Redes Sociais
              </h1>
              <div className="flex flex-col gap-3">
                <div className="mt-6 flex items-center gap-3">
                  <a
                    href="https://www.instagram.com/multiluzsolaroficial/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="duration-200 hover:scale-105"
                  >
                    <FaInstagram className="text-3xl" />
                  </a>
                  <a
                    href="https://www.facebook.com/multiluzsolaroficial"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="duration-200 hover:scale-105"
                  >
                    <FaFacebook className="text-3xl" />
                  </a>
                  <a
                    href="https://www.linkedin.com/company/grupo-multiluz/posts/?feedView=all"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="duration-200 hover:scale-105"
                  >
                    <FaLinkedin className="text-3xl" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div className="border-t-2 border-gray-300/50 py-6 text-center">
            Todos os Direitos Reservados | Multiluz Solar
          </div>
        </div>
      </section>
    </div>
  );
};

export default Footer;
