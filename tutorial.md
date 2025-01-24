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

## Backend & Frontend Setups

### 1. `cd` into the `ctms` directory (or where the docker-compose.yml is located) and run the following commands

```shell
ctms> docker-compose up -d --build
```

Our whole backend whill be running on [http://localhost:15000](http://localhost:15000). I have edited the code to include the whole frontend, which will be running on [http://localhost:13000](http://localhost:13000),

## NOTE: All error logs will be displayed in the Docker app, under the server container, where

- If there is a backend error, it will be displayed under `postgres-db`

- If there is a frontend error, it will be displayed under `frontend`

- If there is a request (DB query) error, it will be displayed under `backend`

### As long as the `server` image is running, everything is accessible

## How do you test the backend & frontend?

### Backend

Under the `server` directory, you will see a `test.rest` file. You need to install the REST Client extension in Visual Studio Code. Then you can run the tests by clicking on the `Send Request` link, or you can utilize Postman to test the backend

A first, it will not work unless you run the first api call in the `test.rest` file, `GET http://localhost:15000/setup` to get the setup working. You can click send request on the first api call or visit [http://localhost:15000/setup](http://localhost:15000/setup) (Note that we are not actually using port 5000 for the api calls because docker is running the backend, mapped to port 15000 as defined in the `docker-compose.yml` file)

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

### Frontend

Then check your front-end, visit [http://localhost:13000](http://localhost:13000) to see the front-end.

To reset the table, simply visit setup again [http://localhost:15000/setup](http://localhost:15000/setup)

## What area will be used the most during development?

- The `server/routes` directory will be used the most for the backend

- The `client/src` directory will be used the most for the frontend


