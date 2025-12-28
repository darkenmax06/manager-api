import type { Pool } from "mysql2/promise"
import type { UserModel } from "../interfaces/models.interface.js"
import Users from "./User.js"
import Comments from "./Comment.js"

function modelsV1 (connection: Pool){
  const userModel = new Users(connection)
  const commentModel = new Comments(connection)

  return {
    userModel,
    commentModel
  }
}

export default modelsV1