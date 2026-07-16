FROM node:24

# RUN npm install -g pnpm
RUN npm config set fetch-retry-maxtimeout 600000 && \
    npm config set fetch-timeout 600000 && \
    npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

# RUN pnpm install
RUN pnpm config set fetch-timeout 600000 && \
    pnpm config set network-concurrency 1 && \
    pnpm install

COPY . .

EXPOSE 3000

CMD ["pnpm", "run", "dev"]