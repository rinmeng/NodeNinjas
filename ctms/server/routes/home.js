const express = require('express');
const pool = require('../db'); // Database connection
const router = express.Router();
const proxy = "http://localhost:15000"; // Store base URL in a variable

router.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API Documentation</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.0.2/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-900 min-h-screen p-8">
    <div class="max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 class="text-3xl font-bold text-gray-100 mb-6">API Documentation</h1>
        
        <div class="space-y-8">
            <!-- Welcome Section -->
            <div class="bg-gray-700 p-6 rounded-lg">
                <h2 class="text-2xl font-semibold text-blue-300 mb-4">Welcome to the API Documentation</h2>
                <p class="text-gray-200 mb-4">This documentation provides access to all available endpoints. Click on any endpoint below to view its detailed documentation.</p>
            </div>

            <!-- Endpoints Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Setup Endpoint -->
                <a href="${proxy}/setup" class="block p-6 bg-gray-700 border border-gray-600 rounded-lg shadow hover:bg-gray-600 transition duration-300">
                    <h3 class="text-xl font-semibold text-gray-100 mb-2">Setup Endpoint</h3>
                    <p class="text-gray-300">Database setup and initialization</p>
                </a>

                <!-- User Endpoint -->
                <a href="${proxy}/user" class="block p-6 bg-gray-700 border border-gray-600 rounded-lg shadow hover:bg-gray-600 transition duration-300">
                    <h3 class="text-xl font-semibold text-gray-100 mb-2">User Endpoint</h3>
                    <p class="text-gray-300">User management and authentication</p>
                </a>

                <!-- Task Endpoint -->
                <a href="${proxy}/task" class="block p-6 bg-gray-700 border border-gray-600 rounded-lg shadow hover:bg-gray-600 transition duration-300">
                    <h3 class="text-xl font-semibold text-gray-100 mb-2">Task Endpoint</h3>
                    <p class="text-gray-300">Task creation and management</p>
                </a>

                <!-- Notification Endpoint -->
                <a href="${proxy}/notification" class="block p-6 bg-gray-700 border border-gray-600 rounded-lg shadow hover:bg-gray-600 transition duration-300">
                    <h3 class="text-xl font-semibold text-gray-100 mb-2">Notification Endpoint</h3>
                    <p class="text-gray-300">User notifications management</p>
                </a>

                <!-- Message Endpoint -->
                <a href="${proxy}/message" class="block p-6 bg-gray-700 border border-gray-600 rounded-lg shadow hover:bg-gray-600 transition duration-300">
                    <h3 class="text-xl font-semibold text-gray-100 mb-2">Message Endpoint</h3>
                    <p class="text-gray-300">Message handling and task discussions</p>
                </a>

                <!-- AssignedTo Endpoint -->
                <a href="${proxy}/task" class="block p-6 bg-gray-700 border border-gray-600 rounded-lg shadow hover:bg-gray-600 transition duration-300">
                    <h3 class="text-xl font-semibold text-gray-100 mb-2">AssignedTo Endpoint</h3>
                    <p class="text-gray-300">Is hosted under the Task Endpoint</p>
                </a>
            </div>

            <!-- Additional Info -->
            <div class="bg-gray-700 p-6 rounded-lg mt-8">
                <h2 class="text-xl font-semibold text-yellow-300 mb-2">Getting Started</h2>
                <p class="text-gray-200">The API is hosted at <code class="bg-gray-600 px-2 py-1 rounded">${proxy}</code></p>
                <p class="text-gray-200 mt-2">Click on any endpoint above to view its detailed documentation and available routes.</p>
            </div>
        </div>
    </div>
</body>
</html>`);

});

module.exports = router;
