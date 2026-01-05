FROM node:18-alpine

WORKDIR /app

# Instalar dependencias del sistema para sharp y otras libs nativas
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    vips-dev \
    pkgconfig

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --omit=dev

# Reinstalar sharp específicamente para Alpine Linux (musl)
RUN npm uninstall sharp && \
    npm install --os=linux --libc=musl --cpu=x64 sharp

# Copiar código fuente
COPY . .

# Crear directorio de uploads
RUN mkdir -p uploads

# Exponer puerto
EXPOSE 5000

# Comando de inicio
CMD ["node", "server.js"]
