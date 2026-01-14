import { Router } from "express";
import userRouter from "./userRoutes.js";
import type { v1 } from "../interfaces/models.interface.js";
import errorHandler from "../middlewares/errorHandler.js";
import commentRouter from "./commentRoutes.js";
import loginRouter from "./loginRoutes.js";
import appoimentConfigRouter from "./appoimentConfigRoutes.js";
import appoimentRouter from "./AppoimentRoutes.js";

function routesV1 (v1:v1){
  const router = Router()

  const {userModel,commentModel,appoimentConfigModel,appoimentModel} = v1

  router.use("/users",userRouter({userModel}))
  router.use("/login",loginRouter({userModel}))
  router.use("/comments",commentRouter({commentModel,userModel}))
  router.use("/appoiments/config",appoimentConfigRouter({appoimentConfigModel}))
  router.use("/appoiments",appoimentRouter({appoimentModel}))

  router.use(errorHandler)

  return router
}

export default routesV1