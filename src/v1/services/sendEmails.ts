import nodemailer from "nodemailer"
import { google } from "googleapis"

const {USER_EMAIL, CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN} = process.env
const redirectionUri = "https://mail.google.com/"

const oauth2Client = new google.auth.OAuth2(CLIENT_ID,CLIENT_SECRET,redirectionUri)
oauth2Client.setCredentials({refresh_token: REFRESH_TOKEN as string})

type SendEmails = (to: string, subject: string, replyTo: string ,text: string, html:string) => Promise<boolean>

const sendEmails: SendEmails  = async (to,subject, replyTo,text,html)=> {
  const {token} = await oauth2Client.getAccessToken()
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: USER_EMAIL,
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      refreshToken: REFRESH_TOKEN,
      accessToken: token,

    }
  } as any)

  await transporter.sendMail({
    from: `"COMENTARIO DE TU WEB <${USER_EMAIL}>"`,
    replyTo,
    to,
    subject,
    text,
    html
  })

  return true
}

export  {sendEmails}