import express from "express"
import type { serverProps } from "./server.interface.js"
import cors from "cors"
import routesV1 from "./v1/routes/routesV1.js"

function Server ({connection,v1}:serverProps){
  const app = express()

  app.use(cors())
  app.use(express.json())

  app.get("/",(req,res,next)=> {
    res.json({message: "Api activa!"})
  })

  // v1
  app.use("/api/v1",routesV1(v1))

  const PORT = process.env.port || 3000

  app.listen(PORT, ()=> {
    console.log("Server is ready")
    console.log("Server on port: ", PORT)
  })
}

export {Server}