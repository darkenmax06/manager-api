import { Router } from "express"
import validateToken from "../middlewares/validateToken.js"
import type { AppoimentModel } from "../interfaces/models.interface.js"
import { validateDateFormat } from "../services/validateDateFormat.js"
import { validateAppoiment } from "../middlewares/validateAppoiment.js"
import "../services/validateTimeDifference.js"
import validateTImeDifference from "../services/validateTimeDifference.js"


function appoimentRouter ({appoimentModel}:{appoimentModel: AppoimentModel}) {
  const router = Router()

  router.get("/", validateToken, async (req,res,next) => {
    const {user_id} = req.headers
    if (!user_id || typeof user_id != "string") return next({name: "ID_REQUIRED"})

    try {
      const result = await appoimentModel.getByUserId({userId: user_id})
      res.json(result)
    } catch (err){
      next(err)
    }
  })

  router.get("/:date", validateToken, async (req,res,next) => {
    const {date}= req.params
    const {user_id} = req.headers


    if (!user_id || typeof user_id != "string") return next({name: "ID_REQUIRED"})
    else if (!date) return next({name: "DATE_REQUIRED"})
    else if (validateDateFormat(date) == false) return next({name: "INVALID_DATE",date})

    try {
      const result = await appoimentModel.getAsignedHours({userId: user_id, date })

      res.json(result)
    } catch (err){
      next(err)
    }
  })

  router.post("/", validateToken, validateAppoiment, async (req,res,next) => {
    const {user_id} = req.headers
    const {begin_hour,comment,date,finish_hour,name,persons,phone} = req.body

    if (!user_id || typeof user_id != "string") return next({name: "ID_REQUIRED"})
    else if (!date) return next({name: "DATE_REQUIRED"})
    else if (validateDateFormat(date) == false) return next({name: "INVALID_DATE",date})
    else if (validateTImeDifference(begin_hour,finish_hour) == false) return next({name: "INVALID_HOURS",date})

    try {
      const dateToSend = new Date(date) // => formato mes/dia/year
      const result = await appoimentModel.create({begin_hour,comment,date:dateToSend,finish_hour,name,persons,phone,user_id})

      res.json(result)
    } catch (err:any){
      if (err?.code) return next({name: err.code == "ER_DUP_ENTRY" ? "APPOIMENT_ALREADY_EXITS" : err.code, ...err})
      else return next(err)
    }
  })

  router.patch("/:appoimentId", validateToken, validateAppoiment, async (req,res,next) => {
    const appoimentId = req.params.appoimentId && parseInt(req.params.appoimentId)

    const {user_id} = req.headers
    const {begin_hour,comment,date,finish_hour,name,persons,phone} = req.body

    if (!appoimentId || typeof appoimentId != "number") return next({name: "ID_REQUIRED"})
    if (!user_id || typeof user_id != "string") return next({name: "ID_REQUIRED"})
    else if (!date) return next({name: "DATE_REQUIRED"})
    else if (validateDateFormat(date) == false) return next({name: "INVALID_DATE",date})
    else if (validateTImeDifference(begin_hour,finish_hour) == false) return next({name: "INVALID_HOURS",date})


    try {
      const dateToSend = new Date(date) // => formato mes/dia/year
      const result = await appoimentModel.update({appoiment_id:appoimentId,begin_hour,comment,date:dateToSend,finish_hour,name,persons,phone,user_id})

      res.json(result)
    } catch (err:any){
      if (err?.code) return next({name: err.code == "ER_DUP_ENTRY" ? "APPOIMENT_ALREADY_EXITS" : err.code, ...err})
      else return next(err)
    }
  })

  router.delete("/:appoimentId", validateToken, async (req,res,next) => {
    const appoimentId = req.params.appoimentId && parseInt(req.params.appoimentId)
    const {user_id} = req.headers

    if (!appoimentId || typeof appoimentId != "number") return next({name: "ID_REQUIRED"})
    if (!user_id || typeof user_id != "string") return next({name: "ID_REQUIRED"})

    try {
      const result = await appoimentModel.delete({appoimentId,user_id})

      res.status(204).send()
    } catch (err:any){
      return next(err)
    }
  })

  return router
}

export default appoimentRouter