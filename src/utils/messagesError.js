import passport from "passport";

//Funcion general para retornar errores es las estrategias de passport

export const passportError = (strategy) => {
  return (req, res, next) => {
    passport.authenticate(strategy, (error, user) => {
      if (error) {
        return next(error);
      }
      if (!req.user) {
        // Aquí manejas el caso en el que no hay un usuario autenticado
        return res.status(401).send({
          error: "Usted no ha iniciado sesion",
        });
      }
      user = req.user;
      next();
    })(req, res, next); // Invoca la función authenticate aquí
  };
};

//Recibo un rol y establezco la capacidad del usuario
export const authorization = (role) => {
  return async (req, res, next) => {
    try {
      // Verificar si req.user existe y tiene el rol correcto
      if (
        req.cookies.jwtCookie ||
        req.headers.role === role ||
        req.user.role === role
      ) {
        next();
      } else {
        return res.status(401).send("Usuario no tiene los permisos necesarios");
      }

      // Si todo está bien, permitir el acceso
    } catch (error) {
      return res.status(500).send({ error: "Error en el servidor" });
    }
  };
};
