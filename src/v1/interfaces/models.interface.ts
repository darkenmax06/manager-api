import type { RowDataPacket } from "mysql2/promise"

export interface UserInput {
  name:string,
  email: string,
  password: string,
}

export interface UserInfo {
  name:string,
  email: string,
  password: string,
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

export interface Comment extends RowDataPacket {
  comment_id?: number
  title: string
  reply_to: string
  comment: string
  user_id: Buffer | string
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
  delete :(data: CommentId)=> Promise<boolean>
  create :(data: CommentInput)=> Promise<Comment|null>
}

export interface v1 {
  userModel: UserModel,
  commentModel: CommentModel
}

export interface TokenId  {
  user_id: string
}