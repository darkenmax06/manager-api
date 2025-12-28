import "dotenv/config"
import mysql2 from "mysql2/promise"
import {Server} from "./index.js"
import type { Pool } from "mysql2/promise"
import modelsV1 from "./v1/models/models-v1.js"
import type { v1 } from "./v1/interfaces/models.interface.js"
import "./v1/services/sendEmails.js"

const {
  DB_NAME,
  DB_PORT,
  DB_PASSWORD,
  DB_USER,
  DB_HOST
} = process.env

let connection:Pool
const connectionUri : string = `mysql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`

try {
  connection = await mysql2.createPool(connectionUri)
  console.log("Bases de datos conectada!")
} catch (err){
  console.log(err)
  process.exit(1)
}


const v1:v1 = modelsV1(connection)

Server({connection,v1})