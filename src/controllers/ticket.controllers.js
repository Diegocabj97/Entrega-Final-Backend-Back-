import { CartModel } from "../models/cart.models.js";
import { ticketModel } from "../models/ticket.models.js";
import { userModel } from "../models/users.models.js";
import { v4 as uuidv4 } from "uuid";
import nodemailer from "nodemailer";
import { sendTicketToEmail } from "../main.js";

const generarCodeUnico = () => {
  return uuidv4();
};

export const postCompra = async (req, res) => {
  const cartId = req.params.cid;
  const userEmail = req.user ? req.user.email : req.headers["user-email"];

  try {
    const cart = await CartModel.findById(cartId).populate("products._id");

    if (!cart) {
      return res.status(404).send("Carrito no encontrado");
    }

    if (cart.products.length === 0) {
      return res
        .status(200)
        .send("Carrito vacío, no se ha realizado ninguna compra");
    }

    let insufficientStock = false;

    for (const item of cart.products) {
      const product = item._id;
      const quantity = item.quantity;

      if (product.stock < quantity) {
        insufficientStock = true;
        // Filtrar productos con stock suficiente
        cart.products = cart.products.filter(
          (cartItem) => cartItem._id.toString() !== product._id.toString()
        );
        break;
      }

      product.stock -= quantity;
      await product.save();
    }

    if (insufficientStock) {
      // Salir temprano si hay falta de stock
      return res
        .status(401)
        .send("No hay stock suficiente para finalizar la compra");
    }

    const total = cart.products.reduce(
      (acc, item) => acc + item.quantity * item._id.price,
      0
    );

    cart.default = [{ products: cart.products, total }];
    await cart.save();

    const ticket = new ticketModel({
      products: cart.products.map((item) => ({
        id: item._id,
        title: item._id.title,
        quantity: item.quantity,
        price: item._id.price,
      })),
      amount: total,
      email: userEmail,
      purchaser: cart._id,
      code: generarCodeUnico(),
    });

    await ticket.save();
    sendTicketToEmail(ticket);

    // Limpiar el carrito después de la compra
    cart.products = [];
    cart.total = 0;
    await cart.save();

    return res.status(200).send("Ticket creado, gracias por su compra");
  } catch (error) {
    return res.status(500).send({
      respuesta: "Error al procesar la compra",
      mensaje: error.message || "Error desconocido al procesar la compra",
    });
  }
};
