# This stage builds the go executable.
FROM golang:1.15-buster as go

WORKDIR /root
COPY ./ ./

RUN mkdir -p bin/builds

RUN go build -o bin/server cmd/server/main.go

WORKDIR bin/builds
RUN curl -s https://api.github.com/repos/tomwright/dasel/releases/latest | grep browser_download_url | cut -d '"' -f 4 | wget -qi - && mv dasel_linux_amd64 dasel_latest && chmod +x dasel_latest
RUN dasel_releases = $(curl -s "https://api.github.com/repos/tomwright/dasel/releases?per_page=100")
RUN dasel_releases | grep v1.19.0 | grep browser_download_url | cut -d '"' -f 4 | wget -qi - && mv dasel_linux_amd64 dasel_v1_19_0 && chmod +x dasel_v1_19_0
RUN dasel_releases | grep v1.18.0 | grep browser_download_url | cut -d '"' -f 4 | wget -qi - && mv dasel_linux_amd64 dasel_v1_18_0 && chmod +x dasel_v1_18_0
RUN dasel_releases | grep v1.17.0 | grep browser_download_url | cut -d '"' -f 4 | wget -qi - && mv dasel_linux_amd64 dasel_v1_17_0 && chmod +x dasel_v1_17_0
RUN dasel_releases | grep v1.16.1 | grep browser_download_url | cut -d '"' -f 4 | wget -qi - && mv dasel_linux_amd64 dasel_v1_16_1 && chmod +x dasel_v1_16_1
RUN dasel_releases | grep v1.15.0 | grep browser_download_url | cut -d '"' -f 4 | wget -qi - && mv dasel_linux_amd64 dasel_v1_15_0 && chmod +x dasel_v1_15_0
RUN dasel_releases | grep v1.14.0 | grep browser_download_url | cut -d '"' -f 4 | wget -qi - && mv dasel_linux_amd64 dasel_v1_14_0 && chmod +x dasel_v1_14_0
RUN dasel_releases | grep v1.13.4 | grep browser_download_url | cut -d '"' -f 4 | wget -qi - && mv dasel_linux_amd64 dasel_v1_13_4 && chmod +x dasel_v1_13_4
RUN dasel_releases | grep v1.12.2 | grep browser_download_url | cut -d '"' -f 4 | wget -qi - && mv dasel_linux_amd64 dasel_v1_12_2 && chmod +x dasel_v1_12_2
RUN dasel_releases | grep v1.11.0 | grep browser_download_url | cut -d '"' -f 4 | wget -qi - && mv dasel_linux_amd64 dasel_v1_11_0 && chmod +x dasel_v1_11_0
RUN dasel_releases | grep v1.10.0 | grep browser_download_url | cut -d '"' -f 4 | wget -qi - && mv dasel_linux_amd64 dasel_v1_10_0 && chmod +x dasel_v1_10_0
RUN dasel_releases | grep v1.9.1 | grep browser_download_url | cut -d '"' -f 4 | wget -qi - && mv dasel_linux_amd64 dasel_v1_9_1 && chmod +x dasel_v1_9_1
RUN dasel_releases | grep v1.8.0 | grep browser_download_url | cut -d '"' -f 4 | wget -qi - && mv dasel_linux_amd64 dasel_v1_8_0 && chmod +x dasel_v1_8_0
RUN dasel_releases | grep v1.7.0 | grep browser_download_url | cut -d '"' -f 4 | wget -qi - && mv dasel_linux_amd64 dasel_v1_7_0 && chmod +x dasel_v1_7_0
RUN dasel_releases | grep v1.6.2 | grep browser_download_url | cut -d '"' -f 4 | wget -qi - && mv dasel_linux_amd64 dasel_v1_6_2 && chmod +x dasel_v1_6_2
RUN dasel_releases | grep v1.5.1 | grep browser_download_url | cut -d '"' -f 4 | wget -qi - && mv dasel_linux_amd64 dasel_v1_5_1 && chmod +x dasel_v1_5_1
RUN dasel_releases | grep v1.4.1 | grep browser_download_url | cut -d '"' -f 4 | wget -qi - && mv dasel_linux_amd64 dasel_v1_4_1 && chmod +x dasel_v1_4_1
RUN dasel_releases | grep v1.3.0 | grep browser_download_url | cut -d '"' -f 4 | wget -qi - && mv dasel_linux_amd64 dasel_v1_3_0 && chmod +x dasel_v1_3_0
RUN dasel_releases | grep v1.2.0 | grep browser_download_url | cut -d '"' -f 4 | wget -qi - && mv dasel_linux_amd64 dasel_v1_2_0 && chmod +x dasel_v1_2_0
RUN dasel_releases | grep v1.1.0 | grep browser_download_url | cut -d '"' -f 4 | wget -qi - && mv dasel_linux_amd64 dasel_v1_1_0 && chmod +x dasel_v1_1_0

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
ENV DASEL_BUILDS="${DASEL_BUILDS},v1.19.0:./builds/dasel_v1_19_0"
ENV DASEL_BUILDS="${DASEL_BUILDS},v1.18.0:./builds/dasel_v1_18_0"
ENV DASEL_BUILDS="${DASEL_BUILDS},v1.17.0:./builds/dasel_v1_17_0"
ENV DASEL_BUILDS="${DASEL_BUILDS},v1.16.1:./builds/dasel_v1_16_1"
ENV DASEL_BUILDS="${DASEL_BUILDS},v1.15.0:./builds/dasel_v1_15_0"
ENV DASEL_BUILDS="${DASEL_BUILDS},v1.14.0:./builds/dasel_v1_14_0"
ENV DASEL_BUILDS="${DASEL_BUILDS},v1.13.4:./builds/dasel_v1_13_4"
ENV DASEL_BUILDS="${DASEL_BUILDS},v1.12.2:./builds/dasel_v1_12_2"
ENV DASEL_BUILDS="${DASEL_BUILDS},v1.11.0:./builds/dasel_v1_11_0"
ENV DASEL_BUILDS="${DASEL_BUILDS},v1.10.0:./builds/dasel_v1_10_0"
ENV DASEL_BUILDS="${DASEL_BUILDS},v1.9.1:./builds/dasel_v1_9_1"
ENV DASEL_BUILDS="${DASEL_BUILDS},v1.8.0:./builds/dasel_v1_8_0"
ENV DASEL_BUILDS="${DASEL_BUILDS},v1.7.0:./builds/dasel_v1_7_0"
ENV DASEL_BUILDS="${DASEL_BUILDS},v1.6.2:./builds/dasel_v1_6_2"
ENV DASEL_BUILDS="${DASEL_BUILDS},v1.5.1:./builds/dasel_v1_5_1"
ENV DASEL_BUILDS="${DASEL_BUILDS},v1.4.1:./builds/dasel_v1_4_1"
ENV DASEL_BUILDS="${DASEL_BUILDS},v1.3.0:./builds/dasel_v1_3_0"
ENV DASEL_BUILDS="${DASEL_BUILDS},v1.2.0:./builds/dasel_v1_2_0"
ENV DASEL_BUILDS="${DASEL_BUILDS},v1.1.0:./builds/dasel_v1_1_0"

ENV HTTP_LISTEN_ADDRESS=:8080
ENV MIGRATIONS_PATH=/root/migrations

EXPOSE 8080

CMD ["./server"]