import z from "zod"
import type { NextFunction } from "express"

function validateAppoimentConfigInput(req: Request, res: Response, next: NextFunction)  {
  const appoimentConfigSchema = z.object({
    begin_hour: z.string("Debes proporcionar la hora de inicio para poder actualizar tus horarios").regex(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, "Formato de hora inválido debe ser HH:MM:SS"),
    finish_hour: z.string("Debes proporcionar la hora de inicio para poder actualizar tus horarios").regex(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, "Formato de hora inválido debe ser HH:MM:SS"),
    work: z.boolean("Debes proporcionar si se trabaja o no en ese dia")
  })

  const validation = appoimentConfigSchema.safeParse(req.body)

  if (!validation.success) {
    return next({name: "zodError", data: validation.error.issues[0]})
  }

  next()
}


export default validateAppoimentConfigInput