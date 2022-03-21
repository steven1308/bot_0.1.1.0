FROM node:16 AS BUILD

# Add package file
COPY package.json ./app/package.json
COPY package-lock.json ./app/package-lock.json

# Copy source
COPY src ./app/src
COPY commands ./app/commands
COPY bot.js ./app/bot.js
COPY delight.js ./app/delight.js

WORKDIR /app

# Install dependencies
RUN npm install

# remove development dependencies
RUN npm prune --production

# Start production image build
FROM node:16

# copy from build image
COPY --from=BUILD /app ./
COPY --from=BUILD /app/node_modules ./node_modules

# Add env
ENV NODE_ENV=production

CMD ["node", "bot.js"]