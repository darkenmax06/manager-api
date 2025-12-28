import type { Pool, ResultSetHeader } from "mysql2/promise";
import type { Comment, CommentId, CommentInput, UserId } from "../interfaces/models.interface.js";



class Comments {
  constructor (private connection: Pool){
    this.connection = connection
  }

  async getByUserId ({userId}:UserId): Promise<Comment[]>{
    const [comments] = await this.connection.query<Comment[]>("SELECT * FROM Comments WHERE user_id = UUID_TO_BIN(?)",[userId])
    return comments
  }

  async getById ({commentId}: CommentId): Promise<Comment|null>{
    const [[comment]] = await this.connection.query<Comment[]>("SELECT * FROM Comments WHERE comment_id = ?",[commentId])
    if (!comment) return null
    return comment
  }
  
  async create ({title,comment,reply_to, user_id}: CommentInput): Promise<Comment|null>{
    const [{insertId}] = await this.connection.query<ResultSetHeader>("INSERT INTO Comments (title,comment,reply_to,user_id) VALUES (?,?,?,UUID_TO_BIN(?)) ",[title,comment,reply_to,user_id])
    const commentCreated = await this.getById({commentId: insertId})
    if (!commentCreated) return null
    return commentCreated
  }

  async delete ({commentId}: CommentId): Promise<boolean>{
    const [{affectedRows}] = await this.connection.query<ResultSetHeader>("DELETE FROM Comments WHERE comment_id = ? ",[commentId])
    if (affectedRows < 1) throw {name: "INVALID_ID"}
    return true
  }
}

export default Comments