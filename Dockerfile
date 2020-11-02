# This stage builds the go executable.
FROM golang:1.15-buster as go

WORKDIR /root
COPY ./ ./

RUN mkdir -p bin/builds

RUN go build -o bin/server cmd/server/main.go

WORKDIR bin/builds
RUN curl -s https://api.github.com/repos/tomwright/dasel/releases | grep v1.1.0 | grep browser_download_url | cut -d '"' -f 4 | wget -qi - && mv dasel_linux_amd64 dasel_v1_1_0 && chmod +x dasel_v1_1_0

# Final stage that will be pushed.
FROM debian:buster-slim

WORKDIR /root

# copy the mermaidcli node package into the container and install
#COPY ./mermaidcli/* ./

#RUN npm install

#ENV DEBIAN_FRONTEND=noninteractive
#RUN apt-get update 2>/dev/null && \
#	apt-get install -y --no-install-recommends \
#		ca-certificates \
#		gconf-service \
#        libasound2 \
#        libatk1.0-0 \
#        libatk-bridge2.0-0 \
#        libc6 \
#        libcairo2 \
#        libcups2 \
#        libdbus-1-3 \
#        libexpat1 \
#        libfontconfig1 \
#        libgcc1 \
#        libgconf-2-4 \
#        libgdk-pixbuf2.0-0 \
#        libglib2.0-0 \
#        libgtk-3-0 \
#        libnspr4 \
#        libpango-1.0-0 \
#        libpangocairo-1.0-0 \
#        libstdc++6 \
#        libx11-6 \
#        libx11-xcb1 \
#        libxcb1 \
#        libxcomposite1 \
#        libxcursor1 \
#        libxdamage1 \
#        libxext6 \
#        libxfixes3 \
#        libxi6 \
#        libxrandr2 \
#        libxrender1 \
#        libxss1 \
#        libxtst6 \
#        libxcb-dri3-0 \
#        libgbm1 \
#        ca-certificates \
#        fonts-liberation \
#        libappindicator1 \
#        libnss3 \
#        lsb-release \
#        xdg-utils \
#        wget \
#		2>/dev/null

COPY --from=go /root/bin/server ./server
COPY --from=go /root/bin/builds ./builds

ENV DASEL_BUILDS=v1.1.0:./builds/dasel_v1_1_0
ENV HTTP_LISTEN_ADDRESS=:8080

CMD ["./server"]