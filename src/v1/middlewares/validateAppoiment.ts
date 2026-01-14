import z from "zod"
import type { Request,Response,NextFunction } from "express"



function validateAppoiment (req:Request,_:Response,next:NextFunction){
  const userSchema = z.object({
    name: z.string("Debes proporcionar a nombre de quien estara la cita para para poder agendar").min(2,"El minimo de caracteres para el nombre es de 2").max(50,"El maximo de caracteres para el nombre es 50"),
    date: z.string("Debes proporcionar en que fecha sera la cita para para poder agendar"),
    begin_hour: z.string("Debes proporcionar una hora de inicio para poder agendar"),
    finish_hour: z.string("Debes proporcionar una hora de finalizacion para poder agendar"),
    phone: z.string("Debes proporcionar un numero de telefono para para poder agendar").min(10,"Numero telefonico incompleto").max(100,"Numero telefonico muy largo"),
    comment: z.string("Debes proporcionar el mensaje").max(300,"El mensaje debe tener un maximo de 300 caracteres").optional(),
    persons: z.string("Debes proporcionar la cantidad de personas para poder agendar").min(1,"Debe haber al menos 1 persona para la reservacion").optional()
  },"El tipo de dato que recibimos no es un JSON valido")

  const result = userSchema.safeParse(req.body)

  if (result.success) return next() 
  else {
    return next({name: "zodError", data: result.error.issues[0]})
  }
}

export {validateAppoiment}