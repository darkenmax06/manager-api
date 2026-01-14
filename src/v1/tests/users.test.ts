import { describe,it,expect, afterAll} from "vitest";
import { Server } from "../../index.js";
import { connection,v1 } from "../../mysql-config.js";
import request from "supertest";
import type { RowDataPacket } from "mysql2";

describe("Validate user management", () => {
  const [app] = Server({connection,v1})
  const user = {"name":"Ramses","email": "RAMSES@GMAIL.COM", "password": "12345678"}
  const adminUserAccess = {"email":"ramsesgonzalez20066@gmail.com", "password": "12345678"}
  const regularUserAccess = {"email":user.email,"password":user.password}

  afterAll( async ()=> {
    // Delete test user
    const [[u]] = await connection.query<RowDataPacket[]>("SELECT * FROM Parsed_user WHERE email != 'ramsesgonzalez20066@gmail.com'")

    if (!u) return null

    await connection.query("DELETE FROM Day_appoiment_config WHERE user_id = UUID_TO_BIN(?)", [u.user_id])
    await connection.query("DELETE FROM Users WHERE email = ?", [u.email])
  })

  describe("User login -------------------------------------------------------", ()=> {
    it("sould to failed to login with a empty password, it should to return with status 400 and with the property error", async ()=> {
      const response = await request(app).post("/api/v1/login").send({email:"ramsesgonzalez20066@gmail.com",password:""})
      expect(response).toHaveProperty("status",400)
      expect(response.body).toHaveProperty("error")
      expect(response.body.error).toContain("8 caracteres")
    })

    it("sould to failed to login with a empty email, it should to return with status 400 and with the property error", async ()=> {
      const response = await request(app).post("/api/v1/login").send({email:"",password:"12345678"})
      expect(response).toHaveProperty("status",400)
      expect(response.body).toHaveProperty("error")
      expect(response.body.error).toContain("email")
    })

    it("sould to login with the admin account and and return the accessToken", async ()=> {
      const response = await request(app).post("/api/v1/login").send({email:"ramsesgonzalez20066@gmail.com",password:"12345678"})
      expect(response).toHaveProperty("status",200)
      expect(response.body).toHaveProperty("token")
    })
  })

  describe("User creation -------------------------------------------------------", ()=> {
    it("sould to failed in create user without accessToken", async ()=> {
      const response = await request(app).post("/api/v1/users")
      .send(user)

      expect(response).toHaveProperty("status",401)
      expect(response.body).toHaveProperty("error")
      expect(response.body.error).toContain("token")
    })

    it("sould to failed in create user with empty password", async ()=> {
      const res = await request(app).post("/api/v1/login").send(adminUserAccess)
      const accessToken = res.body.token

      const {password,...restOfUser} = user
      const response = await request(app).post("/api/v1/users")
      .send(restOfUser)
      .set("Authorization", `Bearer ${accessToken}`)

      expect(response).toHaveProperty("status",400)
      expect(response.body).toHaveProperty("error")
      expect(response.body.error).toContain("contraseña")
    })

    it("should to failed in create user with empty email", async ()=> {
      const res = await request(app).post("/api/v1/login").send(adminUserAccess)
      const accessToken = res.body.token

      const {email,...restOfUser} = user
      const response = await request(app).post("/api/v1/users")
      .send(restOfUser)
      .set("Authorization", `Bearer ${accessToken}`)

      expect(response).toHaveProperty("status",400)
      expect(response.body).toHaveProperty("error")
      expect(response.body.error).toContain("email")
    })

    it("should to failed in create user with empty name", async ()=> {
      const res = await request(app).post("/api/v1/login").send(adminUserAccess)
      const accessToken = res.body.token

      const {name,...restOfUser} = user
      const response = await request(app).post("/api/v1/users")
      .send(restOfUser)

      .set("Authorization", `Bearer ${accessToken}`)
      expect(response).toHaveProperty("status",400)
      expect(response.body).toHaveProperty("error")
      expect(response.body.error).toContain("nombre")
    })

    it("should to create a user with uppercase email and return it in lowercase", async ()=> {
      const res = await request(app).post("/api/v1/login").send(adminUserAccess)
      const accessToken = res.body.token

      const response = await request(app).post("/api/v1/users")
      .send(user)
      .set("Authorization", `Bearer ${accessToken}`)

      expect(response).toHaveProperty("status",200)
      expect(response.body).toHaveProperty("email")
      expect(response.body.email).toEqual(user.email.toLowerCase())
    })

    it("should to failed to create a user with a existing email", async ()=> {
      const res = await request(app).post("/api/v1/login").send(adminUserAccess)
      const accessToken = res.body.token

      const response = await request(app).post("/api/v1/users")
      .send(user)
      .set("Authorization", `Bearer ${accessToken}`)

      expect(response).toHaveProperty("status",400)
      expect(response.body).toHaveProperty("error")
      expect(response.body.error).toContain("Ya existe")
    })

    it("login with new user should to return the accessToken", async ()=> {
      const response = await request(app).post("/api/v1/login")
      .send({email:user.email,password:user.password})
      expect(response).toHaveProperty("status",200)
      expect(response.body).toHaveProperty("token")
    })
  })

  describe("Get users -------------------------------------------------------", ()=> {
    it("try to get users without accessToken, it should to return with status 400 and with the property error", async ()=> {
      const response = await request(app)
      .get("/api/v1/users")
      expect(response).toHaveProperty("status",401)
      expect(response.body).toHaveProperty("error")
      expect(response.body.error).toContain("token")
    })

    it("try to get users with an invalid accessToken, it should to return with status 401 and with the property error", async ()=> {
      const response = await request(app)
      .get("/api/v1/users")
      .set("Authorization", `Bearer asdasd`)
      expect(response).toHaveProperty("status",401)
      expect(response.body).toHaveProperty("error")
      expect(response.body.error).toContain("invalido")
    })

    it("try to get users with a regular user accessToken, it should to return with status 401 and with the property error", async ()=> {
      const res = await request(app).post("/api/v1/login").send(regularUserAccess)
      const accessToken = res.body.token

      const response = await request(app)
      .get("/api/v1/users")
      .set("Authorization", `Bearer ${accessToken}`)
      expect(response).toHaveProperty("status",401)
      expect(response.body).toHaveProperty("error")
      expect(response.body.error).toContain("No tienes los permisos")
    })

    it("try to get users it should to response with 2 users", async ()=> {
      const res = await request(app).post("/api/v1/login").send(adminUserAccess)
      const accessToken = res.body.token

      const response = await request(app)
      .get("/api/v1/users")
      .set("Authorization", `Bearer ${accessToken}`)
      expect(response).toHaveProperty("status",200)
      expect(response.body).toHaveLength(2)
    })
  })

  describe("update user -------------------------------------------------------", ()=> {
    it("try to update user without accessToken, it should to return with status 400 and with the property error", async ()=> {
      const response = await request(app)
      .patch("/api/v1/users/some-user-id")
      expect(response).toHaveProperty("status",401)
      expect(response.body).toHaveProperty("error")
      expect(response.body.error).toContain("token")
    })

    it("try to update user with an invalid accessToken, it should to return with status 401 and with the property error", async ()=> {
      const response = await request(app)
      .patch("/api/v1/users/some-user-id")
      .set("Authorization", `Bearer asdasd`)
      expect(response).toHaveProperty("status",401)
      expect(response.body).toHaveProperty("error")
      expect(response.body.error).toContain("invalido")
    })

    it("try to update user with a regular user accessToken, it should to return with status 401 and with the property error", async ()=> {
      const res = await request(app).post("/api/v1/login").send(regularUserAccess)
      const accessToken = res.body.token

      const [[userToUse]] = await connection.query<RowDataPacket[]>("SELECT * FROM Parsed_user WHERE email = ?", [user.email.toLowerCase()])
      if (!userToUse) throw new Error("Test user not found")

      const comment_title_name = "Nuevo comentario"

      const response = await request(app)
      .patch("/api/v1/users/" + userToUse.user_id)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({"comment_title_name": comment_title_name,...user})

      const [[userNotModified]] = await connection.query<RowDataPacket[]>("SELECT * FROM Parsed_user WHERE email = ?", [user.email.toLowerCase()])

      if (!userNotModified) throw new Error("Test user not found")

      expect(response).toHaveProperty("status",401)
      expect(response.body).toHaveProperty("error")
      expect(userNotModified.comment_title_name).not.toEqual(comment_title_name)
      expect(response.body.error).toContain("No tienes los permisos")
    })

    it("try to update user with a bad id it should to response with the 404 error", async ()=> {
      const res = await request(app).post("/api/v1/login").send(adminUserAccess)
      const accessToken = res.body.token

      const comment_title_name = "Nuevo comentario"

      const [[userToModified]] = await connection.query<RowDataPacket[]>("SELECT * FROM Parsed_user WHERE email = ?", [user.email.toLowerCase()])
      if (!userToModified) throw new Error("Test user not found")

      const response = await request(app)
      .patch("/api/v1/users/123456")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({"comment_title_name": comment_title_name,...user})

      expect(response).toHaveProperty("status",404)
      expect(response.body).toHaveProperty("error")
      expect(response.body.error).toContain("no encontrado")
    } )

    it("try to update user it should to response with the updated user data it should to respond with the updated user data", async ()=> {
      const res = await request(app).post("/api/v1/login").send(adminUserAccess)
      const accessToken = res.body.token

      const comment_title_name = "Nuevo comentario"

      const [[userToModified]] = await connection.query<RowDataPacket[]>("SELECT * FROM Parsed_user WHERE email = ?", [user.email.toLowerCase()])
      if (!userToModified) throw new Error("Test user not found")

      const response = await request(app)
      .patch("/api/v1/users/" + userToModified.user_id)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({"comment_title_name": comment_title_name,...user})

      const [[userModified]] = await connection.query<RowDataPacket[]>("SELECT * FROM Parsed_user WHERE email = ?", [user.email.toLowerCase()])
      if (!userToModified) throw new Error("Test user not found")

      expect(response).toHaveProperty("status",200)
      expect(response.body).toHaveProperty("comment_title_name", comment_title_name)
      expect(userModified).toHaveProperty("comment_title_name", comment_title_name)
    } )
  })

  describe("delete user -------------------------------------------------------", ()=> {
    it("try to delete user without accessToken, it should to return with status 400 and with the property error", async ()=> {
      const [[userToDelete]] = await connection.query<RowDataPacket[]>("SELECT * FROM Parsed_user WHERE email = ?", [user.email.toLowerCase()])
      if (!userToDelete) throw new Error("Test user not found")

      const response = await request(app)
      .delete("/api/v1/users/" + userToDelete.user_id)
      .send()

      expect(response).toHaveProperty("status",401)
      expect(response.body).toHaveProperty("error")
      expect(response.body.error).toContain("token")
    })

    it("try to delete user with an invalid accessToken, it should to return with status 401 and with the property error", async ()=> {
      const [[userToDelete]] = await connection.query<RowDataPacket[]>("SELECT * FROM Parsed_user WHERE email = ?", [user.email.toLowerCase()])
      if (!userToDelete) throw new Error("Test user not found")

      const response = await request(app)
      .delete("/api/v1/users/" + userToDelete.user_id)
      .set("Authorization", `Bearer asdasd`)
      expect(response).toHaveProperty("status",401)
      expect(response.body).toHaveProperty("error")
      expect(response.body.error).toContain("invalido")
    })

    it("try to delete user with a regular user accessToken, it should to return with status 401 and with the property error", async ()=> {
      const res = await request(app).post("/api/v1/login").send(regularUserAccess)
      const accessToken = res.body.token

      const [[userToDelete]] = await connection.query<RowDataPacket[]>("SELECT * FROM Parsed_user WHERE email = ?", [user.email.toLowerCase()])
      if (!userToDelete) throw new Error("Test user not found")

      const response = await request(app)
      .delete("/api/v1/users/" + userToDelete.user_id)
      .set("Authorization", `Bearer ${accessToken}`)
      expect(response).toHaveProperty("status",401)
      expect(response.body).toHaveProperty("error")
      expect(response.body.error).toContain("No tienes los permisos")
    })

    it("try to delete user it should to response with status 204", async ()=> {
      const res = await request(app).post("/api/v1/login").send(adminUserAccess)
      const accessToken = res.body.token  

      const [[userToDelete]] = await connection.query<RowDataPacket[]>("SELECT * FROM Parsed_user WHERE email = ?", [user.email.toLowerCase()])
      if (!userToDelete) throw new Error("Test user not found")

      const response = await request(app)
      .delete("/api/v1/users/" + userToDelete.user_id)
      .set("Authorization", `Bearer ${accessToken}`)

      const [[emptyUser]] = await connection.query<RowDataPacket[]>("SELECT * FROM Parsed_user WHERE email = ?", [user.email.toLowerCase()])

      expect(response).toHaveProperty("status",204)
      expect(emptyUser).toBeUndefined()
    } )
  })

} )