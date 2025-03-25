    const sql = require("mssql");
    const express = require("express");
    const bodyParser = require("body-parser");

    const app = express();
    app.use(bodyParser.json());

    // Configuración de conexión a SQL Server
    const config = {
        server: "DESKTOP-E2UV8CP",
        database: "prueba",
        user: "censo",
        password: "12345",
        options: {
            encrypt: false,
            trustServerCertificate: true,
            port: 1433 // Agrega esta línea si el puerto es diferente
        }
    }
    

    // Función para conectar a la base de datos
    async function connectDB() {
        try {
            await sql.connect(config);
            console.log("✅ Conexión exitosa a SQL Server");
        } catch (err) {
            console.error("❌ Error de conexión a SQL Server:", err);
        }
    }

    connectDB(); // Conectar al iniciar el servidor

    // Ruta para manejar el inicio de sesión
    app.post("/login", async (req, res) => {
        const { username, password } = req.body;

        try {
            const pool = await sql.connect(config);
            const request = pool.request();
            request.input("username", sql.NVarChar, username);
            request.input("password", sql.NVarChar, password);
            
            // Consulta sin hash (directa)
            const result = await request.query("SELECT * FROM Usuarios WHERE username = @username AND password = @password");

            if (result.recordset.length > 0) {
                return res.json({ success: true, message: "✅ Inicio de sesión exitoso" });
            }

            res.json({ success: false, message: "❌ Usuario o contraseña incorrectos" });
        } catch (err) {
            console.error("❌ Error en la consulta:", err);
            res.status(500).json({ success: false, message: "❌ Error en el servidor" });
        }
    });

    // Iniciar el servidor en el puerto 3000
    const PORT = 4000;
    app.listen(PORT, () => {
        console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
