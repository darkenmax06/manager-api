import "dotenv/config"
import mysql2 from "mysql2/promise"
import type { Pool } from "mysql2/promise"
import modelsV1 from "./v1/models/models-v1.js"
import "./v1/services/sendEmails.js"
import { exit } from "node:process"
import type { Node_env, V1 } from "./v1/interfaces/models.interface.js"

const {
  PRODUCTION_DB_URI,
  DEVELOPMENT_DB_URI,
  TEST_DB_URI,
  NODE_ENV 
}  = process.env


if (
  (typeof PRODUCTION_DB_URI != "string") ||
  (typeof DEVELOPMENT_DB_URI != "string") ||
  (typeof TEST_DB_URI != "string") ||
  (typeof NODE_ENV != "string")
) {
  console.log("VARIABLES DE ENTORNO PARA DB NO ENCONTRADAS O DEFINIDAS")
  exit(1)
}

const env = NODE_ENV as Node_env

const uris = {
  "development": DEVELOPMENT_DB_URI,
  "production": PRODUCTION_DB_URI,
  "test": TEST_DB_URI
} 


let connection:Pool
let connectionUri : string = uris[env] ?? uris["development"]

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
    keepAliveInitialDelay: 10000,
    multipleStatements: true 
  });
  console.log("DATABASE CONNECTED")
} catch (err){
  console.log(err)
  process.exit(1)
}

const v1:V1 = modelsV1(connection)


export {v1,connection}