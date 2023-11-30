# This stage builds the go executable.
FROM golang:1.18-buster as go

WORKDIR /root
COPY ./ ./

RUN mkdir -p bin/builds

RUN go build -o bin/server cmd/server/main.go

WORKDIR bin/builds
RUN curl -s https://api.github.com/repos/tomwright/dasel/releases/latest | grep browser_download_url | cut -d '"' -f 4 | wget -qi - && mv dasel_linux_amd64 dasel_latest && chmod +x dasel_latest
RUN curl -s "https://api.github.com/repos/tomwright/dasel/releases?per_page=100" > dasel_releases
RUN cat dasel_releases | grep v2.5.0 | grep browser_download_url | cut -d '"' -f 4 | wget -qi - && mv dasel_linux_amd64 dasel_v2_5_0 && chmod +x dasel_v2_5_0
RUN cat dasel_releases | grep v1.27.3 | grep browser_download_url | cut -d '"' -f 4 | wget -qi - && mv dasel_linux_amd64 dasel_v1_27_3 && chmod +x dasel_v1_27_3

# This stage builds the Svelte app
FROM node:15.0-buster as node

WORKDIR /root
COPY ./ ./

WORKDIR /root/frontend

RUN npm install
RUN npm run-script build

# Final stage that will be pushed.
FROM debian:buster-slim

WORKDIR /root

COPY --from=go /root/bin/server ./server
COPY --from=go /root/bin/builds ./builds
COPY --from=node /root/frontend ./frontend

COPY ./migrations ./migrations

ENV DASEL_BUILDS="latest:./builds/dasel_latest"
ENV DASEL_BUILDS="${DASEL_BUILDS},v2.5.0:./builds/dasel_v2_5_0"
ENV DASEL_BUILDS="${DASEL_BUILDS},v1.27.3:./builds/dasel_v1_27_3"

ENV HTTP_LISTEN_ADDRESS=:8080
ENV MIGRATIONS_PATH=/root/migrations

EXPOSE 8080

CMD ["./server"]