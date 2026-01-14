import type { Pool } from "mysql2/promise"
import Users from "./User.js"
import Comments from "./Comment.js"
import AppoimentsConfig from "./AppoimentsConfig.js"
import Appoiments from "./Appoiments.js"

function modelsV1 (connection: Pool){
  const userModel = new Users(connection)
  const commentModel = new Comments(connection)
  const appoimentConfigModel = new AppoimentsConfig(connection)
  const appoimentModel = new Appoiments(connection)

  return {
    userModel,
    commentModel,
    appoimentConfigModel,
    appoimentModel
  }
}

export default modelsV1