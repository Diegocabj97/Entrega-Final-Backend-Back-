import { userModel } from "../models/users.models.js";
import { generateToken } from "../utils/jwt.js";

export const login = async (req, res) => {
  try {
    const userFound = await userModel.findOne({ email: req.body.email });
    if (!userFound) {
      return res.status(401).send({
        payload: "Usuario no registrado, por favor regístrese",
        status: "Error",
      });
    }
    const userData = {
      id: req.user._id,
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      email: req.user.email,
      role: req.user.role,
    };
    if (!req.cookies.jwtCookie) {
      const userCart = JSON.stringify(req.user.cart);
      const userEmail = JSON.stringify(req.user.email);
      const token = generateToken(req.user);

      // Configuración de cookieOptions
      const cookieOptions = {
        maxAge: 86400000, // Duración de la cookie en milisegundos (1 día)
        httpOnly: false,
        sameSite: "None",
      };

      res.cookie("jwtCookie", token, cookieOptions);

      const userId = req.user._id;
      const userInfo = userData;

      res.status(200).send({
        userInfo,
        userId,
        userEmail,
        token,
        cookieOptions,
        cart: userCart,
        payload: "Sesión Iniciada",
        status: "success",
      });
    } else {
      res.status(504).send({
        payload: "Usted ya ha iniciado sesión",
        status: "Error",
      });
    }
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    res
      .status(500)
      .send({ mensaje: `Error al iniciar sesión: ${error.message || error}` });
  }
};

export const register = async (req, res) => {
  try {
    if (req.user) {
      return res.status(200).send({
        status: "success",
        payload: "Usuario registrado exitosamente",
      });
    } else {
      return res
        .status(400)
        .send({ status: "error", payload: "Error en el registro" });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ status: "error", payload: "Hubo un error al registrar usuario" });
  }
};

export const logout = async (req, res) => {
  try {
    //Si la sesión se crea en la BDD
    /* if (req.session.login) {
      req.session.destroy();
    } */
    console.log("Cookie " + req.cookies.jwtCookie);
    req.logout();
    if (req.cookies.jwtCookie) {
      res.clearCookie("jwtCookie");
      res.clearCookie("cartid");
      res.redirect("/");
      res
        .status(200)
        .send({ payload: "Usuario deslogeado", status: "success" });
    } else {
      res.status(404).send({
        payload: "Debes iniciar sesion previamente!",
        status: "Error",
      });
    }
  } catch (error) {
    res.status(500).send({ resultado: "Error al cerrar sesión", error: error });
  }
};

export const tryJwt = async (req, res) => {
  console.log(req);
  res.send(req.user);
};

export const current = async (req, res) => {
  res.send(req.user);
};

export const GithubLogin = async (req, res) => {
  req.session.user = req.user;
  res.status(200).send({ mensaje: "Usuario logeado con Github" });
  res.redirect("/");
};
