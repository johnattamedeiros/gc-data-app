#!/bin/bash

# Parar o contêiner, se estiver em execução
docker stop gc_data_app

# Remover o contêiner
docker rm gc_data_app

# Remover a imagem
docker rmi gc_data_app

# Construir a nova imagem
docker build -t gc_data_app .

# Rodar o contêiner
docker run -d --name gc_data_app -p 3000:3000 gc_data_app

echo "Container 'gc_data_app' iniciado e disponível na porta 3000."
