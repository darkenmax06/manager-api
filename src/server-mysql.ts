import { v1,connection } from "./mysql-config.js"
import { Server } from "./index.js"
import { exit } from "node:process"

const [app,port] = Server({connection,v1})

if (!app ) {
  console.log("HA OCURRIDO UN ERROR CON EL SERVER")
  exit(1)
} 

app.listen(port,()=> {
  console.log("SERVER READY")
})