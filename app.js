
require("dotenv").config();
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const express = require("express");

const LoggerMiddleware = require("./middlewares/logger");
const errorHandler = require("./middlewares/errorHandler");

const { isValidUser } = require("./validation");

const app = express();
const PORT = process.env.PORT || 3000;
const usersFilePath = path.join(__dirname, "users.json");

//pa base de bdatos  y crud ya no hay que instalar la libreria
//el path es pa no poner toda la ruta

//estos siempre van porque son para el parseo
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use(LoggerMiddleware);
app.use(errorHandler);

app.get("/", (req, res) => {
    res.send(`
        <h1>clase de expressjs</h1>
        <p>Bienvenido a la clase de expressjs</p>
        <p>Servidor corriendo en el puerto ${PORT}</p>
        `);
});

app.get("/users/:id", (req, res) => {
    //ya que nosotros vamos a enviar el id de estudiante si se usa request
    //aqui solo estamos capturando el id que viene en la ruta y no de la base
    const userId = req.params.id;
    res.send(`El id del usuario es: ${userId}`);
});

app.get("/search", (req, res) => {
    //se necesitan ambas query params para poder hacer la busqueda
    const terms = req.query.termino || "No se recibio ningun termino de busqueda";
    const category = req.query.categoria || "Todo";
    //capturamos y enviamos
    res.send(`
        <h1>Busqueda de usuarios</h1>
        <p>Termino de busqueda: ${terms}</p>
        <p>Categoria: ${category}</p>
    `);
    //se busca asi http://localhost:3000/search?termino=express&categoria=programacion
});

//formulario para enviar datos al servidor
app.post("/form", (req, res) => {
    //capturamos el body que viene en la peticion
    const name = req.body.name || "Anonimo";
    const email = req.body.email || "No se recibio ningun email";
    res.json({
        message: "Datos recibidos correctamente",
        data: {
            name,
            email,
        },
    });
});

app.post("/api/data", (req, res) => {
    const data = req.body;
    //cuando se deja .body se captura todo y se guarda en el de body
    if (!data || Object.keys(data).length === 0) {
        //si no hay registros es el error 400
        return res.status(400).json({ error: "No se recibieron datos" });
    }

    res.status(200).json({
        message: "Datos recibidos correctamente",
        data,
    });
});

//nueva ruta
app.get("/users", (req, res) => {
    //pa localizar el archivo usar fs o sea filesystem y ya la teniamos de constante arriba
    fs.readFile(usersFilePath, "utf8", (err, data) => {
        if (err) {
            console.error("Error al leer el archivo de usuarios:", err);
            return res.status(500).json({ error: "Error al leer el archivo de usuarios" });
        }

        //parseamos pa que el servidor pueda leerlo y enviarlo en formato json
        try {
            const users = JSON.parse(data);
            res.json(users);
        } catch (parseError) {
            console.error("Error al interpretar el archivo de usuarios:", parseError);
            return res.status(500).json({ error: "El archivo de usuarios no contiene JSON válido" });
        }
    });
});

//pa aniadir mas usuarios
app.post("/users", (req, res) => {
    //viaja por el body
    const newUser = req.body;

    fs.readFile(usersFilePath, "utf8", (err, data) => {
        if (err) {
            return res.status(500).json({ error: "Error al leer el archivo de usuarios" });
        }

        //parsear a json pa guardarlo en servidor
        let users = [];
        try {
            users = JSON.parse(data);
        } catch (parseError) {
            console.error("Error al interpretar el archivo de usuarios:", parseError);
            return res.status(500).json({ error: "El archivo de usuarios no contiene JSON válido" });
        }

        const validation = isValidUser(newUser, users);
        if (!validation.valid) {
            return res.status(400).json({ error: validation.error });
        }

        users.push(newUser);

        //escribir de nuevo el archivo con el nuevo usuario
        fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), (writeErr) => {
            if (writeErr) {
                return res.status(500).json({ error: "Error al escribir en el archivo de usuarios" });
            }

            res.status(201).json({ message: "Usuario agregado correctamente", user: newUser });
        });
    });
});

app.put("/users/:id", (req, res) => {
    const userId = parseInt(req.params.id, 10);
    const updatedUser = req.body;

    fs.readFile(usersFilePath, "utf8", (err, data) => {
        if (err) {
            return res.status(500).json({ error: "Error al leer el archivo de usuarios" });
        }

        let users = [];
        try {
            users = JSON.parse(data);
        } catch (parseError) {
            console.error("Error al interpretar el archivo de usuarios:", parseError);
            return res.status(500).json({ error: "El archivo de usuarios no contiene JSON válido" });
        }

        const existingUser = users.find((user) => user.id === userId);
        if (!existingUser) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        const userToValidate = { ...existingUser, ...updatedUser };
        const validation = isValidUser(
            userToValidate,
            users.filter((user) => user.id !== userId)
        );

        if (!validation.valid) {
            return res.status(400).json({ error: validation.error });
        }

        users = users.map((user) => (user.id === userId ? { ...user, ...updatedUser } : user));

        fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), (writeErr) => {
            if (writeErr) {
                return res.status(500).json({ error: "Error al actualizar el usuario" });
            }

            res.json({ message: "Usuario actualizado correctamente", user: users.find((user) => user.id === userId) });
        });
    });
});

app.delete("/users/:id", (req, res) => {
    const userId = parseInt(req.params.id, 10);

    fs.readFile(usersFilePath, "utf8", (err, data) => {
        if (err) {
            return res.status(500).json({ error: "Error al leer el archivo de usuarios" });
        }

        let users = [];
        try {
            users = JSON.parse(data);
        } catch (parseError) {
            console.error("Error al interpretar el archivo de usuarios:", parseError);
            return res.status(500).json({ error: "El archivo de usuarios no contiene JSON válido" });
        }

        const remainingUsers = users.filter((user) => user.id !== userId);
        users = remainingUsers;

        fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), (writeErr) => {
            if (writeErr) {
                return res.status(500).json({ error: "Error al eliminar el usuario" });
            }

            res.status(204).send();
        });
    });
});

app.get('/error', (req, res, next)=>{
  next(new Error("Error Intencional"));
})


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
