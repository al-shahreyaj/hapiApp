const chai = require("chai");
const chaiHttp = require("chai-http");
const init = require("../server"); 
const { User, Leave } = require("../models");


chai.use(chaiHttp);
const { expect } = chai;

let hrToken, managerToken, userToken, user2Token;
let userId, managerId, user2Id;
let leaveId;
let server, url;

describe("Leave API Tests", () => {
  before(async () => {
    server = await init();
    url = server.info.uri;
    const hr = await chai.request(url).post("/register").send({ firstName: "HR", lastName: "Test User", role: "hr", email: "hr@example.com", password: "password" });
    const manager = await chai.request(url).post("/register").send({ firstName: "Manager", lastName: "Test User", role: "manager", email: "manager@example.com", password: "password" });
    managerId = manager.body.id;
    const user = await chai.request(url).post("/register").send({ firstName: "Developer", lastName: "Test User", role: "developer", email: "user@example.com", password: "password", managerId: managerId });
    const user2 = await chai.request(url).post("/register").send({ firstName: "Developer 2", lastName: "Test User", role: "developer", email: "user2@example.com", password: "password", managerId: managerId });

    userId = user.body.id;
    user2Id = user2.body.id;

    const loginHr = await chai.request(url).post("/login").send({ email: "hr@example.com", password: "password" });
    hrToken = `Bearer ${loginHr.body.token}`;

    const loginManager = await chai.request(url).post("/login").send({ email: "manager@example.com", password: "password" });
    managerToken = `Bearer ${loginManager.body.token}`;

    const loginUser = await chai.request(url).post("/login").send({ email: "user@example.com", password: "password" });
    userToken = `Bearer ${loginUser.body.token}`;

    const loginUser2 = await chai.request(url).post("/login").send({ email: "user2@example.com", password: "password" });
    user2Token = `Bearer ${loginUser2.body.token}`;
  });

  it("User should be able to create a leave request", async () => {
    const res = await chai
      .request(url)
      .post("/leaves")
      .set("Authorization", userToken)
      .send({
        from: "2024-03-01T18:00:00.000Z",
        to: "2024-03-05T18:00:00.000Z",
        type: "sick",
        reason: "Feeling unwell",
        emergencyContact: "1234567890",
      });

    expect(res).to.have.status(201);
    expect(res.body).to.have.property("id");
    leaveId = res.body.id;
  });

  it("User should be able to view their own leave requests", async () => {
    const res = await chai.request(url).get("/leaves").set("Authorization", userToken);
    expect(res).to.have.status(200);
    expect(res.body).to.be.an("array");
    expect(res.body.some((leave) => leave.id === leaveId)).to.be.true;
  });

  it("HR should be able to view all leave requests", async () => {
    const res = await chai.request(url).get("/leaves").set("Authorization", hrToken);
    expect(res).to.have.status(200);
    expect(res.body).to.be.an("array");
    expect(res.body.length).to.be.greaterThan(0);
  });

  it("Manager should be able to view user leave requests", async () => {
    const res = await chai.request(url).get("/leaves").set("Authorization", managerToken);
    expect(res).to.have.status(200);
    expect(res.body).to.be.an("array");
    expect(res.body.some((leave) => leave.userId === userId)).to.be.true;
  });

  it("User should be able to retrieve the leave request", async () => {
    const res = await chai.request(url).get(`/leaves/${leaveId}`).set("Authorization", userToken);
    expect(res).to.have.status(200);
    expect(res.body).to.have.property("id", leaveId);
  });

  it("User should not be able to update another user's leave", async () => {
    const res = await chai
      .request(url)
      .put(`/leaves/${leaveId}`)
      .set("Authorization", user2Token)
      .send({ reason: "Updated reason" });

    expect(res).to.have.status(403);
  });

  it("User should be able to update their own leave", async () => {
    const res = await chai
      .request(url)
      .put(`/leaves/${leaveId}`)
      .set("Authorization", userToken)
      .send({ reason: "Updated reason" });

    expect(res).to.have.status(200);
    expect(res.body).to.have.property("reason", "Updated reason");
  });

  it("User should not be able to delete another user's leave", async () => {
    const res = await chai.request(url).delete(`/leaves/${leaveId}`).set("Authorization", user2Token);
    expect(res).to.have.status(403);
  });

  it("User should be able to delete their own leave", async () => {
    const res = await chai.request(url).delete(`/leaves/${leaveId}`).set("Authorization", userToken);
    expect(res).to.have.status(200);
    expect(res.body).to.have.property("message", "Leave deleted");
  });

  after(async () => {
    await Leave.destroy({ where: {} });
    await User.destroy({ where: {} });
    await server.stop();
  });
});
