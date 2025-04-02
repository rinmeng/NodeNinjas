# Commands used to setup Project 2: Collaborative Task Management System (CTMS)

## How to set up the project (assuming you are in ctms directory)

## Prerequisites

- Clone the repository
- Install Docker
- Install Node.js
- Install npm
- Install Visual Studio Code

### Install Dependencies (all node libraries/modules) on the frontend and backend

```shell
ctms> cd server
ctms\server> npm install
ctms\server> cd ..
ctms> cd client
ctms\client> npm install
```

There might be an error due to `react-day-picker` package being outdated. If you encounter this error, run the following command:

```shell
ctms\client> npm install react-day-picker@latest
```

If there are errors like peer-deps issues, please run `npm install --force` in the location that caused it (most likely `client`).

## Backend & Frontend Setups

### 1. `cd` into the `ctms` directory (or where the docker-compose.yml is located) and run the following commands

```shell
ctms> docker-compose up -d --build
```

This command will build the images and start the containers in the background, and you can access the frontend at `http://localhost:13000` and the backend at `http://localhost:15000`.

If you are on WindowsOS, live changes like HMR from Vite may not work. you'd have to run `npm run dev` in the client directory.

## To setup the database

Visit `http://localhost:15000` and click on "Setup Endpoint", this will forward you to `http://localhost:15000/setup`. Or you create/initialize the database by visiting the link itself.
