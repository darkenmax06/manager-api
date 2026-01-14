type writeAppoimentEmail = (title_name: string, title: string, contact: string, content: string) => [string, string]

const writeEmailComment: WriteEmailComment = (title_name, title, contact, content) => {
  const text = `${title_name}: ${title} \n\n Contenido: ${content} `
  
  // Usamos estilos inline para máxima compatibilidad
  const blueColor = "#4488ee";
  const blueLightColor = "#4488ee98";
  const lightBlueBg = "rgba(68, 136, 238, 0.1)";

  const html = `
  <div style="margin: 16px; border-radius: 8px; overflow: hidden; font-family: Arial, sans-serif; border: 1px solid ${blueColor};">
    <div style="background-color: ${blueColor}; padding: 20px; text-align: center;">
      <h1 style="margin: 0; color: #ffffff; font-size: 18px; text-transform: uppercase;">
        ${title_name}: ${title}
      </h1>
    </div>

    <div style="background-color: ${blueLightColor}; padding: 20px; text-align: center;">
      <h2 style="margin: 0; color: #ffffff; font-size: 18px; text-transform: uppercase;">
        contacto: ${contact}
      </h2>
    </div>
    <div style="padding: 20px; background-color: ${lightBlueBg}; color: #333333; line-height: 1.5;">
      ${content}
    </div>
  </div>
  `

  return [text, html]
}

export default writeAppoimentEmail