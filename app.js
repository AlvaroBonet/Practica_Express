const express = require('express');
const path = require('path'); 
const app = express();
const mysql = require('mysql');
const bodyParser = require('body-parser');
// Utilizamos modulo body-parser para que retorne los datos del formulario
// en un json para que sea mas facil de manejar
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Crear la conexión a la base de datos
const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 't2p2'
});

// Conectar a la base de datos
connection.connect((err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
        return;
    }
    console.log('Conectado a la base de datos MySQL');
});

app.get('/', (req, res) => {
    // Utiliza path.join para construir la ruta completa
    const indexPath = path.join(__dirname, 'public', 'templates', 'vuelos', 'index.html');
    res.sendFile(indexPath);
});

/////////////////////////////////////////////
//////////// RUTAS CON VISTAS //////////////
////////////////////////////////////////////
// Ruta de index de equipos
app.get('/vuelos/index', function(req, res){
    let dir = __dirname + '/public/templates/vuelos/index.html';
    
    res.sendFile(dir, (err) => {
        if(err){
            console.log('ERROR EN LA UBICACION');
            res.status(err.status);
        }else{
            console.log('Encontrado correctamente');
        }
    });
});

// Ruta para ver un jugador
app.get('/vuelos/show/:id', function(req, res){
    let dir = __dirname + '/public/templates/vuelos/show.html';

    res.sendFile(dir, (err) => {
        if(err){
            console.log('ERROR EN LA UBICACION');
            res.status(err.status);
        }else{
            console.log('Encontrado correctamente');
        }
    });
});

// Ruta para ver un jugador
app.get('/vuelos/edit/:id', function(req, res){
    let dir = __dirname + '/public/templates/vuelos/edit.html';

    res.sendFile(dir, (err) => {
        if(err){
            console.log('ERROR EN LA UBICACION');
            res.status(err.status);
        }else{
            console.log('Encontrado correctamente');
        }
    });
});

// Ruta para crear un jugador
app.get('/vuelos/create', function(req, res){
    let dir = __dirname + '/public/templates/vuelos/create.html';

    res.sendFile(dir, (err) => {
        if(err){
            res.status(404);
        }else{
            console.log("Encontrado correctamente");
        }
    })
})

///////////////////////////////////////////////////////////
////////// RUTAS QUE REALIZAN ACCIONES EN LA BD  //////////
///////////////////////////////////////////////////////////
// Ruta que devuelve todos los datos de los vuelos
app.get('/vuelos-all', function(req, res) {
    // 1. Generar la query
    let query = "SELECT * FROM vuelos";

    // 2. Ejecutar la query
    connection.query(query, (err, vuelos) => {
        if (err) {
            console.error('Error en la query:', err);
            res.status(500).send("Error en la query");
        } else {
            // 3. Devolver datos en formato JSON
            res.json(vuelos);
        }
    });
});

/**
 * Ruta para recoger un jugador por id
 */
app.get('/vuelo/:id', function(req, res){
    // Recogemos el id como parametro recibido en la peticion.
    let id = req.params.id;
    console.log(id);
    // Generar consulta abierta al valor del id
    let query = "SELECT * FROM vuelos WHERE id = ?";

    // Realizar la consulta
    connection.query(query, [id], function(err, row) {
        console.log(query);
        // Si hay error, mandar mensaje de error
        if(err){
            err.message
            res.status(500).send('Error: ' + err.message);
        }
        // Si el valor de respuesta es indefinido, la consulta no tiene resultado pero es correcta
        if(row == 'undefined'){
            res.status(200).send('No hay datos');
        }
        // Si el valor row tiene resultados, entonces lo retornamos
        else{
            res.json(row);
        }
    });
});

/**
 * Ruta para eliminar un jugador
 */
app.delete(`/vuelos/delete/:id`, (req, res) => {
    // Recogemos el id como parametro recibido en la peticion.
    let id = req.params.id;

    // Generar consulta abierta al valor del id
    let query = "DELETE FROM vuelos WHERE id = ?";

    console.log(id);
    // Ejecutar sentencia SQL de eliminacion.
    connection.query(query, [id], function(err) {
        if(err){
            res.status(500).send('Error: ' + err.message);
        }
        res.status(200).send("Eliminado correctamente");
    });
})

/**
 * Ruta para guardar un jugador
 */
app.post('/vuelos/save', (req, res) => {
    console.log(req.body);
    // Generamos la sentencia SQL de insercion abierta a los datos recibidos por el formulario
    let query = `INSERT INTO vuelos (numero_vuelo, aerolinea, origen, destino, fecha_salida, hora_salida, fecha_llegada, hora_llegada) VALUES ('${req.body.numero_vuelo}', '${req.body.aerolinea}', '${req.body.origen}', '${req.body.destino}', '${req.body.fecha_salida}', '${req.body.hora_salida}', '${req.body.fecha_llegada}', '${req.body.hora_llegada}');`;
    // Ejecucion de la sentencia SQL con los parametros correspondientes
    connection.query(query, function (err){
        if(err){
            res.status(500).send("Error al crear el jugador");
        }
    });

    // Redirect realiza una redireccion a la URL especificada.
    // El codigo 300 del primer argumento es OPCIONAL. Indica codigo de respuesta.
    res.redirect(302, '/vuelos/index');
    // res.redirect(301, 'http://example.com')
});

/**
 * Ruta para actualizar un jugador
 */
app.put('/vuelos/update/:id', (req, res) => {
    // Recogemos el id como parametro recibido en la peticion.
    let id = req.params.id;
    
        // Generar consulta abierta al valor del id
        let query = `UPDATE vuelos SET numero_vuelo = '${req.body.numero_vuelo}', 
            aerolinea = '${req.body.aerolinea}', 
            origen = '${req.body.origen}', 
            destino = '${req.body.destino}', 
            fecha_salida = '${req.body.fecha_salida}', 
            hora_salida = '${req.body.hora_salida}', 
            fecha_llegada = '${req.body.fecha_llegada}', 
            hora_llegada = '${req.body.hora_llegada}' 
            WHERE id = ${id}`;
    // 6 interrogaciones que sustituir
    connection.query(query,[], function (error, results, fields) {
        console.log(query);
        if (error) {
            
        }else if(results){
            res.json({message : true});
        }
        // res.redirect('/vuelos/index');
    });
})

const port = 3000;
app.listen(port, () => {
    console.log(`Servidor: http://localhost:${port}`);
});
