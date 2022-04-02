// eslint-disable-next-line import/no-unresolved
const express = require('express');
const { engine } = require('express-handlebars');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT ?? 8080;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
/* -------------------------------------------------------------------------- */
/*                                    MLWS                                    */
/* -------------------------------------------------------------------------- */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

/* -------------------------------------------------------------------------- */
/*                                   ROUTES                                   */
/* -------------------------------------------------------------------------- */
const routeCarrito = express.Router();
const routeProductos = express.Router();
app.use('/api/carrito', routeCarrito);
app.use('/api/productos', routeProductos);
/* -------------------------------------------------------------------------- */
/*                                    DATA                                    */
/* -------------------------------------------------------------------------- */
const dateServer = Date(Date.now()).toString();
const DATA_PATH = 'src/data/productos.txt';

const fsProductos = [
  {
    nombre: 'goma',
    precio: 123,
    foto: 'www.someurl.com',
    id: 1,
    codigo: '',
    stock: 50,
    timestamp: `${dateServer}`,
    descripcion: 'un exelente producto',
  },
];

fs.writeFileSync(DATA_PATH, JSON.stringify(fsProductos));

const prods = fs.readFileSync(DATA_PATH, 'utf-8');
const productos = JSON.parse(prods);

const cargarArchivo = (data) => {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data));
};

const carrito = [];
const admin = true;
/* -------------------------------------------------------------------------- */
/*                                 HBS config                                 */
/* -------------------------------------------------------------------------- */
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

/* -------------------------------------------------------------------------- */
/*                              RUTAS DE PRODUCTO                             */
/* -------------------------------------------------------------------------- */
/* ----------------------------------- GET ---------------------------------- */

routeProductos.get('/:id?', (req, res) => {
  const { id } = req.params;
  if (id && id !== undefined) {
    let founded = findById(productos, id);
    if (founded) {
      res.json(founded);
    } else {
      let cart = carrito[0]
      res.render('error', { layout: 'index',cart});
    }
  } else {
    
    res.render('productos-main', {
      layout: 'index',
      admin,
      productos,
    });
  }
});

/* ---------------------------------- POST ---------------------------------- */
routeProductos.post('/', (req, res) => {
  const ERR_ADMIN = {
    error: '-1',
    ruta: `${req.path}`,
    metodo: `${req.method} `,
  };

  if (admin) {
    const { body } = req;
    const date = Date(Date.now()).toString();
    body.id = uuidv4();
    body.timestamp = date;
    console.log(body);
    productos.push(body);
    cargarArchivo(productos);
    res.render('main', { layout: 'index', admin });
  } else {
    res.render('error', { layout: 'index', err: ERR_ADMIN });
  }
});

/* ----------------------------------- PUT ---------------------------------- */
routeProductos.put('/:id', (req, res) => {
  const ERR_ADMIN = {
    error: '-1',
    ruta: `${req.path}`,
    metodo: `${req.method} `,
  };

  if (admin) {
    const { id } = req.params;
    let foundedItem = findById(productos, id);
    console.log(foundedItem, 'item encontrado');

    if (foundedItem) {
      const obj = {
        id: id,
        nombre: 'producto nuevo',
        precio: 'precio nuevo',
      };
      Object.assign(foundedItem, obj);
      console.log(obj, '//', foundedItem);
      res.status(200).json({ mensaje: 'producto modificado con exito', obj });
    } else {
      res.status(400).json({ mensaje: 'el producto no se modifico', obj });
    }
  } else {
    res.render('error', { layout: 'index', err: ERR_ADMIN });
  }
});
/* --------------------------------- DELETE --------------------------------- */
routeProductos.delete('/:id', (req, res) => {
  const ERR_ADMIN = {
    error: '-1',
    ruta: `${req.path}`,
    metodo: `${req.method} `,
  };

  if (admin) {
    const { id } = req.params;
    let found = findById(productos, id);
    deleteProd(productos, found);
    cargarArchivo(productos);
    res.status(200).send('se elimino el producto');
  } else {
    res.render('error', { layout: 'index', err: ERR_ADMIN });
  }
});

/* -------------------------------------------------------------------------- */
/*                              RUTAS DE CARRITO                              */
/* -------------------------------------------------------------------------- */
/* ---------------------------------- POST ---------------------------------- */
routeCarrito.post('/', (req, res) => {
  const ERR_ADMIN = {
    error: '-1',
    ruta: `${req.path}`,
    metodo: `${req.method} `,
  };

  if (admin) {
    carrito.push({ id: 2, productos: [] });
    
    let cart=carrito[0]
    res.render('carrito',{layout:'index', cart})
  } else {
    res.render('error', { layout: 'index', err: ERR_ADMIN });
  }
});

routeCarrito.post('/:id/productos', (req, res) => {
  const ERR_ADMIN = {
    error: '-1',
    ruta: `${req.path}`,
    metodo: `${req.method} `,
  };

  if (admin) {
    const { id } = req.params;
    const idProd = 1; //este id luego sera dinamico para obtener cualquier id de producto
    if (id) {
      let newObj = findById(productos, idProd);
      carrito[0].productos.push(newObj);
      res.status(200).json(carrito);
      // res.render('productos-cart', { layout: 'index' });
      
    }
  } else {
    res.render('error', { layout: 'index', err: ERR_ADMIN });
  }
});

/* --------------------------------- DELETE --------------------------------- */
routeCarrito.delete('/:id', (req, res) => {
  const ERR_ADMIN = {
    error: '-1',
    ruta: `${req.path}`,
    metodo: `${req.method} `,
  };

  if (admin) {
    const { id } = req.params;
    if (id) {
      carrito.splice(0, 1);
      res.status(200).send('carrito eliminado');
    } else {
      res.status(400).send('no se encontro el id, no se pudo eliminar el cart');
    }
  } else {
    res.render('error', { layout: 'index', err: ERR_ADMIN });
  }
});
routeCarrito.delete('/:id/productos/:id_prod', (req, res) => {
  const ERR_ADMIN = {
    error: '-1',
    ruta: `${req.path}`,
    metodo: `${req.method} `,
  };

  if (admin) {
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
  } else {
    res.render('error', { layout: 'index', err: ERR_ADMIN });
  }
});
/* ----------------------------------- GET ---------------------------------- */

routeCarrito.get('/:id/productos', (req, res) => {
  const ERR_ADMIN = {
    error: '-1',
    ruta: `${req.path}`,
    metodo: `${req.method} `,
  };

  if (admin) {
    let cartProds = [...carrito[0].productos];
   
    res.render('productos-cart', { layout: 'index', cartProds });
  } else {
    res.render('error', { layout: 'index', err: ERR_ADMIN });
  }
});

/* -------------------------------------------------------------------------- */
/*                               ERRORES DE RUTA                              */
/* -------------------------------------------------------------------------- */
app.get('*', (req, res) => {
  const ERR_ROUTE = {
    error: '-2',
    ruta: `${req.path}`,
    metodo: `${req.method} `,
  };
  res.render('error', { layout: 'index', err: ERR_ROUTE });
});
//por el momento el manejo los errores tipo objeto lo solucione creando variables, luego lo mutare a clases
/* -------------------------------------------------------------------------- */
/*                               server config                               */
/* -------------------------------------------------------------------------- */

const server = app.listen(PORT, () => {
  console.log(`🚀 🚀 server is runing at http://localhost:${PORT}`);
});

server.on('error', (err) => {
  console.log(err);
});
