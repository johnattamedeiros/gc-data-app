# Use a imagem oficial do Node.js como base
FROM node:20

# Crie e defina o diretório de trabalho
WORKDIR /usr/src/app

# Copie o package.json e package-lock.json para o diretório de trabalho
COPY package*.json ./

# Instale as dependências do projeto
RUN npm install

# Copie todo o restante do código-fonte para o diretório de trabalho
COPY . .

# Exponha a porta que o servidor irá escutar
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["node", "index.js"]