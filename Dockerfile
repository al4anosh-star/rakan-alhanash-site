FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ENV VITE_BACKEND=local
RUN npm run build

FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=8787 TRUST_PROXY=1
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server
COPY --from=build /app/src/lib/demo.js ./src/lib/demo.js
COPY --from=build /app/src/config/site.js ./src/config/site.js
COPY package.json ./
VOLUME /app/server/data
EXPOSE 8787
USER node
CMD ["node", "server/index.js"]
