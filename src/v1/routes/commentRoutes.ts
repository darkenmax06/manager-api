import { Router } from "express";
import type { CommentInput, CommentModel, UserModel} from "../interfaces/models.interface.js";
import { validateComment } from "../middlewares/validateMessage.js";
import validateToken from "../middlewares/validateToken.js";
import writeEmailComment from "../services/writeEmails.js";
import {sendEmails} from "../services/sendEmails.js";

function commentRouter ({commentModel,userModel}: {commentModel: CommentModel,userModel: UserModel}){
  const router = Router()

  router.get("/", validateToken,async (req,res,next)=> {
    const {user_id} = req.headers
    if (typeof user_id != "string") return next ({name: 'TOKEN_REQUIRED'})

    try {
      const comments = await commentModel.getByUserId({userId: user_id})
      res.json(comments)
    } catch(err){
      next(err)
    }
  })

  router.post("/", validateToken, validateComment, async (req,res, next) => {
    const {title,comment, reply_to}:CommentInput = req.body
    const {user_id} = req.headers
    if (typeof user_id != "string") return next ({name: 'TOKEN_REQUIRED'})

    try {
      const user = await userModel.getFullUserById({userId: user_id})
      const newComment = await commentModel.create({title,comment,reply_to: reply_to.toLowerCase(),user_id: user_id})

      const [text,html] = writeEmailComment(user.comment_title_name,title , reply_to ,comment)
      const result = await sendEmails(user.email,title,reply_to,text,html)
      if (!result) throw {name: "MAIL_NO_SEND"}
      
      res.json(newComment)
    } catch (err){
      next(err)
    }
  }) 
  
  router.delete("/:comment_id", validateToken , async (req,res, next) => {
    const {comment_id} = req.params
    const {user_id} = req.headers

    if (!comment_id ) return next({name: "ID_REQUIRED"})
    if (typeof user_id != "string") return next ({name: 'TOKEN_REQUIRED'})

    try {  
      await commentModel.delete({commentId: parseInt(comment_id),user_id})
      res.status(204).send()
    } catch (err){
      next(err)
    }
  })  

  return router
}


export default commentRouter