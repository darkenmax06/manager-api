import { Router } from "express";
import userRouter from "./userRoutes.js";
import type { v1 } from "../interfaces/models.interface.js";
import errorHandler from "../middlewares/errorHandler.js";
import commentRouter from "./commentRoutes.js";
import loginRouter from "./loginRoutes.js";

function routesV1 (v1:v1){
  const router = Router()

  const {userModel,commentModel} = v1

  router.use("/users",userRouter({userModel}))
  router.use("/login",loginRouter({userModel}))
  router.use("/comments",commentRouter({commentModel,userModel}))

  router.use(errorHandler)

  return router
}

export default routesV1