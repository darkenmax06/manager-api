import {beforeAll, describe, expect, it, afterAll} from "vitest"
import { Server } from "../../index.js"
import {connection,v1} from "../../mysql-config.js"
import request from "supertest"
import { after, before } from "node:test"
import type { RowDataPacket } from "mysql2"


describe("AppoimentsConfig tests -------------------------------------------------------", ()=> {
  const [app] = Server({v1,connection})
  const testUser = {"email":"test@example.com","password":"test1234", "name":"Test User"}
  const testUserLoginData = {"email": testUser.email, "password": testUser.password}
  const adminUserLoginData = {"email":"ramsesgonzalez20066@gmail.com","password":"12345678"}
  let userId = null

  beforeAll(async ()=> {
    const adminUserResult = await request(app).post("/api/v1/login").send(adminUserLoginData)
    const token = adminUserResult.body.token
    // Crear usuario de prueba
    await request(app).post("/api/v1/users")
    .set({"Authorization": `Bearer ${token}`})
    .send(testUser)
  })

  afterAll( async ()=> {
    // Se hace esta validacion porque al ejecutarse en paralelo los tests puede ser que el documento de test de users ya lo haya eliminado
    const [[validateIfTheUserExists]] = await connection.query<RowDataPacket[]>("SELECT user_id FROM Parsed_user WHERE email = ?", [testUser.email])
    if (validateIfTheUserExists)  {
      const adminUserResult = await request(app).post("/api/v1/login").send(adminUserLoginData)
      // Eliminar usuario de prueba
      await request(app).delete("/api/v1/users/" + validateIfTheUserExists.user_id)
      .set({"Authorization": `Bearer ${adminUserResult.body.token}`})
      .send()
    }
  })

  describe("get appoiments config",()=> {
    it("get appoiments config without accesToken", async ()=> {
      const result = await request(app).get("/api/v1/appoiments/config").send()

      expect(result.statusCode).toBe(401)
      expect(result.body).toHaveProperty("error")
      expect(result.body.error).toContain("necesario para realizar esta accion")
    })

    it("get appoiments config with malformed accesToken", async ()=> {
      const result = await request(app).get("/api/v1/appoiments/config")
      .set({"Authorization": "Bearer invalid_token"})
      .send()

      expect(result.statusCode).toBe(401)
      expect(result.body).toHaveProperty("error")
      expect(result.body.error).toContain("El token de acceso es invalido")
    })

    it ("get appoiments config with accesToken", async ()=> {
      const user = await request(app).post("/api/v1/login").send(testUserLoginData)
      const token = user.body.token

      const result = await request(app).get("/api/v1/appoiments/config")
      .set("Authorization", `Bearer ${token}`)
      .send()

      expect(result.statusCode).toBe(200)
      expect(result.body).toBeInstanceOf(Array)
      expect(result.body.length).toBe(7)
    })
  })

  describe("update appoiments config",()=> {
    it ("update appoiments config without accesToken", async ()=> {
      const result = await request(app).patch("/api/v1/appoiments/config/1").send({
        begin_hour: "09:00",
        finish_hour: "17:00",
        work: true
      })  
      expect(result.statusCode).toBe(401)
      expect(result.body).toHaveProperty("error")
      expect(result.body.error).toContain("necesario para realizar esta accion")
    })

    it ("update appoiments config with malformed accesToken", async ()=> {
      const result = await request(app).patch("/api/v1/appoiments/config/1")
      .set({"Authorization": "Bearer invalid_token"})   
      .send({
        begin_hour: "09:00:00",
        finish_hour: "17:00:00",
        work: true
      })  
      expect(result.statusCode).toBe(401)
      expect(result.body).toHaveProperty("error")
      expect(result.body.error).toContain("El token de acceso es invalido")
    })

    it ("try to update appoiments config with invalid dac_id", async ()=> {
      const user = await request(app).post("/api/v1/login").send(testUserLoginData)
      const token = user.body.token 
      const result = await request(app).patch("/api/v1/appoiments/config/invalid_dac_id")
      .set({"Authorization": `Bearer ${token}`})
      .send({
        begin_hour: "09:00:00", 
        finish_hour: "17:00:00",
        work: true
      })  
      expect(result.statusCode).toBe(400)
      expect(result.body).toHaveProperty("error")
      expect(result.body.error).toContain("La id es requerida")
    })

    it ("try to update appoiments config without begin_hour", async ()=> {
      const user = await request(app).post("/api/v1/login").send(testUserLoginData)
      const token = user.body.token 
      const result = await request(app).patch("/api/v1/appoiments/config/1")
      .set({"Authorization": `Bearer ${token}`})
      .send({
        finish_hour: "17:00:00",
        work: true    
      })    
      expect(result.statusCode).toBe(400)
      expect(result.body).toHaveProperty("error")
      expect(result.body.error).toContain("no es valido")
    })

    it ("try to update appoiments config without finish_hour", async ()=> {
      const user = await request(app).post("/api/v1/login").send(testUserLoginData)
      const token = user.body.token 
      const result = await request(app).patch("/api/v1/appoiments/config/1")
      .set({"Authorization": `Bearer ${token}`})
      .send({
        begin_hour: "09:00:00",
        work: true  
      })  
      expect(result.statusCode).toBe(400)
      expect(result.body).toHaveProperty("error")
      expect(result.body.error).toContain("no es valido")
    })


    it ("update appoiments config with invalid hours", async ()=> {
      const user = await request(app).post("/api/v1/login").send(testUserLoginData)
      const token = user.body.token 

      const result = await request(app).patch("/api/v1/appoiments/config/1")
      .set({"Authorization": `Bearer ${token}`})   
      .send({
        begin_hour: "18:00:00",
        finish_hour: "17:00:00",
        work: true    
      })  
      expect(result.statusCode).toBe(400)
      expect(result.body).toHaveProperty("error")
      expect(result.body.error).toContain("no es valido")
    })

    it ("update appoiments config with accesToken", async ()=> {
      const user = await request(app).post("/api/v1/login").send(testUserLoginData)
      const token = user.body.token

      const result = await request(app).patch("/api/v1/appoiments/config/1")
      .set({"Authorization": `Bearer ${token}`})   
      .send({
        begin_hour: "09:00:00",
        finish_hour: "17:00:00",
        work: true
      })

      const [[modifiedAppoimentConfig]] = await connection.query<RowDataPacket[]>("SELECT * FROM Day_appoiment_config WHERE dac_id = ?", [1])
      if (!modifiedAppoimentConfig) throw new Error("No se encontro la configuracion de citas modificada")
      
      expect(result.statusCode).toBe(200)
      expect(result.body).toHaveProperty("dac_id")
      expect(result.body.dac_id).toBe(1)
      expect(result.body).toHaveProperty("begin_hour")
      expect(result.body).toHaveProperty("finish_hour")
      expect(result.body).toHaveProperty("work")

      expect(modifiedAppoimentConfig.begin_hour).toBe("09:00:00")
    })
  })
})