FROM node:20-alpine
WORKDIR /app
COPY server.js .
COPY public ./public
# Répertoire de données accessible à l'utilisateur non-root "node"
RUN mkdir -p /data && chown -R node:node /data
USER node
VOLUME /data
EXPOSE 3000
CMD ["node", "server.js"]
