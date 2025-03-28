import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

const Docs = () => {
  const [activeTab, setActiveTab] = useState("message");

  return (
    <div className="container py-24 mx-auto">
      <h1 className="mb-8 text-4xl font-bold tracking-tight">
        API Documentation
      </h1>

      <Tabs
        defaultValue="message"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="message">Messages</TabsTrigger>
          <TabsTrigger value="task">Tasks</TabsTrigger>
          <TabsTrigger value="notification">Notifications</TabsTrigger>
          <TabsTrigger value="user">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="message" className="mt-6 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Message API</CardTitle>
              <CardDescription>
                API endpoints for sending and retrieving messages between users
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            {/* POST /message */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">
                    <Badge variant="outline" className="mr-2 font-mono">
                      POST
                    </Badge>
                    /message
                  </CardTitle>
                </div>
                <CardDescription>
                  Send a message from one user to another
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="mb-2 font-medium">Request Body:</h4>
                  <pre className="p-3 overflow-x-auto font-mono text-sm rounded-md bg-muted">
                    {`{
  "sender_id": number,     // Required - User ID of sender
  "recipient_id": number,  // Required - User ID of recipient
  "text": string           // Required - Message content
}`}
                  </pre>
                </div>
                <div>
                  <h4 className="mb-2 font-medium">Response:</h4>
                  <pre className="p-3 overflow-x-auto font-mono text-sm rounded-md bg-muted">
                    {`{
  "id": number,
  "sender_id": number,
  "recipient_id": number,
  "task_id": number|null,
  "text": string,
  "sent_at": timestamp
}`}
                  </pre>
                </div>
                <div>
                  <h4 className="mb-2 font-medium">Notes:</h4>
                  <ul className="ml-6 list-disc">
                    <li>
                      Triggers real-time WebSocket notifications for both sender
                      and recipient
                    </li>
                    <li>
                      Message timestamp is automatically set by the server
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* GET /message/:sender_id/:recipient_id */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">
                    <Badge variant="outline" className="mr-2 font-mono">
                      GET
                    </Badge>
                    /message/:sender_id/:recipient_id
                  </CardTitle>
                </div>
                <CardDescription>
                  Retrieve conversation history between two users
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="mb-2 font-medium">Parameters:</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-mono">sender_id</TableCell>
                        <TableCell>number</TableCell>
                        <TableCell>First user ID</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-mono">
                          recipient_id
                        </TableCell>
                        <TableCell>number</TableCell>
                        <TableCell>Second user ID</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                <div>
                  <h4 className="mb-2 font-medium">Response:</h4>
                  <pre className="p-3 overflow-x-auto font-mono text-sm rounded-md bg-muted">
                    {`[
  {
    "id": number,
    "sender_id": number,
    "recipient_id": number,
    "task_id": number|null,
    "text": string,
    "sent_at": timestamp
  }
]`}
                  </pre>
                </div>
                <div>
                  <h4 className="mb-2 font-medium">Notes:</h4>
                  <ul className="ml-6 list-disc">
                    <li>
                      Returns messages in both directions between the specified
                      users
                    </li>
                    <li>Results are ordered chronologically (oldest first)</li>
                    <li>Returns an empty array if no messages exist</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="error-handling">
                <AccordionTrigger>Error Handling</AccordionTrigger>
                <AccordionContent>
                  <div className="p-4 rounded-md bg-muted/50">
                    <h3 className="mb-3 text-lg font-medium">
                      Error Responses
                    </h3>
                    <div className="space-y-2">
                      <p>
                        <strong>400:</strong> Bad request (missing required
                        fields)
                      </p>
                      <p>
                        <strong>500:</strong> Internal server error
                      </p>
                    </div>
                    <div className="mt-4">
                      <h4 className="mb-2 font-medium">
                        Common Error Messages:
                      </h4>
                      <ul className="ml-6 list-disc">
                        <li>"All fields are required."</li>
                        <li>"Failed to send message."</li>
                        <li>"Failed to retrieve messages."</li>
                      </ul>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="websocket-events">
                <AccordionTrigger>WebSocket Events</AccordionTrigger>
                <AccordionContent>
                  <div className="p-4 rounded-md bg-muted/50">
                    <h3 className="mb-3 text-lg font-medium">
                      WebSocket Events
                    </h3>
                    <div>
                      <h4 className="font-medium">refetchMessages</h4>
                      <p className="mt-1">
                        Emitted when a new message is created. The client should
                        use this event to refresh its message list.
                      </p>
                      <pre className="p-3 mt-2 overflow-x-auto font-mono text-sm rounded-md bg-muted">
                        {`{
  "conversationId": string,  // Format: "userId-partnerId"
  "partnerId": number        // The user ID of the other conversation participant
}`}
                      </pre>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="database-schema">
                <AccordionTrigger>Database Schema</AccordionTrigger>
                <AccordionContent>
                  <div className="p-4 rounded-md bg-muted/50">
                    <h3 className="mb-3 text-lg font-medium">
                      Messages Schema
                    </h3>
                    <pre className="p-3 overflow-x-auto font-mono text-sm rounded-md bg-muted">
                      {`DROP TABLE IF EXISTS messages CASCADE;
CREATE TABLE messages (
    id SERIAL PRIMARY KEY, -- Unique message ID
    sender_id INT NOT NULL,
    recipient_id INT,
    task_id INT,
    text TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (sender_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_id) REFERENCES users (id) ON DELETE SET NULL,
    FOREIGN KEY (task_id) REFERENCES task (id) ON DELETE SET NULL
);

-- Indexes for faster lookups
CREATE INDEX idx_messages_sender_id ON messages (sender_id);
CREATE INDEX idx_messages_recipient_id ON messages (recipient_id);
CREATE INDEX idx_messages_task_id ON messages (task_id);`}
                    </pre>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </TabsContent>

        <TabsContent value="task" className="mt-6 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Task API</CardTitle>
              <CardDescription>
                API endpoints for managing tasks and task assignments
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            {/* GET /task/all */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">
                    <Badge variant="outline" className="mr-2 font-mono">
                      GET
                    </Badge>
                    /task/all
                  </CardTitle>
                </div>
                <CardDescription>
                  Fetch all tasks from the database
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="mb-2 font-medium">Authentication:</h4>
                  <Badge variant="secondary">
                    User Authentication Required
                  </Badge>
                </div>
                <div>
                  <h4 className="mb-2 font-medium">Response:</h4>
                  <pre className="p-3 overflow-x-auto font-mono text-sm rounded-md bg-muted">
                    {`[
  {
    "id": number,
    "name": string,
    "date": date,
    "description": string,
    "status": string,
    "priority": string,
    "owner_id": number
  }
]`}
                  </pre>
                </div>
              </CardContent>
            </Card>

            {/* POST /task/add */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">
                    <Badge variant="outline" className="mr-2 font-mono">
                      POST
                    </Badge>
                    /task/add
                  </CardTitle>
                </div>
                <CardDescription>
                  Create a new task and assign it to an owner
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="mb-2 font-medium">Authentication:</h4>
                  <Badge variant="secondary">
                    User Authentication Required
                  </Badge>
                </div>
                <div>
                  <h4 className="mb-2 font-medium">Request Body:</h4>
                  <pre className="p-3 overflow-x-auto font-mono text-sm rounded-md bg-muted">
                    {`{
  "name": string,         // Required - Task name
  "date": date,           // Required - Due date
  "description": string,  // Optional - Task description
  "status": string,       // Required - Default: "pending"
  "priority": string,     // Required - Default: "medium"
  "owner_id": number      // Required - User ID of task owner
}`}
                  </pre>
                </div>
                <div>
                  <h4 className="mb-2 font-medium">Response:</h4>
                  <pre className="p-3 overflow-x-auto font-mono text-sm rounded-md bg-muted">
                    {`{
  "id": number,
  "name": string,
  "date": date,
  "description": string,
  "status": string, 
  "priority": string,
  "owner_id": number
}`}
                  </pre>
                </div>
                <div>
                  <h4 className="mb-2 font-medium">Notes:</h4>
                  <ul className="ml-6 list-disc">
                    <li>Task name and description must be unique</li>
                    <li>The task is automatically assigned to the owner</li>
                    <li>
                      Uses database transaction to ensure both task creation and
                      assignment succeed
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* DELETE /task/delete/:id */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">
                    <Badge variant="outline" className="mr-2 font-mono">
                      DELETE
                    </Badge>
                    /task/delete/:id
                  </CardTitle>
                </div>
                <CardDescription>Delete a task by ID</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="mb-2 font-medium">Authentication:</h4>
                  <Badge variant="secondary">
                    User Authentication Required
                  </Badge>
                </div>
                <div>
                  <h4 className="mb-2 font-medium">Request Body:</h4>
                  <pre className="p-3 overflow-x-auto font-mono text-sm rounded-md bg-muted">
                    {`{
  "id": number           // Required - Task ID to delete
}`}
                  </pre>
                </div>
                <div>
                  <h4 className="mb-2 font-medium">Response:</h4>
                  <pre className="p-3 overflow-x-auto font-mono text-sm rounded-md bg-muted">
                    {`{
  "message": "Task deleted successfully"
}`}
                  </pre>
                </div>
                <div>
                  <h4 className="mb-2 font-medium">Notes:</h4>
                  <ul className="ml-6 list-disc">
                    <li>
                      Uses a transaction to first delete all task assignments,
                      then the task itself
                    </li>
                    <li>Returns 404 if the task does not exist</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* PUT /task/update/:id */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">
                    <Badge variant="outline" className="mr-2 font-mono">
                      PUT
                    </Badge>
                    /task/update/:id
                  </CardTitle>
                </div>
                <CardDescription>Update a task's details by ID</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="mb-2 font-medium">Authentication:</h4>
                  <Badge variant="secondary">
                    User Authentication Required
                  </Badge>
                </div>
                <div>
                  <h4 className="mb-2 font-medium">Request Body:</h4>
                  <pre className="p-3 overflow-x-auto font-mono text-sm rounded-md bg-muted">
                    {`{
  "id": number,          // Required - Task ID to update
  "name": string,        // Required - Updated task name
  "date": date,          // Required - Updated due date
  "description": string, // Required - Updated description
  "status": string,      // Required - Updated status
  "priority": string     // Required - Updated priority
}`}
                  </pre>
                </div>
                <div>
                  <h4 className="mb-2 font-medium">Response:</h4>
                  <pre className="p-3 overflow-x-auto font-mono text-sm rounded-md bg-muted">
                    {`{
  "id": number,
  "name": string,
  "date": date,
  "description": string,
  "status": string,
  "priority": string,
  "owner_id": number
}`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="additional-endpoints">
                <AccordionTrigger>Additional Endpoints</AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* GET /task/id/:id */}
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">
                            <Badge variant="outline" className="mr-2 font-mono">
                              GET
                            </Badge>
                            /task/id/:id
                          </CardTitle>
                        </div>
                        <CardDescription className="text-xs">
                          Fetch a specific task with all assigned users
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div>
                          <h4 className="mb-1 text-sm font-medium">
                            Authentication:
                          </h4>
                          <Badge variant="secondary" className="text-xs">
                            User Authentication Required
                          </Badge>
                        </div>
                        <div>
                          <h4 className="mb-1 text-sm font-medium">
                            Parameters:
                          </h4>
                          <p className="text-xs">
                            <code className="px-1 font-mono rounded bg-muted">
                              id
                            </code>{" "}
                            - Task ID (number)
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* GET /task/assignedto/user/:id */}
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">
                            <Badge variant="outline" className="mr-2 font-mono">
                              GET
                            </Badge>
                            /task/assignedto/user/:id
                          </CardTitle>
                        </div>
                        <CardDescription className="text-xs">
                          Fetch all tasks assigned to a specific user
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div>
                          <h4 className="mb-1 text-sm font-medium">
                            Authentication:
                          </h4>
                          <Badge variant="secondary" className="text-xs">
                            User Authentication Required
                          </Badge>
                        </div>
                        <div>
                          <h4 className="mb-1 text-sm font-medium">
                            Parameters:
                          </h4>
                          <p className="text-xs">
                            <code className="px-1 font-mono rounded bg-muted">
                              id
                            </code>{" "}
                            - User ID (number)
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* POST /task/assign/:id */}
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">
                            <Badge variant="outline" className="mr-2 font-mono">
                              POST
                            </Badge>
                            /task/assign/:id
                          </CardTitle>
                        </div>
                        <CardDescription className="text-xs">
                          Assign a task to a user
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div>
                          <h4 className="mb-1 text-sm font-medium">
                            Authentication:
                          </h4>
                          <Badge variant="secondary" className="text-xs">
                            Admin Authentication Required
                          </Badge>
                        </div>
                        <div>
                          <h4 className="mb-1 text-sm font-medium">
                            Parameters:
                          </h4>
                          <p className="text-xs">
                            <code className="px-1 font-mono rounded bg-muted">
                              id
                            </code>{" "}
                            - Task ID (number)
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* DELETE /task/unassign/:id */}
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">
                            <Badge variant="outline" className="mr-2 font-mono">
                              DELETE
                            </Badge>
                            /task/unassign/:id
                          </CardTitle>
                        </div>
                        <CardDescription className="text-xs">
                          Unassign a task from a user
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div>
                          <h4 className="mb-1 text-sm font-medium">
                            Authentication:
                          </h4>
                          <Badge variant="secondary" className="text-xs">
                            Admin Authentication Required
                          </Badge>
                        </div>
                        <div>
                          <h4 className="mb-1 text-sm font-medium">
                            Parameters:
                          </h4>
                          <p className="text-xs">
                            <code className="px-1 font-mono rounded bg-muted">
                              id
                            </code>{" "}
                            - Task ID (number)
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="error-handling-task">
                <AccordionTrigger>Error Handling</AccordionTrigger>
                <AccordionContent>
                  <div className="p-4 rounded-md bg-muted/50">
                    <h3 className="mb-3 text-lg font-medium">
                      Error Responses
                    </h3>
                    <div className="space-y-2">
                      <p>
                        <strong>400:</strong> Bad request (missing required
                        fields)
                      </p>
                      <p>
                        <strong>401:</strong> Unauthorized (authentication
                        required)
                      </p>
                      <p>
                        <strong>404:</strong> Resource not found
                      </p>
                      <p>
                        <strong>500:</strong> Internal server error
                      </p>
                    </div>
                    <div className="mt-4">
                      <h4 className="mb-2 font-medium">
                        Common Error Messages:
                      </h4>
                      <ul className="ml-6 list-disc">
                        <li>"Missing required fields"</li>
                        <li>"Task name already exists"</li>
                        <li>"Task description already exists"</li>
                        <li>"Task ID is required"</li>
                        <li>"Task not found"</li>
                        <li>"Failed to create task"</li>
                        <li>"Failed to update task"</li>
                        <li>"Failed to delete task"</li>
                      </ul>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="database-schema-task">
                <AccordionTrigger>Database Schema</AccordionTrigger>
                <AccordionContent>
                  <div className="p-4 rounded-md bg-muted/50">
                    <h3 className="mb-3 text-lg font-medium">
                      Task Tables Schema
                    </h3>
                    <pre className="p-3 overflow-x-auto font-mono text-sm rounded-md bg-muted">
                      {`-- Tasks table
CREATE TABLE task (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    date DATE NOT NULL,
    description TEXT UNIQUE,
    status VARCHAR(50) DEFAULT 'pending',
    priority VARCHAR(50) DEFAULT 'medium',
    owner_id INT,
    FOREIGN KEY (owner_id) REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Task assignments table
CREATE TABLE assignedto (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    task_id INT NOT NULL,
    assigned_date DATE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (task_id) REFERENCES task(id),
    UNIQUE(user_id, task_id)
);

-- Indexes for faster lookups
CREATE INDEX idx_task_owner ON task(owner_id);
CREATE INDEX idx_task_status ON task(status);
CREATE INDEX idx_task_priority ON task(priority);
CREATE INDEX idx_assignedto_user ON assignedto(user_id);
CREATE INDEX idx_assignedto_task ON assignedto(task_id);`}
                    </pre>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </TabsContent>

        <TabsContent value="notification" className="mt-6 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Notification API</CardTitle>
              <CardDescription>
                API endpoints for managing user notifications
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            {/* POST /notification/add/:ids */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">
                    <Badge variant="outline" className="mr-2 font-mono">
                      POST
                    </Badge>
                    /notification/add/:ids
                  </CardTitle>
                </div>
                <CardDescription>
                  Creates new notifications for multiple users at once
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="mb-2 font-medium">Authentication:</h4>
                  <Badge variant="secondary">
                    User Authentication Required
                  </Badge>
                </div>
                <div>
                  <h4 className="mb-2 font-medium">Request Body:</h4>
                  <pre className="p-3 overflow-x-auto font-mono text-sm rounded-md bg-muted">
                    {`{
  "message": string,       // Required - Notification message
  "user_ids": number[],    // Required - Array of user IDs to notify
  "type": string           // Required - Notification type
}`}
                  </pre>
                </div>
                <div>
                  <h4 className="mb-2 font-medium">Response:</h4>
                  <pre className="p-3 overflow-x-auto font-mono text-sm rounded-md bg-muted">
                    {`{
  "message": "Notification added successfully"
}`}
                  </pre>
                </div>
                <div>
                  <h4 className="mb-2 font-medium">Notes:</h4>
                  <ul className="ml-6 list-disc">
                    <li>
                      Uses PostgreSQL's unnest function to efficiently create
                      multiple notifications
                    </li>
                    <li>
                      All notifications are created with 'unread' status by
                      default
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* GET /notification/get/all/:user_id */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">
                    <Badge variant="outline" className="mr-2 font-mono">
                      GET
                    </Badge>
                    /notification/get/all/:user_id
                  </CardTitle>
                </div>
                <CardDescription>
                  Retrieves all notifications for a specific user
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="mb-2 font-medium">Authentication:</h4>
                  <Badge variant="secondary">
                    User Authentication Required
                  </Badge>
                </div>
                <div>
                  <h4 className="mb-2 font-medium">Parameters:</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-mono">user_id</TableCell>
                        <TableCell>number</TableCell>
                        <TableCell>
                          User ID to fetch notifications for
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                <div>
                  <h4 className="mb-2 font-medium">Response:</h4>
                  <pre className="p-3 overflow-x-auto font-mono text-sm rounded-md bg-muted">
                    {`[
  {
    "id": number,
    "message": string,
    "user_id": number,
    "type": string,
    "status": string,
    "created_at": timestamp
  }
]`}
                  </pre>
                </div>
                <div>
                  <h4 className="mb-2 font-medium">Notes:</h4>
                  <ul className="ml-6 list-disc">
                    <li>
                      Notifications are ordered by creation date (newest first)
                    </li>
                    <li>Returns an empty array if no notifications exist</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* PUT /notification/read/:id */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">
                    <Badge variant="outline" className="mr-2 font-mono">
                      PUT
                    </Badge>
                    /notification/read/:id
                  </CardTitle>
                </div>
                <CardDescription>Marks a notification as read</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="mb-2 font-medium">Authentication:</h4>
                  <Badge variant="secondary">
                    User Authentication Required
                  </Badge>
                </div>
                <div>
                  <h4 className="mb-2 font-medium">Parameters:</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-mono">id</TableCell>
                        <TableCell>number</TableCell>
                        <TableCell>Notification ID to mark as read</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                <div>
                  <h4 className="mb-2 font-medium">Response:</h4>
                  <pre className="p-3 overflow-x-auto font-mono text-sm rounded-md bg-muted">
                    {`{
  "id": number,
  "message": string,
  "user_id": number,
  "type": string,
  "status": "read",
  "created_at": timestamp
}`}
                  </pre>
                </div>
              </CardContent>
            </Card>

            {/* PUT /notification/unread/:id */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">
                    <Badge variant="outline" className="mr-2 font-mono">
                      PUT
                    </Badge>
                    /notification/unread/:id
                  </CardTitle>
                </div>
                <CardDescription>
                  Marks a notification as unread
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="mb-2 font-medium">Authentication:</h4>
                  <Badge variant="secondary">
                    User Authentication Required
                  </Badge>
                </div>
                <div>
                  <h4 className="mb-2 font-medium">Parameters:</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-mono">id</TableCell>
                        <TableCell>number</TableCell>
                        <TableCell>Notification ID to mark as unread</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                <div>
                  <h4 className="mb-2 font-medium">Response:</h4>
                  <pre className="p-3 overflow-x-auto font-mono text-sm rounded-md bg-muted">
                    {`{
  "id": number,
  "message": string,
  "user_id": number,
  "type": string,
  "status": "unread",
  "created_at": timestamp
}`}
                  </pre>
                </div>
              </CardContent>
            </Card>

            {/* DELETE /notification/delete/:id */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">
                    <Badge variant="outline" className="mr-2 font-mono">
                      DELETE
                    </Badge>
                    /notification/delete/:id
                  </CardTitle>
                </div>
                <CardDescription>
                  Deletes a notification by its ID
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="mb-2 font-medium">Authentication:</h4>
                  <Badge variant="secondary">
                    User Authentication Required
                  </Badge>
                </div>
                <div>
                  <h4 className="mb-2 font-medium">Parameters:</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-mono">id</TableCell>
                        <TableCell>number</TableCell>
                        <TableCell>Notification ID to delete</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                <div>
                  <h4 className="mb-2 font-medium">Response:</h4>
                  <pre className="p-3 overflow-x-auto font-mono text-sm rounded-md bg-muted">
                    {`{
  "id": number,
  "message": string,
  "user_id": number,
  "type": string,
  "status": string,
  "created_at": timestamp
}`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="notification-types">
                <AccordionTrigger>Notification Types</AccordionTrigger>
                <AccordionContent>
                  <div className="p-4 rounded-md bg-muted/50">
                    <h3 className="mb-3 text-lg font-medium">
                      Available Notification Types
                    </h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Description</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-mono">message</TableCell>
                          <TableCell>New message notification</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-mono">
                            task_assignment
                          </TableCell>
                          <TableCell>
                            User has been assigned to a task
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-mono">
                            task_unassignment
                          </TableCell>
                          <TableCell>
                            User has been unassigned from a task
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-mono">
                            task_update
                          </TableCell>
                          <TableCell>A task has been updated</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-mono">alert</TableCell>
                          <TableCell>General system alert</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="error-handling-notification">
                <AccordionTrigger>Error Handling</AccordionTrigger>
                <AccordionContent>
                  <div className="p-4 rounded-md bg-muted/50">
                    <h3 className="mb-3 text-lg font-medium">
                      Error Responses
                    </h3>
                    <div className="space-y-2">
                      <p>
                        <strong>400:</strong> Bad request (missing required
                        fields)
                      </p>
                      <p>
                        <strong>401:</strong> Unauthorized access (not
                        authenticated)
                      </p>
                      <p>
                        <strong>404:</strong> Resource not found
                      </p>
                      <p>
                        <strong>500:</strong> Internal server error
                      </p>
                    </div>
                    <div className="mt-4">
                      <h4 className="mb-2 font-medium">
                        Common Error Messages:
                      </h4>
                      <ul className="ml-6 list-disc">
                        <li>"Please enter all required fields"</li>
                        <li>"Notification not found"</li>
                        <li>"Failed to add notification"</li>
                        <li>"Failed to fetch notifications"</li>
                        <li>"Failed to update notification"</li>
                        <li>"Failed to delete notification"</li>
                      </ul>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="database-schema-notification">
                <AccordionTrigger>Database Schema</AccordionTrigger>
                <AccordionContent>
                  <div className="p-4 rounded-md bg-muted/50">
                    <h3 className="mb-3 text-lg font-medium">
                      Notification Schema
                    </h3>
                    <pre className="p-3 overflow-x-auto font-mono text-sm rounded-md bg-muted">
                      {`DROP TABLE IF EXISTS notifications CASCADE;
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN 
    ('message', 'task_assignment', 'alert', 'task_update', 'task_unassignment')),
    status VARCHAR(20) DEFAULT 'unread' CHECK (status IN ('unread', 'read')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
-- Indexes for better performance
CREATE INDEX idx_notifications_user_id ON notifications (user_id);
CREATE INDEX idx_notifications_status ON notifications (user_id, status);`}
                    </pre>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </TabsContent>

        <TabsContent value="user" className="mt-6 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>User API</CardTitle>
              <CardDescription>
                API endpoints for managing users and authentication
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            {/* GET /user/all */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">
                    <Badge variant="outline" className="mr-2 font-mono">
                      GET
                    </Badge>
                    /user/all
                  </CardTitle>
                </div>
                <CardDescription>
                  Retrieves all users from the database
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="mb-2 font-medium">Authentication:</h4>
                  <Badge variant="destructive">
                    Admin Authentication Required
                  </Badge>
                </div>
                <div>
                  <h4 className="mb-2 font-medium">Response:</h4>
                  <pre className="p-3 overflow-x-auto font-mono text-sm rounded-md bg-muted">
                    {`[
  {
    "id": number,
    "username": string,
    "role": string,
    "display_name": string,
    "manager_id": number
  }
]`}
                  </pre>
                </div>
              </CardContent>
            </Card>

            {/* GET /user/userid/:id */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">
                    <Badge variant="outline" className="mr-2 font-mono">
                      GET
                    </Badge>
                    /user/userid/:id
                  </CardTitle>
                </div>
                <CardDescription>Retrieves a user by their ID</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="mb-2 font-medium">Authentication:</h4>
                  <Badge variant="secondary">
                    User Authentication Required
                  </Badge>
                </div>
                <div>
                  <h4 className="mb-2 font-medium">Parameters:</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-mono">id</TableCell>
                        <TableCell>number</TableCell>
                        <TableCell>User ID to retrieve</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                <div>
                  <h4 className="mb-2 font-medium">Response:</h4>
                  <pre className="p-3 overflow-x-auto font-mono text-sm rounded-md bg-muted">
                    {`{
  "id": number,
  "username": string,
  "email": string,
  "role": string,
  "display_name": string,
  "manager_id": number
}`}
                  </pre>
                </div>
              </CardContent>
            </Card>

            {/* POST /user/register */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">
                    <Badge variant="outline" className="mr-2 font-mono">
                      POST
                    </Badge>
                    /user/register
                  </CardTitle>
                </div>
                <CardDescription>
                  Registers a new user in the database
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="mb-2 font-medium">Request Body:</h4>
                  <pre className="p-3 overflow-x-auto font-mono text-sm rounded-md bg-muted">
                    {`{
  "username": string,     // Required - User's unique username
  "email": string,        // Required - User's email address
  "password_hash": string, // Required - User's password
  "role": string,         // Required - Either "admin" or "team_member"
  "display_name": string, // Required - User's display name
  "manager_id": number    // Optional - ID of user's manager
}`}
                  </pre>
                </div>
                <div>
                  <h4 className="mb-2 font-medium">Response:</h4>
                  <pre className="p-3 overflow-x-auto font-mono text-sm rounded-md bg-muted">
                    {`{
  "message": "User registered successfully"
}`}
                  </pre>
                </div>
                <div>
                  <h4 className="mb-2 font-medium">Notes:</h4>
                  <ul className="ml-6 list-disc">
                    <li>Username and email must be unique</li>
                    <li>Password is automatically hashed before storing</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* POST /user/login */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">
                    <Badge variant="outline" className="mr-2 font-mono">
                      POST
                    </Badge>
                    /user/login
                  </CardTitle>
                </div>
                <CardDescription>
                  Authenticates a user and creates a session
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="mb-2 font-medium">Request Body:</h4>
                  <pre className="p-3 overflow-x-auto font-mono text-sm rounded-md bg-muted">
                    {`{
  "username": string,      // Required - User's username
  "password_hash": string, // Required - User's password
  "isRemembered": boolean  // Optional - Extend session duration
}`}
                  </pre>
                </div>
                <div>
                  <h4 className="mb-2 font-medium">Response:</h4>
                  <pre className="p-3 overflow-x-auto font-mono text-sm rounded-md bg-muted">
                    {`{
  "message": "Login successful",
  "session": {
    "user": {
      "id": number,
      "username": string,
      "role": string,
      "display_name": string,
      "manager_id": number
    },
    "maxAge": number
  }
}`}
                  </pre>
                </div>
                <div>
                  <h4 className="mb-2 font-medium">Notes:</h4>
                  <ul className="ml-6 list-disc">
                    <li>
                      Session expires in 30 days if{" "}
                      <code className="px-1 font-mono rounded bg-muted">
                        isRemembered
                      </code>{" "}
                      is true
                    </li>
                    <li>
                      Session expires in 1 hour if{" "}
                      <code className="px-1 font-mono rounded bg-muted">
                        isRemembered
                      </code>{" "}
                      is false
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* POST /user/logout */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">
                    <Badge variant="outline" className="mr-2 font-mono">
                      POST
                    </Badge>
                    /user/logout
                  </CardTitle>
                </div>
                <CardDescription>
                  Destroys the current user session
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="mb-2 font-medium">Response:</h4>
                  <pre className="p-3 overflow-x-auto font-mono text-sm rounded-md bg-muted">
                    {`{
  "message": "Logout successful"
}`}
                  </pre>
                </div>
                <div>
                  <h4 className="mb-2 font-medium">Notes:</h4>
                  <ul className="ml-6 list-disc">
                    <li>Clears session cookie from browser</li>
                    <li>Returns 400 if no active session exists</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* GET /user/session */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">
                    <Badge variant="outline" className="mr-2 font-mono">
                      GET
                    </Badge>
                    /user/session
                  </CardTitle>
                </div>
                <CardDescription>
                  Retrieves current session information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="mb-2 font-medium">
                    Response (Active Session):
                  </h4>
                  <pre className="p-3 overflow-x-auto font-mono text-sm rounded-md bg-muted">
                    {`{
  "isValid": true,
  "expiresIn": number,
  "user": {
    "id": number,
    "username": string,
    "role": string,
    "display_name": string,
    "manager_id": number
  }
}`}
                  </pre>
                </div>
                <div>
                  <h4 className="mb-2 font-medium">Response (No Session):</h4>
                  <pre className="p-3 overflow-x-auto font-mono text-sm rounded-md bg-muted">
                    {`{
  "message": "No active session"
}`}
                  </pre>
                </div>
              </CardContent>
            </Card>

            {/* GET /user/isAdmin/:username */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">
                    <Badge variant="outline" className="mr-2 font-mono">
                      GET
                    </Badge>
                    /user/isAdmin/:username
                  </CardTitle>
                </div>
                <CardDescription>
                  Checks if the specified user has admin privileges
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="mb-2 font-medium">Parameters:</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-mono">username</TableCell>
                        <TableCell>string</TableCell>
                        <TableCell>The username to check</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                <div>
                  <h4 className="mb-2 font-medium">Response:</h4>
                  <pre className="p-3 overflow-x-auto font-mono text-sm rounded-md bg-muted">
                    {`{
  "isAdmin": true | false
}`}
                  </pre>
                </div>
                <div>
                  <h4 className="mb-2 font-medium">Example:</h4>
                  <pre className="p-3 overflow-x-auto font-mono text-sm rounded-md bg-muted">
                    GET /user/isAdmin/johndoe
                  </pre>
                  <h4 className="mt-3 mb-2 font-medium">Example Response:</h4>
                  <pre className="p-3 overflow-x-auto font-mono text-sm rounded-md bg-muted">
                    {`{
  "isAdmin": true
}`}
                  </pre>
                </div>
                <div>
                  <h4 className="mb-2 font-medium">Status Codes:</h4>
                  <ul className="ml-6 list-disc">
                    <li>
                      <strong>200:</strong> Success - Returns admin status
                    </li>
                    <li>
                      <strong>404:</strong> User not found
                    </li>
                    <li>
                      <strong>500:</strong> Server error
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="additional-endpoints">
                <AccordionTrigger>Additional Endpoints</AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* GET /user/username/:username */}
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">
                            <Badge variant="outline" className="mr-2 font-mono">
                              GET
                            </Badge>
                            /user/username/:username
                          </CardTitle>
                        </div>
                        <CardDescription className="text-xs">
                          Retrieves a user by their username
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div>
                          <h4 className="mb-1 text-sm font-medium">
                            Authentication:
                          </h4>
                          <Badge variant="secondary" className="text-xs">
                            User Authentication Required
                          </Badge>
                        </div>
                        <div>
                          <h4 className="mb-1 text-sm font-medium">
                            Parameters:
                          </h4>
                          <p className="text-xs">
                            <code className="px-1 font-mono rounded bg-muted">
                              username
                            </code>{" "}
                            - Username (string)
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* GET /user/under/:manager_id */}
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">
                            <Badge variant="outline" className="mr-2 font-mono">
                              GET
                            </Badge>
                            /user/under/:manager_id
                          </CardTitle>
                        </div>
                        <CardDescription className="text-xs">
                          Retrieves all users under a specific manager
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div>
                          <h4 className="mb-1 text-sm font-medium">
                            Authentication:
                          </h4>
                          <Badge variant="secondary" className="text-xs">
                            User Authentication Required
                          </Badge>
                        </div>
                        <div>
                          <h4 className="mb-1 text-sm font-medium">
                            Parameters:
                          </h4>
                          <p className="text-xs">
                            <code className="px-1 font-mono rounded bg-muted">
                              manager_id
                            </code>{" "}
                            - Manager ID (number)
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* PUT /user/update/:id */}
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">
                            <Badge variant="outline" className="mr-2 font-mono">
                              PUT
                            </Badge>
                            /user/update/:id
                          </CardTitle>
                        </div>
                        <CardDescription className="text-xs">
                          Updates a user's information by their ID
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div>
                          <h4 className="mb-1 text-sm font-medium">
                            Authentication:
                          </h4>
                          <Badge variant="destructive" className="text-xs">
                            Admin Authentication Required
                          </Badge>
                        </div>
                        <div>
                          <h4 className="mb-1 text-sm font-medium">
                            Parameters:
                          </h4>
                          <p className="text-xs">
                            <code className="px-1 font-mono rounded bg-muted">
                              id
                            </code>{" "}
                            - User ID (number)
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* PUT /user/updateRole/:id */}
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">
                            <Badge variant="outline" className="mr-2 font-mono">
                              PUT
                            </Badge>
                            /user/updateRole/:id
                          </CardTitle>
                        </div>
                        <CardDescription className="text-xs">
                          Updates a user's role
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div>
                          <h4 className="mb-1 text-sm font-medium">
                            Authentication:
                          </h4>
                          <Badge variant="destructive" className="text-xs">
                            Admin Authentication Required
                          </Badge>
                        </div>
                        <div>
                          <h4 className="mb-1 text-sm font-medium">
                            Parameters:
                          </h4>
                          <p className="text-xs">
                            <code className="px-1 font-mono rounded bg-muted">
                              id
                            </code>{" "}
                            - User ID (number)
                          </p>
                        </div>
                        <div>
                          <h4 className="mb-1 text-sm font-medium">
                            Request Body:
                          </h4>
                          <pre className="p-2 overflow-x-auto text-xs font-mono rounded bg-muted">
                            {`{
  "role": string  // Required - The new role to assign
}`}
                          </pre>
                        </div>
                        <div>
                          <h4 className="mb-1 text-sm font-medium">Notes:</h4>
                          <ul className="ml-4 text-xs list-disc">
                            <li>
                              When role is set to 'admin', the user's manager_id
                              is automatically set to their own ID
                            </li>
                            <li>
                              Cannot change the role of an existing admin user
                            </li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>

                    {/* DELETE /user/delete/:id */}
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">
                            <Badge variant="outline" className="mr-2 font-mono">
                              DELETE
                            </Badge>
                            /user/delete/:id
                          </CardTitle>
                        </div>
                        <CardDescription className="text-xs">
                          Deletes a user by their ID
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div>
                          <h4 className="mb-1 text-sm font-medium">
                            Authentication:
                          </h4>
                          <Badge variant="destructive" className="text-xs">
                            Admin Authentication Required
                          </Badge>
                        </div>
                        <div>
                          <h4 className="mb-1 text-sm font-medium">
                            Parameters:
                          </h4>
                          <p className="text-xs">
                            <code className="px-1 font-mono rounded bg-muted">
                              id
                            </code>{" "}
                            - User ID to delete (number)
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* PUT /user/change_manager_id/:id */}
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">
                            <Badge variant="outline" className="mr-2 font-mono">
                              PUT
                            </Badge>
                            /user/change_manager_id/:id
                          </CardTitle>
                        </div>
                        <CardDescription className="text-xs">
                          Changes a user's manager
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div>
                          <h4 className="mb-1 text-sm font-medium">
                            Authentication:
                          </h4>
                          <Badge variant="destructive" className="text-xs">
                            Admin Authentication Required
                          </Badge>
                        </div>
                        <div>
                          <h4 className="mb-1 text-sm font-medium">
                            Parameters:
                          </h4>
                          <p className="text-xs">
                            <code className="px-1 font-mono rounded bg-muted">
                              id
                            </code>{" "}
                            - User ID (number)
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="error-handling-user">
                <AccordionTrigger>Error Handling</AccordionTrigger>
                <AccordionContent>
                  <div className="p-4 rounded-md bg-muted/50">
                    <h3 className="mb-3 text-lg font-medium">
                      Error Responses
                    </h3>
                    <div className="space-y-2">
                      <p>
                        <strong>400:</strong> Bad request (missing required
                        fields)
                      </p>
                      <p>
                        <strong>401:</strong> Unauthorized (invalid credentials)
                      </p>
                      <p>
                        <strong>404:</strong> Resource not found
                      </p>
                      <p>
                        <strong>500:</strong> Internal server error
                      </p>
                    </div>
                    <div className="mt-4">
                      <h4 className="mb-2 font-medium">
                        Common Error Messages:
                      </h4>
                      <ul className="ml-6 list-disc">
                        <li>"Username and password required"</li>
                        <li>"User not found"</li>
                        <li>"Incorrect password"</li>
                        <li>"Username already exists"</li>
                        <li>"Email already exists"</li>
                        <li>"No user to log out"</li>
                        <li>
                          "Required fields: username, email, password_hash,
                          role, display_name"
                        </li>
                      </ul>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="database-schema-user">
                <AccordionTrigger>Database Schema</AccordionTrigger>
                <AccordionContent>
                  <div className="p-4 rounded-md bg-muted/50">
                    <h3 className="mb-3 text-lg font-medium">Users Schema</h3>
                    <pre className="p-3 overflow-x-auto font-mono text-sm rounded-md bg-muted">
                      {`CREATE TYPE user_role AS ENUM('admin', 'team_member');
CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'team_member',
    display_name VARCHAR(100),
    manager_id INT,
    FOREIGN KEY(manager_id) REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for faster lookups
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);`}
                    </pre>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Docs;
