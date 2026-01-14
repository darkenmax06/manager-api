import express from "express"
import type { serverProps } from "./server.interface.js"
import cors from "cors"
import type { Express } from "express"
import routesV1 from "./v1/routes/routesV1.js"

function Server ({connection,v1}:serverProps): [Express,number]{
  const app = express()

  app.disable("x-powered-by")

  app.use(cors())
  app.use(express.json())

  app.get("/",(_,res,next)=> {
    res.json({message: "Api activa!"})
  })

  // v1
  app.use("/api/v1",routesV1(v1))

  app.use((req,res)=> {
    res.status(404).json({error: "Recurso no encontrado"})
  })

  const PORT = Number(process.env.port) || 3000

  return [app,PORT]
}

export {Server}