import passport from "passport";

//Funcion general para retornar errores es las estrategias de passport

export const passportError = (strategy) => {
  //Voy a enviar local, github o jwt
  return async (req, res, next) => {
    passport.authenticate(strategy, (error, user, info) => {
      if (error) {
        return next(error); //Que la funcion que me llame maneje como va a responder ante mi error
      }
      if (!user) {
        return res
          .status(401)
          .send({ error: info.messages ? info.messages : info.toString() });
      }
      req.user = user;
      next();
    })(req, res, next); //Esto es por que me va a llamar un middleware
  };
};

//Recibo un rol y establezco la capacidad del usuario
export const authorization = (role) => {
  return async (req, res, next) => {
    try {
      // Verificar si req.user existe y tiene el rol correcto
      if (!req.cookies.jwtCookie || req.headers.role !== role) {
        console.log(req.headers.role);
        return console.log("Usuario no tiene los permisos necesarios");
      }

      // Si todo está bien, permitir el acceso
      next();
    } catch (error) {
      console.error("Error en middleware de autorización:", error);
      return res.status(500).send({ error: "Error en el servidor" });
    }
  };
};
