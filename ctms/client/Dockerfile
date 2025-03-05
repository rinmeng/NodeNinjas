FROM node:20

WORKDIR /usr/src/app

# Copy package files first
COPY package*.json ./

# Install global Vite CLI
RUN npm install -g vite

# Install project dependencies
RUN npm install

# Copy the rest of the project files
COPY . .

# Expose the port your app runs on
EXPOSE 3000

# Use npm run dev as the command
CMD ["npm", "run", "dev"]