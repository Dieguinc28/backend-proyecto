FROM node:18-alpine

WORKDIR /app

# Instalar dependencias del sistema necesarias para sharp y otras librerías
RUN apk update && \
    apk add --no-cache \
    python3 \
    make \
    g++ \
    vips-dev \
    poppler-utils

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias (sin sharp primero)
RUN npm ci --omit=dev

# Reinstalar sharp específicamente para linux-musl
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
