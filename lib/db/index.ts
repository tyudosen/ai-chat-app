import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";


const client = neon(process.env.DATABSE_URL as string)
export const db = drizzle({ client })

