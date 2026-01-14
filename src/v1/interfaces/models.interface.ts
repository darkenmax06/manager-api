import type { RowDataPacket } from "mysql2/promise"

export type UserInput = {
  name:string,
  email: string,
  password: string,
}

export interface UserInfo extends UserInput{
  userId: string | null
}

export interface User extends RowDataPacket {
  user_id: Buffer | null
  name: string
  email: string
  role: string
  creation_date: Date
  comment_title_name: string
}

export interface CommentInput {
  title: string
  reply_to: string
  comment: string
  user_id: string | undefined
}

export type Comment =   CommentInput & RowDataPacket & {
  comment_id?: number
  creation_date?: Date
}


export interface UserModel {
  getAll: ()=> Promise<User[]>
  create: (data: UserInput)=> Promise<User>
  update: (data: User)=> Promise<User>
  delete: (data: {userId: string})=> Promise<boolean>
  getFullUserById: (data: {userId: string})=>  Promise<User>
  getByEmail: (data: {email: string})=>  Promise<User>
}

export type UserId = {userId: string}
export type CommentId = {commentId: number}

export interface CommentModel {
  getByUserId: (data: UserId) =>  Promise<Comment[]>
  getById: (data: CommentId)=>  Promise<Comment|null>
  delete :(data: {commentId: number,user_id: string})=> Promise<boolean>
  create :(data: CommentInput)=> Promise<Comment|null>
}

export interface TokenId  {
  user_id: string
}

export type AppoimentInput = {
  name: string,
  phone:string,
  date: Date,
  begin_hour:Date,
  finish_hour:Date,
  comment: string | null,
  persons: number | 1
  user_id: Buffer | string,
  appoiment_id?: number | null
}

export type Appoiment = AppoimentInput & RowDataPacket & {
  appoiment_id: number,
  creation_date: Date
}

export type DayAppoimentConfigInput =  {
  dac_id?: number
  work: boolean | 0 | 1
  begin_hour: string
  finish_hour: string
}


export type DayAppoimentConfig = RowDataPacket & DayAppoimentConfigInput & {
  day: "lun"|"mar"|"mie"|"jue"|"vie"|"sab"|"dom"
  user_id?: Buffer
}

export type AppoimentId = {appoimentId: number}

export type DacId = {dac_id: number}

export interface AppoimentsConfigModel {
  getAppoimentsRequierements: (data: UserId) => Promise<DayAppoimentConfig[]>
  updateAppoimentsRequierements: (data: DayAppoimentConfigInput) => Promise<DayAppoimentConfig>
  getAppoimentRequierementById: (data: DacId) => Promise<DayAppoimentConfig>
}

export interface AppoimentModel {
  getAsignedHours: ({date,userId}: {date:string,userId: string}) => Promise<Appoiment[]>
  getByUserId: (data: UserId) => Promise<Appoiment[]>
  getById: (data: AppoimentId) => Promise<Appoiment>
  create: (data: AppoimentInput) => Promise<Appoiment>
  update: (data: AppoimentInput) => Promise<Appoiment>
  delete: (data: {appoimentId: number, user_id: string}) => Promise<boolean>
}

export interface V1 {
  userModel: UserModel,
  commentModel: CommentModel,
  appoimentConfigModel: AppoimentsConfigModel,
  appoimentModel: AppoimentModel
}

export type Node_env = "development" | "test" | "production"

