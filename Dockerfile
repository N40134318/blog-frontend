FROM node:22-bookworm

RUN npm install -g pnpm

WORKDIR /workspace

COPY package.json pnpm-lock.yaml* ./

RUN pnpm install

CMD ["sh", "-c", "pnpm install && pnpm dev --host 0.0.0.0 --port 3000"]
