// eslint-disable-next-line import/no-unresolved
const { error } = require('console');
const express = require('express');
const { engine } = require('express-handlebars');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT ?? 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
/* --------------------------------- ROUTES --------------------------------- */
const routeCarrito = express.Router();
const routeProductos = express.Router();
/* -------------------------------------------------------------------------- */
/*                                    DATA                                    */
/* -------------------------------------------------------------------------- */
const date=Date(Date.now()).toString()
const productos = [
  {
    nombre: 'goma',
    precio: 123,
    foto: 'www.someurl.com',
    id: 1,
    codigo: '',
    stock: 50,
    timestamp: `${date}`,
    descripcion:'un exelente producto'
  },
];
const carrito = [];
/* -------------------------------------------------------------------------- */
/*                                 HBS config                                 */
/* -------------------------------------------------------------------------- */

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.engine(
  'hbs',
  engine({
    extname: '.hbs',
    defaulLayout: 'index.hbs',
    layoutsDir: `${__dirname}/views/layout`,
    partialsDir: `${__dirname}/views/partials/`,
  })
);

/* -------------------------------------------------------------------------- */
/*                                   HELPERS                                   */
/* -------------------------------------------------------------------------- */
const findById = (arr, id) => arr.find((i) => i.id == id);

const deleteProd = (arr, prod) => {
  let i = arr.indexOf(prod);
  return arr.splice(i, 1);
};

const handleErrors=(err, req, res, next)=> {
  console.log(err)
  res.status(err.status || 500)
  res.send({
    error:{
      status:err.status || 500,
      message: err.message
    }
  });
};
/* -------------------------------------------------------------------------- */
/*                              RUTAS DE PRODUCTO                             */
/* -------------------------------------------------------------------------- */
/* ----------------------------------- GET ---------------------------------- */
routeProductos.get('/:id?', (req, res) => {
  const { id } = req.params;
  if (id && id !== undefined) {
    let founded = findById(productos, id);
    res.json({ founded });
  } else {
    res.render('productos-main', { layout: 'index', productos });
  }
});

/* ---------------------------------- POST ---------------------------------- */
routeProductos.post('/', (req, res) => {
  const { body } = req;
  body.id = uuidv4();
  console.log(body);
  productos.push(body);
  res.render('main', { layout: 'index' });
});

/* ----------------------------------- PUT ---------------------------------- */
routeProductos.put('/:id', (req, res) => {
  const { id } = req.params;
  let foundedItem = findById(productos, id);
  console.log(foundedItem, 'item encontrado');

  if (foundedItem) {
    const obj = { id: id, producto: 'producto nuevo', precio: 'precio nuevo' };
    Object.assign(foundedItem, obj);
    console.log(obj, '//', foundedItem);
    res.status(200).json({ mensaje: 'producto modificado con exito', obj });
  } else {
    res.status(400).json({ mensaje: 'el producto no se modifico', obj });
  }
});
/* --------------------------------- DELETE --------------------------------- */
routeProductos.delete('/:id', (req, res) => {
  const { id } = req.params;
  let found = findById(productos, id);
  deleteProd(productos, found);
  res.status(200).send('se elimino el producto');
});

/* -------------------------------------------------------------------------- */
/*                              RUTAS DE CARRITO                              */
/* -------------------------------------------------------------------------- */
/* ---------------------------------- POST ---------------------------------- */
routeCarrito.post('/', (req, res) => {
  carrito.push({ id: 2, productos: [] });
  res.status(200).json(carrito);
  console.log(carrito, 'carrito creado');
});
/* --------------------------------- DELETE --------------------------------- */
routeCarrito.delete('/:id', (req, res) => {
  const { id } = req.params;
  if (id) {
    carrito.splice(0, 1);
    res.status(200).send('carrito eliminado');
  } else {
    res.status(400).send('no se encontro el id, no se pudo eliminar el cart');
  }
});
routeCarrito.delete('/:id/productos/:id_prod', (req, res) => {
  const { id, id_prod } = req.params;
  if (id) {
    let cartProducts = [...carrito[0].productos];
    let deletedProduct = deleteProd(cartProducts, id_prod);
    res
      .status(200)
      .json({ mensaje: 'producto del carrito eliminado', deletedProduct });
  } else {
    res.status(400).send('no se pudo eliminar el producto');
  }
});
/* ----------------------------------- GET ---------------------------------- */

routeCarrito.get('/:id/productos', (req, res) => {
  let cartProds = [...carrito[0].productos];
  console.log(cartProds);
  res.render('productos-cart', { layout: 'index', cartProds });
});
/* ---------------------------------- POST ---------------------------------- */
routeCarrito.post('/:id/productos', (req, res) => {
  const { id } = req.params;
  const idProd = 1;
  if (id) {
    let newObj = findById(productos, idProd);
    carrito[0].productos.push(newObj);
    res.status(200).json(carrito);
  }
});
/* -------------------------------------------------------------------------- */
/*                               ERRORES DE RUTA                              */
/* -------------------------------------------------------------------------- */

//   res.status(400).json({ error: '-2', ruta:`ruta:${req.path}, metodo: ${req.method} no implementado ` })
  
// app.use((req,res,next)=>{
//   const err = new Error ("not found")
//   err.status=404
//   next(err)
// })
/* -------------------------------------------------------------------------- */
/*                               server config                               */
/* -------------------------------------------------------------------------- */
app.use('/api/carrito', routeCarrito);
app.use('/api/productos', routeProductos);
// app.use((err, req, res, next)=> {
//   console.log(err)
//   res.status(err.status || 500)
//   res.send({
//     error:{
//       status:err.status || 500,
//       message: err.message
//     }
//   })
// });

const server = app.listen(PORT, () => {
  console.log(`🚀 🚀 server is runing at http://localhost:${PORT}`);
});

server.on('error', (err) => {
  console.log(err);
});
