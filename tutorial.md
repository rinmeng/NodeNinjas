# Commands used to setup Project 2: Collaborative Task Management System (CTMS)

## How to set up the project (assuming you are in ctms directory)

## Prerequisites

- Clone the repository
- Install Docker
- Install Node.js
- Install npm
- Install Visual Studio Code

### Install Dependencies (all node libraries/modules) on the frontend and backend

```bash
current directory: ctms
ctms> cd server
ctms\server> npm install
ctms\server> cd ..
ctms> cd client
ctms\client> npm install
```

## Backend

### 1. `cd` into the `server` directory and run the following commands

```bash
ctms\server> docker build -t ctms .
ctms\server> docker-compose up
```

Now your whole backend is running on [localhost:5000](http://localhost:5000)

### Warning: Do not close the terminal window where you ran the `docker-compose up` command. If you do, the backend will stop running, instead, open a new terminal window

## Frontend

### 1. `cd` into the `client` directory and run the following commands

```bash
ctms\client> npm run dev
```

Now your whole frontend is running on [localhost:3000](http://localhost:3000)

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

```rest
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
