
import { Router } from "express";
import type {  User, UserInput, UserModel } from "../interfaces/models.interface.js";
import {  validateLogin } from "../middlewares/validateUser.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

function loginRouter ({userModel}:{userModel: UserModel}){
  const router = Router()

  router.post("/",validateLogin, async (req,res,next)=> {
    const {email, password}: UserInput = req.body

    try {
      const user = await userModel.getByEmail({email: email.toLowerCase()})

      console.log(user)

      const isCorrectPassword = await bcrypt.compare(password,user.password)
      console.log(isCorrectPassword)
      if (!isCorrectPassword) return next({name: "INVALID_LOGIN"})

      const SECRET_KEY = process.env.SECRET_KEY
      if (!SECRET_KEY) throw {name: "SECRET_KEY_LOST"}

      const token = jwt.sign({
        user_id: user.user_id
      },SECRET_KEY)

      const {password:_, user_id, ...restOfUser} = user

      const userToSend = {
        ...restOfUser,
        token
      }

      res.json(userToSend)
    }catch (err){
      return next(err)
    }
  })
  return router
}

export default loginRouter