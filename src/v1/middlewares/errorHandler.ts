import type { NextFunction, Request, Response } from "express";


function errorHandler (err:any,req:Request,res:Response,next:NextFunction) {
  const {name}:{name: string} = err
  console.log(name)
  console.log(err)

  if (process.env.NODE_ENV == "development") console.log(err)

  const errorResponses: Record<string, () => Response> = {
    "zodError": ()=> {
      const {data} = err
      return res.status(400).json({error:data.message})
    },
    "USER_NOT_FOUND": ()=> res.status(404).json({error: "Usuario no encontrado con la id proporcionada", logout: true}),
    "INVALID_ID": ()=> res.status(404).json({error: "La id proporcionada no es valida"}),
    "INCOHERENCE_DATA": ()=> {
      const [a,b] = err.data
      return res.status(404).json({error: `Los datos ${a} y ${b} no pueden estar desabilidatos.`})
    },
    "ER_WRONG_VALUE_FOR_TYPE": ()=> res.status(404).json({error: "La uuid proporcionada no es valida"}),
    "ID_REQUIRED": ()=> res.status(400).json({error: "La id es requerida para realizar esta accion"}),
    "INVALID_LOGIN": ()=> res.status(400).json({error: "El email o la contraseña proporcionadas no son validos"}),
    "TOKEN_REQUIRED": ()=> res.status(400).json({error: "El token de acceso es necesario para realizar esta accion"}),
    "WRONG_CREDENTIALS": ()=> res.status(400).json({error: "No tienes los permisos necesarios para realizar esta accion"}),
    "MAIL_NO_SEND": ()=> res.status(400).json({error: "No se pudo enviar el email"}),
    "SECRET_KEY_LOST": ()=> res.status(400).json({error: "LLave secreta no encontrada, contactate con el proveedor de servicio"})
  }

  
  const defaultError = (): Response => res.status(500).json({error: "Ha ocurrido un error, Por favor contactar con el provedor"})

  const handler =  errorResponses[name] || defaultError
  return handler()
}

export default errorHandler