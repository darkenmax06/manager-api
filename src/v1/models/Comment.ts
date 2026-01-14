import type { Pool, ResultSetHeader } from "mysql2/promise";
import type { Comment, CommentId, CommentInput, UserId } from "../interfaces/models.interface.js";
import type { RowDataPacket } from "mysql2/promise";


class Comments {
  constructor (private connection: Pool){
    this.connection = connection
  }

  async getByUserId ({userId}:UserId): Promise<Comment[]>{
    const [comments] = await this.connection.query<Comment[]>("SELECT * FROM Parsed_comment WHERE user_id = ?",[userId])
    return comments
  }

  async getById ({commentId}: CommentId): Promise<Comment|null>{
    const [[comment]] = await this.connection.query<Comment[]>("SELECT * FROM Parsed_comment WHERE comment_id = ?",[commentId])
    if (!comment) return null
    return comment
  }
  
  async create ({title,comment,reply_to, user_id}: CommentInput): Promise<Comment|null>{
    const [[userExists]] = await this.connection.query<RowDataPacket[]>("SELECT * FROM Parsed_user WHERE user_id=?",[user_id])
    if (!userExists) throw {name: "USER_NOT_FOUND"}

    const [{insertId}] = await this.connection.query<ResultSetHeader>("INSERT INTO Comments (title,comment,reply_to,user_id) VALUES (?,?,?,UUID_TO_BIN(?)) ",[title,comment,reply_to,user_id])
    const commentCreated = await this.getById({commentId: insertId})
    if (!commentCreated) return null
    return commentCreated
  }

  async delete ({commentId,user_id}: {commentId: number,user_id: string}): Promise<boolean>{
    const oldComment = await this.getById({commentId})
    
    if (!oldComment) throw {name: "INVALID_ID"}
    else if (oldComment?.user_id !== user_id) throw {name: "USER_NOT_AUTHORIZATED"}

    const [{affectedRows}] = await this.connection.query<ResultSetHeader>("DELETE FROM Comments WHERE comment_id = ? ",[commentId])
    if (affectedRows < 1) throw {name: "INVALID_ID"}
    return true
  }
}

export default Comments