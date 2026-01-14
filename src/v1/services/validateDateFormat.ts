


function validateDateFormat (date:string): boolean{
  const regex = /^(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|30|31)-([0-9]){4}$/
  const isValidFormat = regex.test(date)
  return isValidFormat
}

export {validateDateFormat}