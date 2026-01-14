import { Router } from "express";
import type { AppoimentsConfigModel, DayAppoimentConfigInput } from "../interfaces/models.interface.js";
import validateToken from "../middlewares/validateToken.js";
import validateTImeDifference from "../services/validateTimeDifference.js";

function appoimentConfigRouter ({appoimentConfigModel}: {appoimentConfigModel:AppoimentsConfigModel}){
  const router = Router()

  router.get("/", validateToken ,async (req,res,next) => {
    const {user_id} = req.headers

    if (!user_id || typeof user_id != "string") return next ({name: "ID_REQUIRED"})
    
    try {
      const appoimentConfig = await appoimentConfigModel.getAppoimentsRequierements({userId: user_id})
      res.json(appoimentConfig)
    } catch(err) {
      next(err)
    }
  })

  router.patch("/:dac_id", validateToken ,async (req,res,next) => {
    const {user_id} = req.headers
    const {dac_id} = req.params
    const {begin_hour,finish_hour,work}:DayAppoimentConfigInput = req.body

    if (!user_id || typeof user_id != "string") return next ({name: "ID_REQUIRED"})
    if (!dac_id || typeof dac_id != "string" || isNaN(parseInt(dac_id))) return next ({name: "ID_REQUIRED"})  
    else if (validateTImeDifference(begin_hour,finish_hour) == false) return next({name: "INVALID_HOURS",date: new Date()})
    
    try {
      const appoimentConfig = await appoimentConfigModel.updateAppoimentsRequierements({ begin_hour,finish_hour,work,dac_id: parseInt(dac_id) })
      res.json(appoimentConfig)
    } catch(err) {
      next(err)
    }
  })

  return router
}

export default appoimentConfigRouter