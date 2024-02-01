Bienvenido a mi entrega final de Backend.
>[!Warning]
>Algunas rutas de la coleccion de postman fueron modificadas. Se realizaron modificaciones en el código para que sea funcional tanto con postman como en el frontend.

>[!Important]
**>Ruta Carts:**

Ruta GET api/carts/ Trae todos los carritos.

Ruta GET api/carts/:cid Trae un carrito en especifico.

Ruta GET api/carts/:cid/purchase para crear el Ticket con los productos solicitados.

Ruta POST api/carts/:cid/product/:pid agrega 1 cantidad del producto al carrito, se puede utilizar multiples veces para agregar más cantidades, o pasar el "Quantity" por Body para agregar muchas de una vez.

Ruta PUT api/carts/:cid/product/:pid para modificar la cantidad del producto solicitado poniendo "quantity" en el body, y el product ID como parametro en la ruta. Si la cantidad llega a 0, se elimina el producto del carrito.

Ruta DELETE api/carts/:cid/ para Vaciar el carrito.

Ruta DELETE api/carts/:cid/product/:pid/ para eliminar un producto del carrito sin importar la cantidad que posea.


>[!Important]
**>Ruta Users:**

En la coleccion aparece solo la ruta GET /api/users para obtener todos los usuarios.

**Pero tambien tiene disponibles rutas para:**

Obtener un usuario en especifico.

Modificar un usuario en específico.

Eliminar un usuario en especifico.

Ruta /api/users/delete/delete que elimina usuarios inactivos por 2 días (Se realiza automaticamente a traves de un setTimeOut)

Ruta para PW Reset y PW Recovery, entre otras.




>Las demás rutas deberían funcionar sin problemas.

>Muchas gracias!
