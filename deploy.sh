#!/bin/bash

# Caminho para o projetosystem
cd /home/multiluzsolar/MultiluzSolarWebSystem/

# Atualiza o repositório
git pull origin main

# Instala dependências e corrige vulnerabilidades
npm install
npm audit fix

# Definir variáveis de ambiente
export GOOGLE_APPLICATION_CREDENTIALS='/home/multiluzsolar/credentials/bigquery-key.json'

# Reinicia o PM2 com as variáveis de ambiente definidas
pm2 restart MultiluzSolarWebSystemBackEnd --update-env
