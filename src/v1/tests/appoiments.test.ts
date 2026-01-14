import {afterAll, describe, expect, it} from "vitest"
import { Server } from "../../index.js"
import { connection,v1 } from "../../mysql-config.js"
import  request  from "supertest"
import type { ResultSetHeader } from "mysql2"

describe("Appoiments tests", ()=> {
  const [app] = Server({connection,v1}) 
  const adminCredentials = {email: "ramsesgonzalez20066@gmail.com", password: "12345678"}

  afterAll(async () => {
    await connection.query<ResultSetHeader>("DELETE FROM Appoiments WHERE appoiment_id != 0")
    await connection.query<ResultSetHeader>("DELETE FROM Users WHERE email = 'test@test.test'")
  })

  describe("Create appoiment", () => {
    it ("try to create an appoiment without credentials", async () => {
      const res = await request(app).post("/api/v1/appoiments").send({
        "begin_hour": "10:00:00",
        "date":"12-01-2025",
        "finish_hour":"10:45:00",
        "name":"ramses",
        "persons": 2,
        "phone":"8295645225"
      })

      expect(res.statusCode).toBe(401)
      expect(res.body).toHaveProperty("error")
      expect(res.body.error).toContain("necesario para realizar esta accion")
    })

    it ("try to create an appoiment with a malformed credentials", async () => {
      const res = await request(app).post("/api/v1/appoiments")
      .set({"Authorization": `Bearer malformed token`})
      .send({
        "begin_hour": "10:00:00",
        "date":"12-01-2025",
        "finish_hour":"10:45:00",
        "name":"",
        "persons": 2,
        "phone":"8295645225"
      })

      expect(res.statusCode).toBe(401)
      expect(res.body).toHaveProperty("error")
      expect(res.body.error).toContain("es invalido")
    })

    it ("try to create an appoiment with a empty name", async () => {
      const adminUser = await request(app).post("/api/v1/login").send(adminCredentials)
      const adminToken =adminUser.body.token

      const res = await request(app).post("/api/v1/appoiments")
      .set({"Authorization": `Bearer ${adminToken}`})
      .send({
        "begin_hour": "10:00:00",
        "date":"12-01-2025",
        "finish_hour":"10:45:00",
        "name":"",
        "persons": 2,
        "phone":"8295645225"
      })

      expect(res.statusCode).toBe(400)
      expect(res.body).toHaveProperty("error")
      expect(res.body.error).toContain("nombre")
    })

    it ("try to create an appoiment with a empty begin hour", async () => {
      const adminUser = await request(app).post("/api/v1/login").send(adminCredentials)
      const adminToken =adminUser.body.token

      const res = await request(app).post("/api/v1/appoiments")
      .set({"Authorization": `Bearer ${adminToken}`})
      .send({
        "begin_hour": "",
        "date":"12-01-2025",
        "finish_hour":"10:45:00",
        "name":"Ramses",
        "persons": 2,
        "phone":"8295645225"
      })

      expect(res.statusCode).toBe(400)
      expect(res.body).toHaveProperty("error")
      expect(res.body.error).toContain("hora de inicio")
    })

    it ("try to create an appoiment with a empty finish hour", async () => {
      const adminUser = await request(app).post("/api/v1/login").send(adminCredentials)
      const adminToken =adminUser.body.token

      const res = await request(app).post("/api/v1/appoiments")
      .set({"Authorization": `Bearer ${adminToken}`})
      .send({
        "begin_hour": "10:00:00",
        "date":"12-01-2025",
        "finish_hour":"",
        "name":"Ramses",
        "persons": 2,
        "phone":"8295645225"
      })

      expect(res.statusCode).toBe(400)
      expect(res.body).toHaveProperty("error")
      expect(res.body.error).toContain("hora de final")
    })

    it ("try to create an appoiment with a empty date", async () => {
      const adminUser = await request(app).post("/api/v1/login").send(adminCredentials)
      const adminToken =adminUser.body.token

      const res = await request(app).post("/api/v1/appoiments")
      .set({"Authorization": `Bearer ${adminToken}`})
      .send({
        "begin_hour": "10:00:00",
        "date":"",
        "finish_hour":"10:00:00",
        "name":"Ramses",
        "persons": 2,
        "phone":"8295645225"
      })

      expect(res.statusCode).toBe(400)
      expect(res.body).toHaveProperty("error")
      expect(res.body.error).toContain("la fecha es necesaria")
    })

    it ("try to create an appoiment with a malformed date", async () => {
      const adminUser = await request(app).post("/api/v1/login").send(adminCredentials)
      const adminToken =adminUser.body.token

      const res = await request(app).post("/api/v1/appoiments")
      .set({"Authorization": `Bearer ${adminToken}`})
      .send({
        "begin_hour": "10:00:00",
        "date":"12121",
        "finish_hour":"10:00:00",
        "name":"Ramses",
        "persons": 2,
        "phone":"8295645225"
      })

      expect(res.statusCode).toBe(400)
      expect(res.body).toHaveProperty("error")
      expect(res.body.error).toContain("no es valido")
    })

    it ("try to create an appoiment with a empty phone", async () => {
      const adminUser = await request(app).post("/api/v1/login").send(adminCredentials)
      const adminToken =adminUser.body.token

      const res = await request(app).post("/api/v1/appoiments")
      .set({"Authorization": `Bearer ${adminToken}`})
      .send({
        "begin_hour": "10:00:00",
        "date":"10-02-2025",
        "finish_hour":"10:00:00",
        "name":"Ramses",
        "persons": 2,
        "phone":""
      })

      expect(res.statusCode).toBe(400)
      expect(res.body).toHaveProperty("error")
      expect(res.body.error).toContain("Numero telefonico incompleto")
    })

    it ("try to create an appoiment with a non existing user", async () => {
      const nonExistingUserToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiM2Q3MzNkZjMtZWFhOC0xMWYwLTkzYzAtZDQ2ZDZkNmZhMzIzIiwiaWF0IjoxNzY3NjY3MzY0fQ.L0CuLQx36Urxn4AqRMLbNp8kN2HkfbVmsPPogLitCYk"

      const res = await request(app).post("/api/v1/appoiments")
      .set({"Authorization": `Bearer ${nonExistingUserToken}`})
      .send({
        "begin_hour": "10:00:00",
        "date":"10-02-2025",
        "finish_hour":"10:20:00",
        "name":"Ramses",
        "persons": 2,
        "phone":"1234567890"
      })

      expect(res.statusCode).toBe(404)
      expect(res.body).toHaveProperty("error")
      expect(res.body.error).toContain("id proporcionada")
    })

    it ("try to create an appoiment with a empty persons, it shouldn't be a problem, its should to response with the user", async () => {
      const adminUser = await request(app).post("/api/v1/login").send(adminCredentials)
      const adminToken =adminUser.body.token

      const res = await request(app).post("/api/v1/appoiments")
      .set({"Authorization": `Bearer ${adminToken}`})
      .send({
        "begin_hour": "10:00:00",
        "date":"10-02-2025",
        "finish_hour":"10:45:00",
        "name":"Ramses",
        "phone":"8295468897"
      })

      const result2 = await request(app).get("/api/v1/appoiments").set({"authorization": `Bearer ${adminToken}`}).send()

      expect(res.statusCode).toBe(200)
      expect(res.body).toHaveProperty("appoiment_id")
      expect(result2.body).toHaveLength(1)
    })
  })

  describe("Get appoiments", () => {
    it ("Try to get appoiments without credentials", async () => {
      const res = await request(app).get("/api/v1/appoiments").send()
      expect(res.statusCode).toBe(401)
      expect(res.body).toHaveProperty("error")
      expect(res.body.error).toContain("es necesario para realizar esta accion")
    })

    it ("Try to get appoiments with a invalid accessToken", async () => {
      const res = await request(app).get("/api/v1/appoiments").set({"authorization": `Bearer aasadsdasd`}).send()

      expect(res.statusCode).toBe(401)
      expect(res.body).toHaveProperty("error")
      expect(res.body.error).toContain("es invalido")
    })

    it ("Try to get appoiments with the correct accessToken", async () => {
      const adminUser = await request(app).post("/api/v1/login").send(adminCredentials)
      const adminToken = adminUser.body.token

      const res = await request(app).get("/api/v1/appoiments").set({"authorization": `Bearer ${adminToken}`}).send()

      expect(res.statusCode).toBe(200)
      expect(res.body).toHaveLength(1)
    })
  })

  describe("Update appoiments", () => {
    it ("try to update an appoiment without credentials", async () => {
      const adminUser = await request(app).post("/api/v1/login").send(adminCredentials)
      const adminToken = adminUser.body.token

      const result = await request(app).get("/api/v1/appoiments").set({"authorization": `Bearer ${adminToken}`}).send()
      const element = result.body[0]

      const res = await request(app).patch("/api/v1/appoiments/" + element.appoiment_id).send({
        "begin_hour": "10:00:00",
        "date":"12-01-2025",
        "finish_hour":"10:45:00",
        "name":"ramses",
        "persons": 2,
        "phone":"8295645225"
      })

      expect(res.statusCode).toBe(401)
      expect(res.body).toHaveProperty("error")
      expect(res.body.error).toContain("necesario para realizar esta accion")
    })

    it ("try to update an appoiment with a malformed credentials", async () => {
      const adminUser = await request(app).post("/api/v1/login").send(adminCredentials)
      const adminToken = adminUser.body.token

      const result = await request(app).get("/api/v1/appoiments").set({"authorization": `Bearer ${adminToken}`}).send()
      const element = result.body[0]

      const res = await request(app).patch("/api/v1/appoiments/" + element.appoiment_id)
      .set({"Authorization": `Bearer malformed token`})
      .send({
        "begin_hour": "10:00:00",
        "date":"12-01-2025",
        "finish_hour":"10:45:00",
        "name":"",
        "persons": 2,
        "phone":"8295645225"
      })

      expect(res.statusCode).toBe(401)
      expect(res.body).toHaveProperty("error")
      expect(res.body.error).toContain("es invalido")
    })

    it ("try to update an appoiment with a empty name", async () => {
      const adminUser = await request(app).post("/api/v1/login").send(adminCredentials)
      const adminToken = adminUser.body.token

      const result = await request(app).get("/api/v1/appoiments").set({"authorization": `Bearer ${adminToken}`}).send()
      const element = result.body[0]

      const res = await request(app).patch("/api/v1/appoiments/" + element.appoiment_id)
      .set({"Authorization": `Bearer ${adminToken}`})
      .send({
        "begin_hour": "10:00:00",
        "date":"12-01-2025",
        "finish_hour":"10:45:00",
        "name":"",
        "persons": 2,
        "phone":"8295645225"
      })

      expect(res.statusCode).toBe(400)
      expect(res.body).toHaveProperty("error")
      expect(res.body.error).toContain("nombre")
    })

    it ("try to update an appoiment with a empty begin hour", async () => {
      const adminUser = await request(app).post("/api/v1/login").send(adminCredentials)
      const adminToken = adminUser.body.token

      const result = await request(app).get("/api/v1/appoiments").set({"authorization": `Bearer ${adminToken}`}).send()
      const element = result.body[0]

      const res = await request(app).patch("/api/v1/appoiments/" + element.appoiment_id)
      .set({"Authorization": `Bearer ${adminToken}`})
      .send({
        "begin_hour": "",
        "date":"12-01-2025",
        "finish_hour":"10:45:00",
        "name":"Ramses",
        "persons": 2,
        "phone":"8295645225"
      })

      expect(res.statusCode).toBe(400)
      expect(res.body).toHaveProperty("error")
      expect(res.body.error).toContain("hora de inicio")
    })

    it ("try to update an appoiment with a empty finish hour", async () => {
      const adminUser = await request(app).post("/api/v1/login").send(adminCredentials)
      const adminToken = adminUser.body.token

      const result = await request(app).get("/api/v1/appoiments").set({"authorization": `Bearer ${adminToken}`}).send()
      const element = result.body[0]

      const res = await request(app).patch("/api/v1/appoiments/" + element.appoiment_id)
      .set({"Authorization": `Bearer ${adminToken}`})
      .send({
        "begin_hour": "10:00:00",
        "date":"12-01-2025",
        "finish_hour":"",
        "name":"Ramses",
        "persons": 2,
        "phone":"8295645225"
      })

      expect(res.statusCode).toBe(400)
      expect(res.body).toHaveProperty("error")
      expect(res.body.error).toContain("hora de final")
    })

    it ("try to update an appoiment with a empty date", async () => {
      const adminUser = await request(app).post("/api/v1/login").send(adminCredentials)
      const adminToken = adminUser.body.token

      const result = await request(app).get("/api/v1/appoiments").set({"authorization": `Bearer ${adminToken}`}).send()
      const element = result.body[0]

      const res = await request(app).patch("/api/v1/appoiments/" + element.appoiment_id)
      .set({"Authorization": `Bearer ${adminToken}`})
      .send({
        "begin_hour": "10:00:00",
        "date":"",
        "finish_hour":"10:00:00",
        "name":"Ramses",
        "persons": 2,
        "phone":"8295645225"
      })

      expect(res.statusCode).toBe(400)
      expect(res.body).toHaveProperty("error")
      expect(res.body.error).toContain("la fecha es necesaria")
    })

    it ("try to update an appoiment with a malformed date", async () => {
      const adminUser = await request(app).post("/api/v1/login").send(adminCredentials)
      const adminToken = adminUser.body.token

      const result = await request(app).get("/api/v1/appoiments").set({"authorization": `Bearer ${adminToken}`}).send()
      const element = result.body[0]

      const res = await request(app).patch("/api/v1/appoiments/" + element.appoiment_id)
      .set({"Authorization": `Bearer ${adminToken}`})
      .send({
        "begin_hour": "10:00:00",
        "date":"12121",
        "finish_hour":"10:00:00",
        "name":"Ramses",
        "persons": 2,
        "phone":"8295645225"
      })

      expect(res.statusCode).toBe(400)
      expect(res.body).toHaveProperty("error")
      expect(res.body.error).toContain("no es valido")
    })

    it ("try to update an appoiment with a empty phone", async () => {
      const adminUser = await request(app).post("/api/v1/login").send(adminCredentials)
      const adminToken = adminUser.body.token

      const result = await request(app).get("/api/v1/appoiments").set({"authorization": `Bearer ${adminToken}`}).send()
      const element = result.body[0]

      const res = await request(app).patch("/api/v1/appoiments/" + element.appoiment_id)
      .set({"Authorization": `Bearer ${adminToken}`})
      .send({
        "begin_hour": "10:00:00",
        "date":"10-02-2025",
        "finish_hour":"10:00:00",
        "name":"Ramses",
        "persons": 2,
        "phone":""
      })

      expect(res.statusCode).toBe(400)
      expect(res.body).toHaveProperty("error")
      expect(res.body.error).toContain("Numero telefonico incompleto")
    })

    it ("try to update an appoiment with a non existing user", async () => {
      const adminUser = await request(app).post("/api/v1/login").send(adminCredentials)
      const adminToken = adminUser.body.token

      const nonExistingUserToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiM2Q3MzNkZjMtZWFhOC0xMWYwLTkzYzAtZDQ2ZDZkNmZhMzIzIiwiaWF0IjoxNzY3NjY3MzY0fQ.L0CuLQx36Urxn4AqRMLbNp8kN2HkfbVmsPPogLitCYk"

      const result = await request(app).get("/api/v1/appoiments").set({"authorization": `Bearer ${adminToken}`}).send()
      const element = result.body[0]

      const res = await request(app).patch("/api/v1/appoiments/" + element.appoiment_id)
      .set({"Authorization": `Bearer ${nonExistingUserToken}`})
      .send({
        "begin_hour": "10:00:00",
        "date":"10-02-2025",
        "finish_hour":"10:45:00",
        "name":"Juan",
        "phone":"8295468897"
      })

      const result2 = await request(app).get("/api/v1/appoiments").set({"authorization": `Bearer ${adminToken}`}).send()
      const element2 = result.body[0]

      expect(res.statusCode).toBe(404)
      expect(res.body).toHaveProperty("error")
      expect(res.body.error).toContain("id")
      expect(element2).toHaveProperty("name","Ramses")
    })

    it ("try to update an appoiment with a not the user that create this appoiments", async () => {
      const adminUser = await request(app).post("/api/v1/login").send(adminCredentials)
      const adminToken = adminUser.body.token

      const userRes = await request(app).post("/api/v1/users").set({"authorization": `Bearer ${adminToken}`}).send({
        name: "test user for some test",
        email: "test@test.test",
        password: "testtest"
      })

      const newUserCredentials = await request(app).post("/api/v1/login").send({
        email: "test@test.test",
        password: "testtest"
      })

      const anotherUserToken = newUserCredentials.body.token

      const result = await request(app).get("/api/v1/appoiments").set({"authorization": `Bearer ${adminToken}`}).send()
      const element = result.body[0]

      const res = await request(app).patch("/api/v1/appoiments/" + element.appoiment_id)
      .set({"Authorization": `Bearer ${anotherUserToken}`})
      .send({
        "begin_hour": "10:00:00",
        "date":"10-02-2025",
        "finish_hour":"10:45:00",
        "name":"Juan",
        "phone":"8295468897"
      })

      const result2 = await request(app).get("/api/v1/appoiments").set({"authorization": `Bearer ${adminToken}`}).send()

      const deleteUserResult = await request(app).delete("/api/v1/users/" + userRes.body.user_id).set({"authorization": `Bearer ${adminToken}`}).send()

      expect(res.statusCode).toBe(401)
      expect(res.body).toHaveProperty("error")
      expect(res.body.error).toContain("realizar esta accion")
      expect(result2.body[0].name).toBe("Ramses")
      expect(deleteUserResult.statusCode).toBe(204)
    })

    it ("try to update an appoiment with a empty persons, it shouldn't be a problem, its should to response with the user", async () => {
      const adminUser = await request(app).post("/api/v1/login").send(adminCredentials)
      const adminToken = adminUser.body.token

      const result = await request(app).get("/api/v1/appoiments").set({"authorization": `Bearer ${adminToken}`}).send()
      const element = result.body[0]

      const res = await request(app).patch("/api/v1/appoiments/" + element.appoiment_id)
      .set({"Authorization": `Bearer ${adminToken}`})
      .send({
        "begin_hour": "10:00:00",
        "date":"10-02-2025",
        "finish_hour":"10:45:00",
        "name":"Juan",
        "phone":"8295468897"
      })

      const result2 = await request(app).get("/api/v1/appoiments").set({"authorization": `Bearer ${adminToken}`}).send()

      expect(res.statusCode).toBe(200)
      expect(res.body).toHaveProperty("appoiment_id")
      expect(result2.body).toHaveLength(1)
      expect(result2.body[0].name).toBe("Juan")
    })
  })

  describe("Delete appoiments", ()=> {
    it ("try to delete appoiment without the credentials", async () =>{
      const adminUser = await request(app).post("/api/v1/login").send(adminCredentials)
      const adminToken = adminUser.body.token

      const elementResult = await request(app).get("/api/v1/appoiments").set({"authorization": `Bearer ${adminToken}`}).send()
      const appoimentId = elementResult.body[0].appoiment_id

      const res = await request(app).delete("/api/v1/appoiments/" + appoimentId)
      .send()

      expect(res.statusCode).toBe(401)
      expect(res.body).toHaveProperty("error")
      expect(res.body.error).toContain("necesario para realizar esta accion")
    })

    it ("try to delete appoiment with a malformed credentials", async () =>{
      const adminUser = await request(app).post("/api/v1/login").send(adminCredentials)
      const adminToken = adminUser.body.token

      const elementResult = await request(app).get("/api/v1/appoiments").set({"authorization": `Bearer ${adminToken}`}).send()
      const appoimentId = elementResult.body[0].appoiment_id

      const res = await request(app).delete("/api/v1/appoiments/" + appoimentId).set({"authorization": `Bearer asdasda`}).send()

      expect(res.statusCode).toBe(401)
      expect(res.body).toHaveProperty("error")
      expect(res.body.error).toContain("es invalido")
    })

    it ("try to delete appoiment with another user credentials", async () =>{
      const adminUser = await request(app).post("/api/v1/login").send(adminCredentials)
      const adminToken = adminUser.body.token

      const userRes = await request(app).post("/api/v1/users").set({"authorization": `Bearer ${adminToken}`}).send({
        name: "test user for some test",
        email: "test@test.test",
        password: "testtest"
      })

      const newUserCredentials = await request(app).post("/api/v1/login").send({
        email: "test@test.test",
        password: "testtest"
      })

      const anotherUserToken = newUserCredentials.body.token

      const elementResult = await request(app).get("/api/v1/appoiments").set({"authorization": `Bearer ${adminToken}`}).send()
      const appoimentId = elementResult.body[0].appoiment_id

      const res = await request(app).delete("/api/v1/appoiments/" + appoimentId).set({"authorization": `Bearer ${anotherUserToken}`}).send()

      const deleteUserResult = await request(app).delete("/api/v1/users/" + userRes.body.user_id).set({"authorization": `Bearer ${adminToken}`}).send()

      expect(res.statusCode).toBe(401)
      expect(res.body).toHaveProperty("error")
      expect(res.body.error).toContain("El usuario no puede")
      expect(deleteUserResult.statusCode).toBe(204)

    })

    it ("delete appoiment", async () =>{
      const adminUser = await request(app).post("/api/v1/login").send(adminCredentials)
      const adminToken = adminUser.body.token

      const elementResult = await request(app).get("/api/v1/appoiments").set({"authorization": `Bearer ${adminToken}`}).send()
      const appoimentId = elementResult.body[0].appoiment_id

      const res = await request(app).delete("/api/v1/appoiments/" + appoimentId).set({"authorization": `Bearer ${adminToken}`}).send()

      const getResult = await request(app).get("/api/v1/appoiments/").set({"authorization": `Bearer ${adminToken}`}).send()

      expect(res.statusCode).toBe(204)
      expect(getResult.body).toHaveLength(0)
    })
  })
})