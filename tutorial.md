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

## Backend

### 1. `cd` into the `server` directory and run the following commands

```shell
ctms\server> docker build -t ctms .
ctms\server> docker-compose up
```

This script builds the Dockerfile's image, and composes the image into a backend server. Our whole backend whill be running on [http://localhost:5000](http://localhost:5000)

### Warning: Do not close the terminal window where you ran the `docker-compose up` command. If you do, the backend will stop running, instead, open a new terminal window

## Frontend

### 1. `cd` into the `client` directory and run the following commands

```shell
ctms\client> npm run dev
```

This command runs both the start script (to start react-app for front-end) and the css development stream (real-time css changes with TailwindCSS). Your whole frontend will be running on [http://localhost:3000](http://localhost:3000)

## How do you know what commands run what?

The `package.json` file in the `client` and `server` directories contain the scripts that are run when you run `npm run <script-name>`, some scripts are predefined by npm, and some are custom scripts defined by me to make it easier for us to run the project.

For example, in the `client` directory, you will see the following scripts:

```json
    "css": "npx tailwindcss -i ./src/css/input.css -o ./src/css/output.css --watch",
    "dev": "concurrently \"npm run start\" \"npm run css\""
```

under the `scripts` key was added by me. The `css` script runs the tailwindcss compiler in watch mode, and the `dev` script runs both the start script and the css script concurrently.

And in the `server` directory, you will see the following scripts:

```json
    "start": "node server",
    "dev": "nodemon server"
```

was also added by me. The `start` script runs the server, and the `dev` script runs the server in watch mode using nodemon.

## What is watch mode?

Watch mode is a mode that watches for changes in the files and automatically recompiles the files when changes are detected. This is useful for development because you don't have to manually recompile the files every time you make a change.

## How do you test the backend?

Under the `server` directory, you will see a `test.rest` file. You need to install the REST Client extension in Visual Studio Code. Then you can run the tests by clicking on the `Send Request` link, or you can utilize Postman to test the backend

A first, it will not work unless you run the first api call `GET http://localhost:15000/setup` to get the setup working. You can click send request on the first api call or visit [http://localhost:15000/setup](http://localhost:15000/setup) (Note that we are not actually using port 5000 for the api calls because docker is running the backend, mapped to port 15000 as defined in the `docker-compose.yml` file)

When it is successfull, you will see a json file containing 

```json
{
    "message": "Table created successfully"
}
```

Then you can run the next call `GET http://localhost:15000/` to get the list of all the schools or visit [http://localhost:15000/](http://localhost:15000/). You may encounter an empty array `[]` because there are no schools in the database yet.

Now you can test inserts by running

```json
POST http://localhost:15000/
Content-Type: application/json

{
  "name": "hi",
  "location": "Canada"
}
###
POST http://localhost:15000/
Content-Type: application/json

{
  "id": 2,
  "name": "hello",
  "location": "USA"
}
###
POST http://localhost:15000/
Content-Type: application/json

{
  "id": 3,
  "name": "greetings",
  "location": "Australia"
}
###
```

Now you can run the `GET http://localhost:15000/` again to see the list of schools

Then check your front-end to see the changes (refresh the page).

To reset, simply visit setup again [http://localhost:15000/setup](http://localhost:15000/setup)

## What area will be used the most during development?

Until further notices, we will find a way to organize each "pages" into "routes" so it is easy to manage and navigate
