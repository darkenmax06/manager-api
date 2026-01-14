import {describe, it, expect, beforeAll, afterAll} from "vitest"
import type { RowDataPacket} from "mysql2/promise"
import { Server } from "../../index.js";
import { connection, v1 } from "../../mysql-config.js";
import request from "supertest"


describe("API AND DB ITS OK", ()=> {
  const [app] = Server({connection,v1})

  it("api should to responde with code 200", async ()=> {
  const res = await request(app).get("/")
    expect(res.status).toBe(200)
  })

  it("bdd should to response", async ()=> {
    const [[result]] = await connection.query<RowDataPacket[]>("SELECT 1 AS result")
    expect(result?.result).toEqual(1)
  })

  it("bdd should to have the Appoiments table", async ()=> {
    const [result] = await connection.query<RowDataPacket[]>("SHOW TABLES from Mails_test")
    expect(result[0]?.Tables_in_mails_test).toContain("appoiments")
  })
})