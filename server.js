const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
require("dotenv").config(); // Cargar las variables de entorno
const app = express();
const port = process.env.PORT || 3000;

// Conectar a MongoDB usando la variable de entorno
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Conectado a MongoDB Atlas");
  })
  .catch((err) => {
    console.error("Error al conectar a MongoDB Atlas:", err);
  });

const imageSchema = new mongoose.Schema({
  filename: String,
  contentType: String,
  imageBase64: String,
});

const Image = mongoose.model("Image", imageSchema);

// Configurar Multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Ruta para subir una imagen
app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const newImage = new Image({
      filename: req.file.originalname,
      contentType: req.file.mimetype,
      imageBase64: req.file.buffer.toString("base64"),
    });
    await newImage.save();
    res.status(200).send("Imagen subida exitosamente");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Ruta para obtener todas las imágenes
app.get("/images", async (req, res) => {
  try {
    const images = await Image.find();
    res.status(200).json(images);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Ruta para obtener una imagen específica por su ID
app.get("/images/:id", async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) return res.status(404).send("Imagen no encontrada");
    res.status(200).json(image);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
