#!/bin/bash

# Interromper o script em caso de erro
set -e

# Atualizar o repositório
echo "Atualizando o repositório com git pull..."
git pull

# Parar o contêiner, se estiver em execução
echo "Parando o contêiner existente..."
docker stop gc_data_app || true

# Remover o contêiner
echo "Removendo o contêiner existente..."
docker rm gc_data_app || true

# Remover a imagem
echo "Removendo a imagem existente..."
docker rmi gc_data_app || true

# Construir a nova imagem
echo "Construindo a nova imagem..."
docker build -t gc_data_app .

# Rodar o contêiner
echo "Iniciando o novo contêiner..."
docker run -d --name gc_data_app -p 3000:3000 gc_data_app

echo "Container 'gc_data_app' iniciado e disponível na porta 3000."
