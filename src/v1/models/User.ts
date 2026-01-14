import type { Pool, ResultSetHeader, RowDataPacket } from "mysql2/promise"
import type { UserInput, User, UserId } from "../interfaces/models.interface.js"


class Users  {
  constructor (private connection:Pool) {
    this.connection = connection
  }

  async getAll ():Promise<User[]>{
    const [users] = await this.connection.query<User[]>("SELECT * FROM Parsed_user")
    return users
  }

  async getFullUserById ({userId}:UserId): Promise<User> {
     const [[user]] = await this.connection.query<User[]>("SELECT * FROM Parsed_user WHERE user_id = ?",[userId])

     if (!user) throw {name: "USER_NOT_FOUND"}

     return user
  }

  async getByEmail ({email}:{email: string}): Promise<User> {
     const [[user]] = await this.connection.query<User[]>("SELECT name, email, password, creation_date, role, BIN_TO_UUID(user_id) user_id FROM Users WHERE email = ?",[email])

     if (!user) throw {name: "INVALID_LOGIN"}

     return user
  }

  async create ({name, email, password}:UserInput): Promise<User>{
    const uuid = crypto.randomUUID()
    await this.connection.query<ResultSetHeader>("INSERT INTO Users (user_id,name,email,password) VALUES (UUID_TO_BIN(?),?,?,?)",[uuid,name,email,password] )
    const user = await this.getFullUserById({userId:uuid})
    return user
  }

  async update ({
    name, 
    email, 
    password,
    userId,
    comment_title_name
  }:User): Promise<User>{

    const [result] = await this.connection.query<ResultSetHeader>("UPDATE Users set name = ?, email = ?, password = ?, comment_title_name = ? WHERE user_id = UUID_TO_BIN(?)",[name,email,password,comment_title_name,userId])
    if (result.affectedRows < 1) throw {name: "INVALID_ID"}


    return this.getFullUserById({userId})
  }

  async delete ({userId}:UserId): Promise<boolean>{
    const user = await this.getFullUserById({userId})

    if (!user) throw {name: "USER_NOT_FOUND"}

    await this.connection.query<ResultSetHeader>("DELETE FROM Day_appoiment_config WHERE user_id = UUID_TO_BIN(?)",[userId])

    const [result] = await this.connection.query<ResultSetHeader>("DELETE FROM Users WHERE user_id = UUID_TO_BIN(?)",[userId])
    if (result.affectedRows < 1 ) throw {name: "USER_NOT_FOUND"}
    return true
  }
}

export default Users