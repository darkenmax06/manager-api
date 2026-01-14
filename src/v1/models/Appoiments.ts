import type { Pool, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import type { Appoiment, AppoimentId, AppoimentInput, UserId } from "../interfaces/models.interface.js";

class Appoiments {
  constructor ( private connection:Pool){
    this.connection = connection
  }

  async getAsignedHours ({date,userId}: {date:string,userId: string}):Promise<Appoiment[]>{
    const parseDate = (dat) => {
      const preResult = dat.split("-")
      return `${preResult[2]}-${preResult[0]}-${preResult[1]}`
    }

    const parsedDate = parseDate(date)

    const [result] = await this.connection.query<Appoiment[]>("SELECT * FROM Parsed_appoiment WHERE user_id = ? AND date = ?",[userId,parsedDate])
    return result
  }

  async getByUserId ({userId}:UserId):Promise<Appoiment[]> {
    const [result] = await this.connection.query<Appoiment[]>("SELECT * FROM Parsed_appoiment WHERE user_id = ?",[userId])
    return result
  }

  async getById ({appoimentId}:AppoimentId):Promise<Appoiment> {
    const [[result]] = await this.connection.query<Appoiment[]>("SELECT * FROM Parsed_appoiment WHERE appoiment_id = ?",[appoimentId])
    if (!result) throw {name: "INVALID_ID"}
    return result
  }

  async create ({ name,  phone,  date,  begin_hour,  finish_hour,  comment,  persons,  user_id}:AppoimentInput):Promise<Appoiment> {
    const [[userExists]] = await this.connection.query<RowDataPacket[]>("SELECT * FROM Parsed_user WHERE user_id=?",[user_id])

    if (!userExists) throw {name: "USER_NOT_FOUND"}

    const personsQuantity = persons == null ? 1 : persons
    const [result] = await this.connection.query<ResultSetHeader>(
      "INSERT INTO Appoiments (name, phone, date, begin_hour, finish_hour, comment, persons, user_id) values (?,?,?,?,?,?,?,UUID_TO_BIN(?)) ",
      [name,  phone,  date,  begin_hour,  finish_hour,  comment,  personsQuantity ,  user_id]
    )

    const newAppoiment = await this.getById({appoimentId: result.insertId})
    return newAppoiment
  }

  async update ({ name,  phone,  date,  begin_hour,  finish_hour,  comment,  persons,  appoiment_id, user_id}:AppoimentInput):Promise<Appoiment> {
    const [[userExists]] = await this.connection.query<RowDataPacket[]>("SELECT * FROM Parsed_user WHERE user_id=?",[user_id])
    if (!userExists) throw {name: "USER_NOT_FOUND"}

    const oldaAppoiment = await this.getById({appoimentId: appoiment_id as number})
    if (oldaAppoiment.user_id !== user_id) throw {name: "USER_NOT_AUTHORIZATED"}

    const personsQuantity = persons == null ? 1 : persons

    await this.connection.query<RowDataPacket[]>(
      "UPDATE Appoiments SET name=?, phone=?, date=?, begin_hour=?, finish_hour=?, comment=?, persons=? WHERE appoiment_id = ?",
      [name,  phone,  date,  begin_hour,  finish_hour,  comment,  personsQuantity,  appoiment_id]    
    )

    const newAppoiment = await this.getById({appoimentId: appoiment_id as number})

    if (!newAppoiment) throw {name: "INVALID_ID"}
    return newAppoiment
  }

  async delete ({ appoimentId,user_id}:{appoimentId: number, user_id: string}):Promise<boolean> {
    const oldaAppoiment = await this.getById({appoimentId: appoimentId as number})

    if (oldaAppoiment.user_id !== user_id) throw {name: "USER_NOT_AUTHORIZATED"}

    const [{affectedRows}] = await this.connection.query<ResultSetHeader>(
      "DELETE FROM Appoiments WHERE appoiment_id = ?",
      [ appoimentId ]    
    )

    if (affectedRows < 1) throw {name: "INVALID_ID"}

    return true
  }
}


export default Appoiments