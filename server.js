const sql = require("mssql");
const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");

const app = express();
app.use(bodyParser.json());

const config = {
    server: "DESKTOP-E2UV8CP",  // SOLO el nombre del servidor, sin "\MSSQLSERVER22"
    database: "prueba",
    options: {
        encrypt: false,
        trustServerCertificate: true
    },
    authentication: {
        type: "ntlm", // Autenticación de Windows
        options: {
            domain: "",   // Déjalo vacío si estás en una PC local
            userName: "", // Déjalo vacío para autenticación integrada
            password: ""  // Déjalo vacío para autenticación integrada
        }
    }
};

// Conectar a la base de datos
sql.connect(config)
    .then(() => console.log("✅ Conexión exitosa a SQL Server"))
    .catch(err => console.error("❌ Error de conexión:", err));

// Ruta para manejar el inicio de sesión
app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        const request = new sql.Request();
        request.input("username", sql.NVarChar, username);
        const result = await request.query("SELECT password_hash FROM Usuarios WHERE username = @username");

        if (result.recordset.length > 0) {
            const storedHash = result.recordset[0].password_hash;
            const inputHash = crypto.createHash("sha256").update(password).digest("hex").toUpperCase();

            if (storedHash.toUpperCase() === inputHash) {
                return res.json({ success: true, message: "Inicio de sesión exitoso" });
            }
        }

        res.json({ success: false, message: "Usuario o contraseña incorrectos" });
    } catch (err) {
        console.error("Error en la consulta:", err);
        res.status(500).json({ success: false, message: "Error en el servidor" });
    }
});

// Iniciar el servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
