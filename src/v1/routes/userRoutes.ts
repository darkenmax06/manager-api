import { Router } from "express";
import type { TokenId, User, UserInput, UserModel } from "../interfaces/models.interface.js";
import { validateCreationUser, validateUpdateUser } from "../middlewares/validateUser.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

function userRouter ({userModel}:{userModel: UserModel}){
  const router = Router()

  router.get("/", async (req,res,next) => {
    try{
      const users = await userModel.getAll()
      res.json(users)
    } catch (err) {
      next(err)
    }
  })

  router.get("/:user_id", async (req,res,next) => {
    const {user_id} = req.params
    if (!user_id) return next({name: "ID_REQUIRED"})
    const {authorization} = req.headers
    const {SECRET_KEY} = process.env

    console.log(authorization)

    let token = null

    if (typeof authorization == "string" && authorization.toLowerCase().startsWith("bearer")){
      token = authorization.split(" ")[1]
    }

    console.log(token)

    if (!token) return next({name: "TOKEN_REQUIRED"})

    try {
      if (!SECRET_KEY) throw {name: "SECRET_KEY_LOST"}
      const verify = jwt.verify(token,SECRET_KEY) as TokenId
      
      const validateUer = await userModel.getFullUserById({userId: verify.user_id})
      if (validateUer.role !== "admin") throw {name: "WRONG_CREDENTIALS"}

      const user = await userModel.getFullUserById({userId: user_id})
      res.json(user)
    } catch (err) {
      next(err)
    }
  })

  router.post("/",validateCreationUser, async (req,res,next)=> {
    const {name, email, password}: UserInput = req.body
    const {authorization} = req.headers
    const {SECRET_KEY} = process.env

    console.log(authorization)

    let token = null

    if (typeof authorization == "string" && authorization.toLowerCase().startsWith("bearer")){
      token = authorization.split(" ")[1]
    }

    console.log(token)

    if (!token) return next({name: "TOKEN_REQUIRED"})

    try {
      if (!SECRET_KEY) throw {name: "SECRET_KEY_LOST"}
      const verify = jwt.verify(token,SECRET_KEY) as TokenId
      
      const validateUer = await userModel.getFullUserById({userId: verify.user_id})
      if (validateUer.role !== "admin") throw {name: "WRONG_CREDENTIALS"}

      const SALT_ROUNDS: number = 10
      const passwordHashed = await bcrypt.hash(password as string ,SALT_ROUNDS)

      const user = await userModel.create({name,email: email.toLowerCase(),password:passwordHashed})
      res.json(user)
    }catch (err){
      return next(err)
    }
  })

  router.patch("/:user_id",validateUpdateUser, async (req,res,next)=> {
    const {user_id} = req.params
    if (!user_id) return next({name: "ID_REQUIRED"})

    const updates: User = req.body
    const {authorization} = req.headers
    const {SECRET_KEY} = process.env

    console.log(authorization)

    let token = null

    if (typeof authorization == "string" && authorization.toLowerCase().startsWith("bearer")){
      token = authorization.split(" ")[1]
    }

    console.log(token)

    if (!token) return next({name: "TOKEN_REQUIRED"})

    try {
      if (!SECRET_KEY) throw {name: "SECRET_KEY_LOST"}
      const verify = jwt.verify(token,SECRET_KEY) as TokenId
      
      const validateUer = await userModel.getFullUserById({userId: verify.user_id})
      if (validateUer.role !== "admin") throw {name: "WRONG_CREDENTIALS"}
      const user = await userModel.getFullUserById({userId: user_id})
      if (!user) return next ({name: "INVALID_ID"})

      const SALT_ROUNDS: number = 10
      const passwordHashed = await bcrypt.hash(updates.password as string,SALT_ROUNDS)

      const newUser = await userModel.update({
        ...updates,
        email: updates.email.toLowerCase(),
        password:passwordHashed,
        userId: user_id
      })

      res.json(newUser)
    }catch (err:any){
      if (err.code){
        return next({name: err.code, ...err})
      }
      return next(err)
    }
  })

  router.delete("/:user_id", async (req,res,next)=> {
    const {user_id} = req.params
    if (!user_id) return next({name: "ID_REQUIRED"})
    const {authorization} = req.headers
    const {SECRET_KEY} = process.env

    console.log(authorization)

    let token = null

    if (typeof authorization == "string" && authorization.toLowerCase().startsWith("bearer")){
      token = authorization.split(" ")[1]
    }

    console.log(token)

    if (!token) return next({name: "TOKEN_REQUIRED"})

    try {
      if (!SECRET_KEY) throw {name: "SECRET_KEY_LOST"}
      const verify = jwt.verify(token,SECRET_KEY) as TokenId
      
      const validateUer = await userModel.getFullUserById({userId: verify.user_id})
      if (validateUer.role !== "admin") throw {name: "WRONG_CREDENTIALS"}

      await userModel.delete({userId: user_id})
      res.status(204).send()
    }catch (err:any){
      if (err.code){
        return next({name: err.code, ...err})
      }
      return next(err)
    }
  })
  
  return router
}

export default userRouter