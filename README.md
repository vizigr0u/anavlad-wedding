# anavlad-wedding

A website I made for our wedding.

## Overview

### Features

- Access by private links
- RSVP form auto-saves
- Admin space with guests changes notification, space to add guests and view attendees
- "Fancy" invite card-like front, with flipping scrolling effect
- works on most devices and browsers (including android/iOS)
- Guests Carpooling section (beta)

### Technical features

- Node backend with Sqlite databases exposed as API
- React TypeScript frontend using vite
- Docker for backend and nginx docker for frontend
- docker compose with example of how to bind volumes for config, private data, photos, etc. for easier management without recompiling / re-deploying.

## Running the app

### Requirements

- node 23 (recommended way to install: [nvm](https://github.com/nvm-sh/nvm))
- [pnpm](https://pnpm.io/)

### Cloning the repository

```sh
git clone https://github.com/vizigr0u/anavlad-wedding.git
cd anavlad-wedding
```

### Installing dependencies

```sh
pnpm install
```

### Deploying with Docker

To deploy the application using Docker Compose, follow these steps:

```sh
docker compose up --build
```

### Accessing the app

Open your web browser and navigate to `http://localhost:3000`.

## Development

### Running the development server and frontend with hot-reload

```sh
pnpm dev
```

## Photos copyright

Photos under `frontend/user-data/images` are the property of Vladimir Nachbaur and are to be used as placeholders only.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
