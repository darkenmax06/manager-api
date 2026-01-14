import type { Pool } from "mysql2/promise";
import type { V1 } from "./v1/interfaces/models.interface.js";

export interface serverProps {
  connection: Pool,
  v1: V1
}

