import "dotenv/config"
import mysql2 from "mysql2/promise"
import {Server} from "./index.js"
import type { Pool } from "mysql2/promise"
import modelsV1 from "./v1/models/models-v1.js"
import type { v1 } from "./v1/interfaces/models.interface.js"
import "./v1/services/sendEmails.js"

const {
  PRODUCTION_DB_NAME,
  PRODUCTION_DB_PORT,
  PRODUCTION_DB_PASSWORD,
  PRODUCTION_DB_USER,
  PRODUCTION_DB_HOST,
  DEVELOPMENT_DB_NAME,
  DEVELOPMENT_DB_PORT,
  DEVELOPMENT_DB_PASSWORD,
  DEVELOPMENT_DB_USER,
  DEVELOPMENT_DB_HOST,
  NODE_ENV
} = process.env

let connection:Pool
const connectionUri : string = NODE_ENV == "development" 
? `mysql://${DEVELOPMENT_DB_USER}:${DEVELOPMENT_DB_PASSWORD}@${DEVELOPMENT_DB_HOST}:${DEVELOPMENT_DB_PORT}/${DEVELOPMENT_DB_NAME}`
: `mysql://${PRODUCTION_DB_USER}:${PRODUCTION_DB_PASSWORD}@${PRODUCTION_DB_HOST}:${PRODUCTION_DB_PORT}/${PRODUCTION_DB_NAME}`


try {
  connection = await mysql2.createPool({
    uri: connectionUri,
    
    // --- CONFIGURACIÓN DE SUPERVIVENCIA ---
    waitForConnections: true,
    connectionLimit: 10,       // Ajusta según tu necesidad
    queueLimit: 0,
    
    // 1. Matar conexiones inactivas antes que MySQL lo haga
    idleTimeout: 60000,        // 60 segundos (cierra conexiones sin uso)
    
    // 2. Verificar que la conexión sirva antes de usarla
    enableKeepAlive: true,     
    keepAliveInitialDelay: 10000 
  });
  console.log("DATABASE CONNECTED")
} catch (err){
  console.log(err)
  process.exit(1)
}


const v1:v1 = modelsV1(connection)

Server({connection,v1})