import type { Pool } from "mysql2/promise";
import type { DacId, DayAppoimentConfig, DayAppoimentConfigInput, UserId } from "../interfaces/models.interface.js";
import { number } from "zod";


class AppoimentsConfig {
  constructor ( private connection:Pool){
    this.connection = connection
  }

  async getAppoimentsRequierements ({userId}:UserId): Promise<DayAppoimentConfig[]>{
    const [result] = await this.connection.query<DayAppoimentConfig[]>("SELECT * FROM Day_appoiment_config WHERE user_id = UUID_TO_BIN(?)",[userId])
    if (result.length < 1) throw {name: "INVALID_ID"}
    
    const parsedResult = result.map(res => {
      const {user_id,...rest} = res
      return rest
    })

    return parsedResult
  }

  async getAppoimentRequierementById ({dac_id}:DacId): Promise<DayAppoimentConfig>{
    const [[result]] = await this.connection.query<DayAppoimentConfig[]>("SELECT * FROM Day_appoiment_config WHERE dac_id = ?",[dac_id])
    if (!result) throw {name: "INVALID_ID"}

    return result
  }

  async updateAppoimentsRequierements ({ begin_hour, finish_hour, work, dac_id}: DayAppoimentConfigInput): Promise<DayAppoimentConfig>{
    const [[result]] = await this.connection.query<DayAppoimentConfig[]>("SELECT * FROM Day_appoiment_config WHERE dac_id = ?",[dac_id])
    if (!result) throw {name: "INVALID_ID"}

    await this.connection.query("UPDATE Day_appoiment_config SET begin_hour = ?, finish_hour = ?, work = ? WHERE dac_id = ?", [begin_hour, finish_hour, work, dac_id])

    const updatedResult = await this.getAppoimentRequierementById({dac_id: dac_id as number})
    if (!updatedResult) throw {name: "INVALID_ID"}

    return updatedResult
  }
}


export default AppoimentsConfig