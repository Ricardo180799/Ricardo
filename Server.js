const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = 3001;

/*Middleware*/
app.use(cors());
app.use(express.json());

/*Conexión a SQLITE */
const db = new sqlite3.Database("./database.db", (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log("Conectado a SQLITE");
  }
});

/*Ruta de prueba */

app.get("/", (req, res) => {
  res.send("Servidor funcionando");
});

/*Iniciar servidor */

app.listen(PORT, () => {
  console.log("Servidor corriendo en http://localhost: " + PORT);
});

//Método get
app.get("/Tareas", (req, res) => {
  db.all("SELECT * FROM Tareas", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

//Método crear nueva tarea
app.post("/Tareas", (req, res) => {
  const { Titulo } = req.body;
  db.run(
    "INSERT INTO Tareas(Titulo,Completada) VALUES(?,?)",
    [Titulo, 0],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ ID: this.lastID, Titulo, Completada: 0 });
      }
    }
  );
});
// Método Actualizar tarea
app.put("/Tareas/:id", (req, resp) => {
  const { id } = req.params;
  const { Titulo, Completada } = req.body;

  const campos = [];
  const valores = [];

  if (Titulo !== undefined) {
    campos.push("Titulo = ?");
    valores.push(Titulo);
  }

  if (Completada !== undefined) {
    campos.push("Completada = ?");
    valores.push(Completada);
  }
  if (campos.length === 0) {
    return resp.status(400).json({ error: "No hay campos para agregar" });
  }
  valores.push(id);
  const query = `UPDATE TAREAS SET ${campos.join(", ")} WHERE ID = ?`;
  db.run(query, valores, function (err) {
    if (err) {
      resp.status(500).json({ error: err.message });
    } else {
      resp.json({ Actualizado: this.changes });
    }
  });
});

// Método Eliminar tarea

app.delete("/Tareas/:id", (req, resp) => {
  const { id } = req.params; // 'id' en minúscula
  db.run("DELETE FROM Tareas WHERE ID = ?", [id], function (err) {
    if (err) {
      resp.status(500).json({ error: err.message });
    } else {
      resp.json({ Eliminado: this.changes });
    }
  });
});
