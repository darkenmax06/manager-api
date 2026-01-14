function validateTImeDifference (beginHour: string,finishHour:string):boolean {
  const hourDesglose = (hour:string) : Date | false => {
    const regex = /(\d{2}):(\d{2}):00/
    const result = regex.exec(hour)
    
    if (!result) return false

    const date = new Date()

    const hora = parseInt (result[1] as string)
    const minutos = parseInt (result[2] as string)

    date.setHours(hora,minutos)
    
    return date
  }

  const beginHourDate = hourDesglose(beginHour)
  const finishHourDate = hourDesglose(finishHour)

  if (!beginHourDate || !finishHourDate ) return false

  const isValid = beginHourDate < finishHourDate
  return isValid
}


export default validateTImeDifference
