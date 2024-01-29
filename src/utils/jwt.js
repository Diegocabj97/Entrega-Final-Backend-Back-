import "dotenv/config";
import jwt, { decode } from "jsonwebtoken";
export const generateToken = (user) => {
  try {
    const userToken = {
      id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
    };
    const token = jwt.sign({ user: userToken }, process.env.JWT_SECRET, {
      expiresIn: 12 * 60 * 60,
    });
    return token;
  } catch (error) {
    // Manejar el error aquí (puedes loguearlo o devolver un mensaje de error)
    console.error("Error al generar el token:", error);
    throw error;
  }
};

export const authToken = (req, res, next) => {
  //Consultar al header para obtener el Token
  const authHeader = req.headers.Authorization;

  if (!authHeader) {
    return res.status(401).send({ error: "Usuario no autenticado" });
  }

  const token = authHeader.split(" ")[1]; //Obtengo el token y descarto el Bearer

  jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
    if (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).send({ error: "Token expirado" });
      }
      return res.status(403).send({ error: "Usuario no autorizado" });
    }

    req.user = decoded.user;
    next();
  });
};
