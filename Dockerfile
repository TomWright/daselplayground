# This stage builds the go executable.
FROM golang:1.15-buster as go

WORKDIR /root
COPY ./ ./

RUN mkdir -p bin/builds

RUN go build -o bin/server cmd/server/main.go

WORKDIR bin/builds
RUN curl -s https://api.github.com/repos/tomwright/dasel/releases/latest | grep browser_download_url | cut -d '"' -f 4 | wget -qi - && mv dasel_linux_amd64 dasel_latest && chmod +x dasel_latest
RUN curl -s https://api.github.com/repos/tomwright/dasel/releases | grep v1.4.0 | grep browser_download_url | cut -d '"' -f 4 | wget -qi - && mv dasel_linux_amd64 dasel_v1_4_0 && chmod +x dasel_v1_4_0
RUN curl -s https://api.github.com/repos/tomwright/dasel/releases | grep v1.3.0 | grep browser_download_url | cut -d '"' -f 4 | wget -qi - && mv dasel_linux_amd64 dasel_v1_3_0 && chmod +x dasel_v1_3_0
RUN curl -s https://api.github.com/repos/tomwright/dasel/releases | grep v1.2.0 | grep browser_download_url | cut -d '"' -f 4 | wget -qi - && mv dasel_linux_amd64 dasel_v1_2_0 && chmod +x dasel_v1_2_0
RUN curl -s https://api.github.com/repos/tomwright/dasel/releases | grep v1.1.0 | grep browser_download_url | cut -d '"' -f 4 | wget -qi - && mv dasel_linux_amd64 dasel_v1_1_0 && chmod +x dasel_v1_1_0

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

ENV DASEL_BUILDS=latest:./builds/dasel_latest,v1.4.0:./builds/dasel_v1_4_0,v1.3.0:./builds/dasel_v1_3_0,v1.2.0:./builds/dasel_v1_2_0,v1.1.0:./builds/dasel_v1_1_0
ENV HTTP_LISTEN_ADDRESS=:8080
ENV MIGRATIONS_PATH=/root/migrations

EXPOSE 8080

CMD ["./server"]