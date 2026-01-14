import { describe,it,expect, afterAll } from "vitest";
import request from "supertest"
import { Server } from "../../index.js";
import { v1, connection } from "../../mysql-config.js";
import type { RowDataPacket } from "mysql2";


describe("Comments", () => {
  const [app] = Server({v1,connection}) 

  afterAll(async () => {
    await connection.query<RowDataPacket[]>("DELETE FROM Comments WHERE comment_id != 0")
  })

  describe("Create Comment", () => {
    it ("try to create a comment without credentials", async () => {

      const res = await request(app).post("/api/v1/comments/")
      .send({title: "Test Comment", reply_to:"test@example.com" , content: "This is a test comment"})

      expect (res.status).toBe(401)
      expect (res.body).toHaveProperty("error")
      expect (res.body.error).toContain("El token de acceso es necesario")
    })
    
    it ("try to create a comment without title", async () => {
      const adminUser = await request(app).post("/api/v1/login").send({email: "ramsesgonzalez20066@gmail.com", password: "12345678"})
      const adminToken = adminUser.body.token


      const res = await request(app).post("/api/v1/comments/")
      .set({"Authorization": `Bearer ${adminToken}`})
      .send({ reply_to:"test@example.com" , content: "This is a test comment"})

      expect (res.status).toBe(400)
      expect (res.body).toHaveProperty("error")
      expect (res.body.error).toContain("proporcionar un titulo")
    })

    it ("try to create a comment without email", async () => {
      const adminUser = await request(app).post("/api/v1/login").send({email: "ramsesgonzalez20066@gmail.com", password: "12345678"})
      const adminToken = adminUser.body.token

      const res = await request(app).post("/api/v1/comments/")
      .set({"Authorization": `Bearer ${adminToken}`})
      .send({title: "Test Comment", content: "This is a test comment"})

      expect (res.status).toBe(400)
      expect (res.body).toHaveProperty("error")
      expect (res.body.error).toContain("proporcionar el email")
    })

    it ("try to create a comment without comment", async () => {
      const adminUser = await request(app).post("/api/v1/login").send({email: "ramsesgonzalez20066@gmail.com", password: "12345678"})
      const adminToken = adminUser.body.token

      const res = await request(app).post("/api/v1/comments/")
      .set({"Authorization": `Bearer ${adminToken}`})
      .send({ reply_to:"test@example.com" , title: "Test Comment"})

      expect (res.status).toBe(400)
      expect (res.body).toHaveProperty("error")
      expect (res.body.error).toContain("proporcionar el mensaje")
    })

    it ("try to create a comment with a non existing user", async () => {
      const nonExistingUserToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiM2Q3MzNkZjMtZWFhOC0xMWYwLTkzYzAtZDQ2ZDZkNmZhMzIzIiwiaWF0IjoxNzY3NjY3MzY0fQ.L0CuLQx36Urxn4AqRMLbNp8kN2HkfbVmsPPogLitCYk"

      const res = await request(app).post("/api/v1/comments/")
      .set({"Authorization": `Bearer ${nonExistingUserToken}`})
      .send({ reply_to:"test@example.com" , title: "Test Comment", comment: "This is a test comment"})

      expect (res.status).toBe(404)
      expect (res.body).toHaveProperty("error")
      expect (res.body.error).toContain("id proporcionada")
    })

    it ("create a comment it should to response with 200 status code", async () => {
      const adminUser = await request(app).post("/api/v1/login").send({email: "ramsesgonzalez20066@gmail.com", password: "12345678"})
      const adminToken = adminUser.body.token

      const res = await request(app).post("/api/v1/comments/")
      .set({"Authorization": `Bearer ${adminToken}`})
      .send({ reply_to:"test@example.com" , title: "Test Comment", comment: "This is a test comment"})

      const res2 = await request(app).get("/api/v1/comments/").set({"Authorization": `Bearer ${adminToken}`}).send()

      expect (res.status).toBe(200)
      expect (res.body).toHaveProperty("reply_to", "test@example.com")
      expect (res2.body.length).toBe(1)
    })
  })

  describe("Get Comments", () => {
    it ("try to get comments without credentials", async () => {
      const res = await request(app).get("/api/v1/comments/")
      expect (res.status).toBe(401)
      expect (res.body).toHaveProperty("error")
      expect (res.body.error).toContain("El token de acceso es necesario")
    })

    it ("try to get comments with invalid token", async () => {
      const res = await request(app).get("/api/v1/comments/").set({"Authorization": `Bearer invalidtoken`})
      expect (res.status).toBe(401)
      expect (res.body).toHaveProperty("error")
      expect (res.body.error).toContain("El token de acceso es invalido")
    })

    it ("try to get comments with a non existing user", async () => {
      const res = await request(app).get("/api/v1/comments/").set({"Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZmFrZXVzZXIxMjM0NTYiLCJpYXQiOjE2OTgzNzI5MDV9.dQw4w9WgXcQ`})

      expect (res.status).toBe(401)
      expect (res.body).toHaveProperty("error")
      expect (res.body.error).toContain("permisos")
    })

    it ("get comments it should to response with 200 status code", async () => {
      const adminUser = await request(app).post("/api/v1/login").send({email: "ramsesgonzalez20066@gmail.com", password: "12345678"})
      const adminToken = adminUser.body.token

      const res = await request(app).get("/api/v1/comments/").set({"Authorization": `Bearer ${adminToken}`})

      expect (res.status).toBe(200)
      expect (Array.isArray(res.body)).toBe(true)
      expect(res.body.length).toBe(1)
    })
  })

  describe("Delete Comment", () => {
    it ("try to delete a comment without credentials", async () => {
      const res = await request(app).delete("/api/v1/comments/1")
      expect (res.status).toBe(401)
      expect (res.body).toHaveProperty("error")
      expect (res.body.error).toContain("El token de acceso es necesario")
    })  

    it ("try to delete a comment with invalid token", async () => {
      const res = await request(app).delete("/api/v1/comments/1").set({"Authorization": `Bearer invalidtoken`})
      expect (res.status).toBe(401)
      expect (res.body).toHaveProperty("error")
      expect (res.body.error).toContain("El token de acceso es invalido")
    })

    it ("try to delete a non existing comment", async () => {
      const adminUser = await request(app).post("/api/v1/login").send({email: "ramsesgonzalez20066@gmail.com", password: "12345678"})
      const adminToken = adminUser.body.token

      const res = await request(app).delete("/api/v1/comments/9999").set({"Authorization": `Bearer ${adminToken}`}).send()

      expect (res.status).toBe(404)
      expect (res.body).toHaveProperty("error")
      expect (res.body.error).toContain("no es valida")
    })

    it ("try to delete comment with another user", async () => {
      const adminCredentials = {email: "ramsesgonzalez20066@gmail.com", password: "12345678"}

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
      
      const oldCommentData = await request(app).get("/api/v1/comments/").set({"Authorization":`Bearer ${adminToken}`}).send()
      const commentId = oldCommentData.body[0].comment_id


      const res = await request(app).delete("/api/v1/comments/" + commentId).set({"Authorization": `Bearer ${anotherUserToken}`}).send()

      const deleteUserResult = await request(app).delete("/api/v1/users/" + userRes.body.user_id).set({"authorization": `Bearer ${adminToken}`}).send()      

      expect (res.status).toBe(401)
      expect (res.body).toHaveProperty("error")
      expect (res.body.error).toContain("realizar esta accion")
      expect(deleteUserResult.statusCode).toBe(204)
    })

    it ("delete a comment it should to response with 204 status code", async () => {
      const adminUser = await request(app).post("/api/v1/login").send({email: "ramsesgonzalez20066@gmail.com", password: "12345678"})
      const adminToken = adminUser.body.token

      const commentFetch = await request(app).get("/api/v1/comments").set({"authorization": `Bearer ${adminToken}`}).send()
      const [comment] = commentFetch.body

      const res = await request(app).delete("/api/v1/comments/" + comment.comment_id).set({"Authorization": `Bearer ${adminToken}`})  

      const commentFetch2 = await request(app).get("/api/v1/comments").set({"authorization": `Bearer ${adminToken}`}).send()
      const comment2 = commentFetch2.body

      expect (res.status).toBe(204)
      expect(comment2).toHaveLength(0)
    })
  })
})