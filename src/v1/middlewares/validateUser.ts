import z, { number } from "zod"
import type { Request,Response,NextFunction } from "express"



function validateCreationUser (req:Request,_:Response,next:NextFunction){
  const userSchema = z.object({
    name: z.string("Debes proporcionar el nombre para crear un usuario").min(2,"El nombre debe tener un minimo de 2 caracteres").max(100,"EL nombre debe tener un maximo de 100 caracteres"),
    email: z.email("Debes proporcionar el email para crear un usuario").min(5,"El email debe tener un minimo de 5 caracteres").max(100,"EL email debe tener un maximo de 100 caracteres"),
    password: z.string("Debes proporcionar la contraseña para crear un usuario").min(8,"La contraseña debe tener un minimo de 8 caracteres").max(100,"La contraseña debe tener un maximo de 100 caracteres")
  })

  const result = userSchema.safeParse(req.body)

  if (result.success) return next() 
  else {
    return next({name: "zodError", data: result.error.issues[0]})
  }
}

function validateLogin (req:Request,_:Response,next:NextFunction){
  const userSchema = z.object({
    email: z.email("Debes proporcionar el email para poder loguearte").min(5,"El email debe tener un minimo de 5 caracteres").max(100,"EL email debe tener un maximo de 100 caracteres"),
    password: z.string("Debes proporcionar la contraseña para poder loguearte").min(8,"La contraseña debe tener un minimo de 8 caracteres").max(100,"La contraseña debe tener un maximo de 100 caracteres")
  })

  const result = userSchema.safeParse(req.body)

  if (result.success) return next() 
  else {
    return next({name: "zodError", data: result.error.issues[0]})
  }
}

function validateUpdateUser (req:Request,_:Response,next:NextFunction){
  const userSchema = z.object({
    name: z.string("Debes proporcionar el nombre para crear un usuario").min(2,"El nombre debe tener un minimo de 2 caracteres").max(100,"EL nombre debe tener un maximo de 100 caracteres"),
    email: z.email("Debes proporcionar el email para crear un usuario").min(5,"El email debe tener un minimo de 5 caracteres").max(100,"EL email debe tener un maximo de 100 caracteres"),
    password: z.string("Debes proporcionar la contraseña para crear un usuario").min(8,"La contraseña debe tener un minimo de 8 caracteres").max(100,"La contraseña debe tener un maximo de 100 caracteres"),
    comment_title_name: z.string("Debes proporcionar el nombre para el campo titulo  para realizar esta accion"),
     
  })

  const result = userSchema.safeParse(req.body)

  if (result.success) return next() 
  else {
    return next({name: "zodError", data: result.error.issues[0]})
  }
}

export {validateCreationUser,validateUpdateUser,validateLogin}