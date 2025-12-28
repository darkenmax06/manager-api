import z, { number } from "zod"
import type { Request,Response,NextFunction } from "express"



function validateComment (req:Request,_:Response,next:NextFunction){
  const userSchema = z.object({
    title: z.string("Debes proporcionar un titlo para poder realizar esta accion").min(2,"El titulo debe tener un minimo de 2 caracteres").max(100,"EL titulo debe tener un maximo de 100 caracteres"),
    reply_to: z.email("Debes proporcionar el email para poder realizar esta accion").min(5,"El email debe tener un minimo de 5 caracteres").max(100,"EL email debe tener un maximo de 100 caracteres"),
    comment: z.string("Debes proporcionar el mensaje").min(2,"El mensaje debe tener un minimo de 2 caracteres").max(500,"El mensaje debe tener un maximo de 500 caracteres")
  })

  const result = userSchema.safeParse(req.body)

  if (result.success) return next() 
  else {
    return next({name: "zodError", data: result.error.issues[0]})
  }
}

export {validateComment}