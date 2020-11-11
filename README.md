# Dasel Playground

A playground for [Dasel](https://github.com/TomWright/dasel).

Publicly hosted at [https://dasel.tomwright.me](https://dasel.tomwright.me)

You can also run this yourself in Docker.

## Quickstart

### Docker
```bash
docker run -p 8080:8080 --rm ghcr.io/tomwright/daselplayground:latest
```

Docker images are pushed to the github container repository: [tomwright/daselplayground](https://github.com/users/TomWright/packages/container/package/daselplayground).

- `latest` - The latest released version.
- `dev` - The latest build from `main` branch.
- `v*.*.*` - The build from the given release.

## Release versions

Dasel Playground versions are **not** related to dasel release versions, meaning `daselplayground:v1.0.0` will not necessarily contain `dasel:v1.0.0`.
