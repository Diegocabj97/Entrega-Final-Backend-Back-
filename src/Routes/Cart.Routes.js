import { Router } from "express";
import {
  getCart,
  postCart,
  putCart,
  deleteCart,
  getCarts,
  removeProductFromCart,
} from "../controllers/cart.controllers.js";
import { postCompra } from "../controllers/ticket.controllers.js";
import { authorization, passportError } from "../utils/messagesError.js";

const cartRouter = Router();

//Authorization: Limita quien puede acceder a cada ruta mediante passport

cartRouter.get("/", getCarts);
cartRouter.get("/:cid", authorization("user"), getCart);
cartRouter.post("/:cid/product/:pid/", authorization("user"), postCart);
cartRouter.put("/:cid/product/:pid", authorization("user"), putCart);
cartRouter.delete(
  "/:cid/",
  authorization("user"),

  deleteCart
);

cartRouter.delete(
  "/:cid/product/:pid",

  removeProductFromCart
);
cartRouter.get(
  "/:cid/purchase",

  postCompra
);

export default cartRouter;
