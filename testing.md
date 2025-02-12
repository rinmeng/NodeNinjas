# API Backend Testing Guide with Jest and Supertest

## Installing Jest and Supertest

Install Jest and Supertest as dev dependencies, under the server directory:

```bash
ctms/server> npm install --save-dev jest supertest
```

## Example Test Structure

```javascript
const request = require("supertest");
const app = require("../app"); // Your Express app

describe("API Endpoints", () => {
  // Test GET endpoint
  describe("GET /api/items", () => {
    it("should return all items", async () => {
      const res = await request(app).get("/api/items").expect(200);

      expect(Array.isArray(res.body)).toBeTruthy();
    });
  });

  // Test POST endpoint
  describe("POST /api/items", () => {
    it("should create a new item", async () => {
      const newItem = {
        name: "Test Item",
        description: "Test Description",
      };

      const res = await request(app)
        .post("/api/items")
        .send(newItem)
        .expect(201);

      expect(res.body.name).toBe(newItem.name);
    });
  });

  // Test error handling
  describe("Error Handling", () => {
    it("should return 404 for non-existent route", async () => {
      await request(app).get("/api/nonexistent").expect(404);
    });
  });
});
```

## Best Practices

1. Test both success and error cases
2. Use describe blocks for logical grouping
3. Clear test descriptions
4. Isolate tests using beforeEach/afterEach
5. Mock external dependencies

## Running Tests

When you are in the server directory, run with (already configured in `package.json`):

```bash
ctms/server> npm test
```
