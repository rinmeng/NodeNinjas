const express = require("express");
const pool = require("../db");
const router = express.Router();
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const { isAuthenticated } = require("../auth");
const { isAuthAsAdmin } = require("../auth");

// GET /task/all - Fetch all tasks
router.get("/all", isAuthenticated, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM task ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
});

// POST /task/add - Add a new task
router.post("/add", isAuthenticated, async (req, res) => {
  const { name, date, description, status, priority, owner_id } = req.body;

  if (!name || !date || !status || !priority) {
    return res.status(400).json({
      message: "Missing required fields",
    });
  }

  // check to see if name and description is unique or not
  const checkName = await pool.query("SELECT * FROM task WHERE name = $1", [
    name,
  ]);
  const checkDescription = await pool.query(
    "SELECT * FROM task WHERE description = $1",
    [description]
  );

  if (checkName.rowCount > 0) {
    return res.status(400).json({ message: "Task name already exists" });
  }
  if (checkDescription.rowCount > 0) {
    return res.status(400).json({ message: "Task description already exists" });
  }

  try {
    // Start transaction
    await pool.query("BEGIN");

    // Insert task
    const taskResult = await pool.query(
      `INSERT INTO task (name, date, description, status, priority, owner_id)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
      [
        name,
        date,
        description,
        status || "pending",
        priority || "medium",
        owner_id,
      ]
    );
    // asign the task to the owner
    const assignOwner = await pool.query(
      `INSERT INTO assignedto (user_id, task_id, assigned_date)
                VALUES ($1, $2, CURRENT_DATE)`,
      [owner_id, taskResult.rows[0].id]
    );

    // Commit transaction
    await pool.query("COMMIT");

    res.status(201).json(taskResult.rows[0]);
  } catch (err) {
    await pool.query("ROLLBACK");
    res.status(500).json({
      message: "Failed to create task",
    });
  }
});

// DELETE /task/delete/:id - Delete a task by ID
router.delete("/delete/:id", isAuthenticated, async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ message: "Task ID is required" });
  }
  try {
    await pool.query("BEGIN");

    // Delete assignments first due to foreign key constraint
    await pool.query("DELETE FROM assignedto WHERE task_id = $1", [id]);

    // Then delete the task
    const deleteTask = await pool.query(
      "DELETE FROM task WHERE id = $1 RETURNING *",
      [id]
    );

    if (deleteTask.rowCount === 0) {
      await pool.query("ROLLBACK");
      return res.status(404).json({ message: "Task not found" });
    }

    await pool.query("COMMIT");
    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    await pool.query("ROLLBACK");
    res.status(500).json({ message: "Failed to delete task" });
  }
});

// PUT /task/update/:id - Update a task by ID
router.put("/update/:id", isAuthenticated, async (req, res) => {
  const { id, name, date, description, status, priority } = req.body;

  try {
    await pool.query("BEGIN");

    // Update task
    const taskResult = await pool.query(
      `
            UPDATE task
            SET name = $1, date = $2, description = $3, status = $4, priority = $5
            WHERE id = $6
            RETURNING *
        `,
      [name, date, description, status, priority, id]
    );

    if (taskResult.rowCount === 0) {
      await pool.query("ROLLBACK");
      return res.status(404).json({ message: "Task not found" });
    }

    await pool.query("COMMIT");
    res.json(taskResult.rows[0]);
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("Error updating task:", err);
    res.status(500).json({ message: "Failed to update task" });
  }
});

// GET /task/:id - Fetch a task by ID
// Should be used to get a specific task with all assigned users
router.get("/id/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: "Task ID is required" });
  }
  try {
    const taskResult = await pool.query(
      `
            SELECT t.id, t.name, t.date, t.description, t.status, t.priority, 
            u.id as user_id, u.username, u.display_name
            FROM task t
            LEFT JOIN assignedto a ON t.id = a.task_id
            LEFT JOIN users u ON a.user_id = u.id
            WHERE t.id = $1
        `,
      [id]
    );

    if (taskResult.rowCount === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    const task = taskResult.rows[0];
    const assigned_users = taskResult.rows
      .filter((row) => row.user_id)
      .map((row) => ({
        user_id: row.user_id,
        username: row.username,
        display_name: row.display_name,
      }));

    res.json({
      id: task.id,
      name: task.name,
      date: task.date,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assigned_users,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch task" });
  }
});

// GET /task/assignedto/user/:id - Fetch all tasks assigned to a user
// Should be used to get all tasks assigned to a specific user
router.get("/assignedto/user/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: "User ID is required" });
  }
  try {
    const result = await pool.query(
      `
            SELECT t.id, t.name, t.date, t.description, t.status, t.priority, t.is_locked, t.created_at,
            u.id as owner_id, u.username as owner_username, u.display_name as owner_display_name
            FROM task t
            JOIN assignedto a ON t.id = a.task_id
            JOIN users u ON t.owner_id = u.id
            WHERE a.user_id = $1
            ORDER BY t.date DESC
        `,
      [id]
    );
    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "No tasks found under this user" });
    }
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
});

// GET /task/assignedto/all - Fetch all assignedto records
// Should be used to get all assignedto records
router.get("/assignedto/all", isAuthenticated, async (req, res) => {
  try {
    const result = await pool.query(`
            SELECT * FROM assignedto;
        `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
});

// PUT /task/lock/:id - Lock a task by ID
router.put("/lock/:id", isAuthAsAdmin, async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ message: "Task ID is required" });
  }
  try {
    const result = await pool.query(
      `
            UPDATE task
            SET is_locked = true
            WHERE id = $1
            RETURNING *
        `,
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Failed to lock task" });
  }
});

// PUT /task/unlock/:id - Unlock a task by ID
router.put("/unlock/:id", isAuthAsAdmin, async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ message: "Task ID is required" });
  }
  try {
    const result = await pool.query(
      `
            UPDATE task
            SET is_locked = false
            WHERE id = $1
            RETURNING *
        `,
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Failed to unlock task" });
  }
});

// POST /task/assign/:id - Assign a task to a user
router.post("/assign/:id", isAuthAsAdmin, async (req, res) => {
  const { id } = req.params;
  const { user_ids } = req.body;

  if (!id || !user_ids) {
    return res
      .status(400)
      .json({ message: "Task ID and user IDs are required" });
  }

  try {
    // Check which users are already assigned
    const checkAssigned = await pool.query(
      `
            SELECT user_id FROM assignedto
            WHERE task_id = $1 AND user_id = ANY($2)
        `,
      [id, user_ids]
    );

    // Get array of already assigned user IDs
    const assignedUserIds = checkAssigned.rows.map((row) => row.user_id);

    // Filter out already assigned users
    const newUserIds = user_ids.filter((id) => !assignedUserIds.includes(id));

    // If there are new users to assign, insert them and notified them
    if (newUserIds.length > 0) {
      const assignValues = newUserIds
        .map((userId) => {
          return `(${userId}, ${id}, CURRENT_DATE)`;
        })
        .join(",");

      await pool.query(`
                INSERT INTO AssignedTo (user_id, task_id, assigned_date)
                VALUES ${assignValues}
            `);
    }

    res.status(201).json({
      message: "Assignment process completed",
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to assign task" });
  }
});

// DELETE /task/unassign/:id - Unassign a task from a user
router.delete("/unassign/:id", isAuthAsAdmin, async (req, res) => {
  const { id } = req.params;
  const { user_ids } = req.body;

  if (!id || !user_ids) {
    return res
      .status(400)
      .json({ message: "Task ID and user IDs are required" });
  }

  try {
    const result = await pool.query(
      `
            DELETE FROM assignedto
            WHERE task_id = $1 AND user_id = ANY($2)
            RETURNING *
        `,
      [id, user_ids]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "No assignments found" });
    }

    res.status(200).json({ message: "Unassignment process completed" });
  } catch (err) {
    res.status(500).json({ message: "Failed to unassign task" });
  }
});

// new route for fetching all tasks under a user that is under some manager
// GET /task/assignedto/manager/:id - Fetch all tasks assigned to users under a manager
router.get("/assignedto/manager/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;
  if (!id || isNaN(id)) {
    return res
      .status(400)
      .json({ message: "Manager ID is required and must be a number" });
  }

  try {
    const result = await pool.query(
      `
            SELECT 
                t.*,
                u.id as assigned_user_id,
                u.username as assigned_username,
                u.display_name as assigned_display_name,
                o.id as owner_id,
                o.username as owner_username,
                o.display_name as owner_display_name
            FROM users u
            JOIN assignedto a ON u.id = a.user_id
            JOIN task t ON a.task_id = t.id
            JOIN users o ON t.owner_id = o.id
            WHERE u.manager_id = $1
            ORDER BY u.display_name, t.date DESC
        `,
      [id]
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({
          message: "No tasks found for team members under this manager",
        });
    }
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching manager tasks:", err);
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
});

module.exports = router;
