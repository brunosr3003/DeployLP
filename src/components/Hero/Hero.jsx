import React from "react";
import "./Hero.css"; 

const Hero = () => {
  return (
    <main className="hero-main">
      <section className="hero-container">
        <h1>Explicação do projeto</h1>

        
        <p>
          O projeto desenvolvido foi uma página de login utilizando as tecnologias <strong>React</strong> e <strong>Vite</strong>. 
          O sistema possui dois usuários cadastrados no banco de dados e oferece a funcionalidade de autenticação. 
          Ao realizar o login com credenciais corretas, o sistema autentica o usuário e o redireciona para uma nova página. 
          Caso o login seja realizado com credenciais inválidas, uma mensagem de erro aparece na tela, informando o problema.
        </p>

        
        <p>
          O banco de dados utilizado foi o banco já projetado de uma startup, que possui um sistema CRM (Customer Relationship Management), 
          um servidor próprio e infraestrutura de banco de dados integrada. Embora o banco de dados não tenha sido projetado 
          especificamente para este projeto, foi possível reutilizar a estrutura existente para armazenar e validar os dados de login dos usuários.
        </p>

        
        <p>
          A API Rest foi implementada de maneira simplificada para atender às necessidades do projeto. Os principais endpoints utilizados foram:
        </p>
        <ul>
          <li>
            <strong>POST /login</strong>: Endpoint responsável por autenticar os usuários. Recebe as credenciais (e-mail e senha) do cliente 
            e valida os dados no banco de dados. Caso as credenciais sejam válidas, o sistema responde com um status de sucesso e redireciona o usuário.
          </li>
          <li>
            <strong>GET /user-data</strong>: Endpoint responsável por buscar dados adicionais do usuário autenticado no banco de dados. 
            Este endpoint é chamado após o login bem-sucedido para carregar informações personalizadas ou exibir dados do perfil do usuário na página subsequente.
          </li>
        </ul>
        <p>
          A API foi projetada para ser simples, garantindo a funcionalidade básica do sistema de autenticação sem comprometer a performance ou 
          a escalabilidade da aplicação.
        </p>
      </section>
    </main>
  );
};

export default Hero;