# CricCareers

CricCareers is a simple cricket player management app. It uses Node.js, Express, and MySQL on the backend, with plain HTML, CSS, and JavaScript in the browser.

## Requirements

- Node.js and npm
- MySQL Server running on the configured host and port
- A MySQL user allowed to create the `Cricket` database and its tables

The backend dependencies are Express, mysql2, and dotenv. They are listed in `backend/package.json`.

## Database setup

The backend reads its database settings from `backend/.env`. Keep the file private and do not commit it. Set `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, and `PORT` in that file.

On startup, the app creates the configured database and the `players` table only if they do not already exist. It does not drop or reset existing data.

## Start the app

In a terminal, run:

```text
cd backend
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000) in a browser. Express serves the frontend and API from the same address.

## API endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/players` | Add a player |
| `GET` | `/api/players` | List all players |
| `GET` | `/api/players/search?name=virat` | Search player names |
| `GET` | `/api/players/:id` | Get one player |
| `PUT` | `/api/players/:id` | Update a player |
| `DELETE` | `/api/players/:id` | Delete a player |

Player request fields are `name`, `age`, `photo_url`, `birthplace`, `career_desc`, `matches`, `centuries`, `wickets`, `fifties`, and `average`. Name is required; optional statistics default to zero.
