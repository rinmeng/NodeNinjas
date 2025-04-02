# NodeNinjas

## Stack used: PERN (PostgreSQL, Express, React, Node.js)

### Build tool for React: Vite.js, most common libraries used: TailwindCSS, shadcn/ui, socket.io (for real-time messaging)

## Current status of the project:

- All functional requirements met (100%)

- All non-functional requirements met (100%)

- All technical requirements met (100%)

## How to login?

- You can login using the following credentials:

  - Username & Password: `rin`

  - To test the real-time messaging feature, you can login using the following credentials (in a different browser eg, one on google chrome, one on edge, or incognito mode):

    - Username & Password: `arnold`

## How to run the project?

- Visit the [tutorial](tutorial.md) for more information.

- Or pull the [Docker Image](https://hub.docker.com/r/rinmeng/nodeninjas-ctms/tags) from Docker Hub and run it locally with the [`docker-compose.yml`](./ctms/docker-compose.yml) file.

## Test Coverage

![coverage](mar28coverage.png)

### Note that we can't really test the socket.io functionality, so we are not testing the real-time messaging feature, also setup.js is not being tested because that is the beggining of the app and we are not testing the beginning of the app, we are testing the functionality of the app.

### Test Coverage Report Summary

Statements: 81.79%

Branches: 83.99%

Functions: 100%

Lines: 82.09%

Test Suites: 6 passed, 6 total

Tests: 91 passed, 91 total
