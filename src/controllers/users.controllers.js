import { sendRecoveryMail } from "../main.js";
import { userModel } from "../models/users.models.js";
import crypto from "crypto";
import path from "path";

export const getAll = async (req, res) => {
  try {
    const users = await userModel.find({}, "first_name last_name email role");

    res.status(200).send({ payload: "success", mensaje: users });
  } catch (error) {
    res
      .status(404)
      .send({ payload: "Error al obtener usuarios", mensaje: error.message });
  }
};

export const getById = async (req, res) => {
  const { uid } = req.params;
  try {
    const user = await userModel.findById(uid);
    if (user) {
      res.status(200).send({ payload: "success", mensaje: user });
    } else {
      res.status(404).send({ payload: "Error", mensaje: "User not found" });
    }
  } catch (error) {
    res
      .status(404)
      .send({ payload: "Error al consultar este usuario", mensaje: error });
  }
};
export const putById = async (req, res) => {
  const { uid } = req.params;
  const { first_name, last_name, /* age, */ email, password } = req.body;

  try {
    const user = await userModel.findByIdAndUpdate(uid, {
      first_name,
      last_name /* 
      age, */,
      email,
      password,
    });
    if (user) {
      res.status(200).send({ payload: "success", mensaje: user });
    } else {
      res.status(404).send({
        payload: "Error al actualizar usuario",
        mensaje: "User not found",
      });
    }
  } catch (error) {
    res.status(404).send({ payload: "Error", mensaje: error });
  }
};

// Controlador para eliminar usuarios inactivos
export const autoDeleteInactiveUsers = async (req, res) => {
  try {
    const twoDaysInMillis = 2 * 24 * 60 * 60 * 1000; // 2 días en milisegundos
    const DateNow = Date.now();

    // Encuentra y elimina usuarios que no se han conectado en los últimos 2 días
    const inactiveUsers = await userModel.find();

    for (const user of inactiveUsers) {
      const lastConnectionTime = new Date(user.last_connection).getTime();

      // Verifica si han pasado 2 días o más desde la última conexión
      if (DateNow - lastConnectionTime >= twoDaysInMillis) {
        // Envía correo de aviso
        await transporter.sendMail({
          to: user.email,
          subject: "Aviso de eliminación por inactividad",
          text: "Tu cuenta será eliminada debido a inactividad. Conéctate para evitar la eliminación.",
        });

        // Elimina el usuario
        await userModel.findByIdAndDelete(user._id);

        res
          .status(201)
          .send(`Usuario ${user.email} eliminado por inactividad.`);
      }
    }
  } catch (error) {
    res.status(404).send({ payload: "Error", mensaje: error });
  }
};
export const deleteByid = async (req, res) => {
  const { uid } = req.params;

  try {
    const user = await userModel.findByIdAndDelete(uid);
    if (user) {
      res.status(200).send({ payload: "success", mensaje: user });
    } else {
      res.status(404).send({
        payload: "Error al eliminar el usuario",
        mensaje: "User not found",
      });
    }
  } catch (error) {
    res.status(404).send({ payload: "Error", mensaje: error });
  }
};
export const deleteInactiveUser = async (req, res) => {
  try {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    console.log("two days ago " + twoDaysAgo);
    const usersToDelete = await userModel.find({
      last_connection: { $lt: twoDaysAgo },
    });
    console.log("Usuario eliminado" + usersToDelete);
    // Encuentra y elimina usuarios inactivos que no han iniciado sesión en los últimos 2 días
    const resultado = await userModel.deleteMany({
      last_connection: { $lt: twoDaysAgo },
    });

    if (resultado.deletedCount > 0) {
      res.status(200).send({
        payload: "success",
        mensaje: `Se eliminaron ${resultado.deletedCount} usuarios inactivos.`,
      });
    } else {
      res.status(404).send({
        payload: "Error",
        mensaje: "No se encontraron usuarios inactivos para eliminar.",
      });
    }
  } catch (error) {
    console.error("Error al eliminar usuarios inactivos:", error);
    res.status(500).send({
      payload: "Error",
      mensaje: "Error al procesar la solicitud",
    });
  }
};
setInterval(deleteInactiveUser, 24 * 60 * 60 * 1000);
// PW RECOVERY

const recoveryLinks = {};
export const pwRecovery = (req, res) => {
  const { email } = req.body;
  try {
    const token = crypto.randomBytes(20).toString("hex"); // Token unico para que no hayan 2 iguales para dif users
    recoveryLinks[token] = {
      email: email,
      timestamp: Date.now(),
    };
    const recoveryLink = `http://localhost:8080/api/users/reset-password/${token}`;
    sendRecoveryMail(email, recoveryLink);
    res.status(200).send("Email de recuperación enviado");
  } catch (error) {
    res.status(500).send(`Error al enviar el mail ${error}`);
  }
};

export const pwReset = (req, res) => {
  const { token } = req.params;
  const { newPassword, newPassword2 } = req.body;
  try {
    const linkData = recoveryLinks[token];
    if (linkData && Date.now() - linkData.timestamp <= 3600000) {
      if (newPassword == newPassword2) {
        delete recoveryLinks[token];
        res.status(200).send("Contraseña modificada correctamente");
      } else {
        res.status(400).send("Las contraseñas deben ser idénticas");
      }
      //Modificar usuario con nueva contraseña
    } else {
      res.status(400).send("link inválido o expirado, pruebe nuevamente");
    }
  } catch (error) {
    res.status(500).send(`Error al modificar contraseña ${error}`);
  }
};

export const documentsUpload = (req, res) => {
  try {
    console.log(req.file);
    res.status(200).send("Imagen cargada");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al procesar la solicitud");
  }
};
export const profilePicsUpload = async (req, res) => {
  const { uid } = req.params;
  const { filename } = req.file;
  try {
    const user = await userModel.findByIdAndUpdate(
      uid,
      {
        $push: {
          thumbnail: path
            .join("src", "public", "js", "profilePics", filename)
            .replace(/\\/g, "/")
            .slice(0, -1),
        },
      },
      { new: true }
    );
    if (user) {
      res.status(200).send("Imagen de perfil cargada");
    } else {
      res.status(404).send({
        payload: "Error al actualizar usuario",
        mensaje: "User not found",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al procesar la solicitud");
  }
};
export const prodPicsUpload = (req, res) => {
  try {
    console.log(req.file);
    res.status(200).send("Imagen del producto cargada");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al procesar la solicitud");
  }
};
