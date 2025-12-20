// test.js
import sql from "mssql";
import 'dotenv/config';

async function test() {
  try {
    const pool = await sql.connect({
      server: process.env.AZURE_SQL_SERVER, 
      database: process.env.AZURE_SQL_DATABASE,
      user: process.env.AZURE_SQL_USER,
      password: process.env.AZURE_SQL_PASSWORD,
      options: {
        encrypt: true,  
        enableArithAbort: true,
        trustServerCertificate: false
      }
    });

    console.log("Connected successfully!");

    const result = await pool.request().query("SELECT SYSUTCDATETIME() AS now");
    console.log("Current DB datetime:", result.recordset[0].now);

    await pool.close();
  } catch (err) {
    console.error("Connection failed:", err);
  }
}

test();
