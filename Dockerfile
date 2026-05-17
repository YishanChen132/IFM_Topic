FROM node:20-alpine AS build

WORKDIR /app

COPY package.json ./
COPY frontend/package.json frontend/package-lock.json ./frontend/
RUN npm install

COPY . .
RUN npm run build

FROM node:20-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4173

COPY --from=build /app/frontend/dist ./frontend/dist
COPY --from=build /app/server.mjs ./server.mjs

EXPOSE 4173

CMD ["node", "server.mjs"]
