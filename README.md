# NodeNinjas

## Stack used: PERN (PostgreSQL, Express, React, Node.js)

### Build tool for React: Vite.js, most common libraries used: TailwindCSS, shadcn/ui, socket.io (for real-time messaging)

## Current status of the project:

- All functional requirements met (95%)

- All non-functional requirements met (95%)

- All technical requirements met (95%)

- 5% from each requirements are to be met in the future, we are covering minor edge cases, bug fixes (visual/backend) and code refactoring.

## Known Bugs
- Typing UI is not displaying when a user types on the Chat feature.
  
The typing indicator UI is not displaying when a user begins typing in the chat input field  The issue was observed while testing commit #232. Normally when a user types, the UI should show a typing indicator to signal activity, but currently there is no visual feedback. This affects the features of frontend components, specifically the typing status handling. The absence of the indicator can impact user experience. The issue is considered moderate in severity, as it does not block functionally but affects usability.

- Register feature isn’t working when a team member submits the registration form.
- When you have all read notifications, if you toggle them to unread they will be listed at the bottom instead of going to the top
- Admin’s with no tasks or users in their team shouldn’t have an Admin Page. 

## How to login?

- You can login using the following credentials:

  - Username & Password: `rin`

  - To test the real-time messaging feature, you can login using the following credentials (in a different browser eg, one on google chrome, one on edge, or incognito mode):

    - Username & Password: `arnold`

## How to run the project?

- Visit the [tutorial](tutorial.md) for more information.

- Or pull the [Docker Image](https://hub.docker.com/r/rinmeng/nodeninjas-ctms/tags) from Docker Hub and run it locally with the [`docker-compose.yml`](./ctms/docker-compose.yml) file.

- Test Coverage
  ![Test Coverage](Test%20coverage%20reports.png)
