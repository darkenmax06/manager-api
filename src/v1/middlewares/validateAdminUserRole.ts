import type { NextFunction,Request,Response } from "express";
import jwt from "jsonwebtoken"
import type { TokenId } from "../interfaces/models.interface.js";

async function validateAdminUserRole (req:Request,res:Response,next: NextFunction){
  const {authorization} = req.headers 
  const {SECRET_KEY} = process.env

  let token = null

  if (typeof authorization == "string" && authorization.toLowerCase().startsWith("bearer")){
    token = authorization.split(" ")[1]
  }

  if (!token) return next({name: "TOKEN_REQUIRED"})

  try {
    if (!SECRET_KEY) throw {name: "SECRET_KEY_LOST"}
    const {user_id} = jwt.verify(token,SECRET_KEY) as TokenId  

    const user = await
    req.headers.user = user
    next()   
  } catch (err) {
    next(err)
  }
}

export default validateAdminUserRole