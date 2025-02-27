const app = require("../../server");
const request = require("supertest");
const pool = require("../../db");

//This mocks our database pool
jest.mock("../../db", () => ({
  query: jest.fn(),
}));

//This is the test user
const testUser = {
  id: 7,
  username: "jim",
  email: "jim@example.com",
  password_hash: "jim",
  role: "admin",
  display_name: "jim",
  manager_id: "7",
};

//Here I'm checking when a user is deleted, they are removed from the backend
describe("DELETE /user/delete/:id", () => {
  pool.query.mockResolvedValueOnce({
    rows: [testUser],
    rowCount: 1,
  });

  it("returns 200 when user is identified in the database", async () => {
    // verifying this user exists in our database
    const verifyUser = await request(app).get(`/user/userid/${testUser.id}`);
    expect(verifyUser.statusCode).toBe(200);
  });

  it("returns 200 when user is deleted from the database", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [testUser],
      rowCount: 1,
    });

    //Deleting the the test user
    const DeleteUser = await request(app).delete(`/user/delete/${testUser.id}`);
    expect(DeleteUser.statusCode).toBe(200);
  });

  it("returns 400 when user isn't found in the database, after being deleted", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [],
      rowCount: 0,
    });
    //We check if the user has actually been removed from the backend
    const checkDeletion = await request(app).get(`/user/${testUser.id}`);
    expect(checkDeletion.statusCode).toBe(404);
  });
});
