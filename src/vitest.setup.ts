import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs/promises";
import { connection } from "./mysql-config.js";


export default async function() {
  const currentPath = path.dirname(fileURLToPath(import.meta.url))
  const filePath = path.join(currentPath, "./db-test.sql")
  const result = await fs.readFile(filePath,"utf-8")
  
  try {
    await connection.query(result)
  } catch (err) {
    console.log(err)
  }

}