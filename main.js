const { app, BrowserWindow, ipcMain } = require('electron')

const isDev = require('electron-is-dev');

let mainWindow;

  const options = {
    client: 'sqlite3',
    connection: {
      filename: "./mydb.sqlite"
    },
    useNullAsDefault: true
    }

const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        webPreferences: { 
            nodeIntegration: true
        }
    });

    mainWindow.setMenu(null)

    if (isDev) {
        mainWindow.loadURL('http://localhost:3000')
    } else {
        mainWindow.loadFile('build/index.html')
    }

    
        mainWindow.webContents.openDevTools();
    

    mainWindow.on('closed', () => mainWindow = null);
}

app.on('ready', createWindow);

app.on('ready', () => {
    
    ipcMain.on('add-paciente', (event, arg) => {
        const knex = require('knex')(options);
        const name = arg.nombre +' '+ arg.dato
        knex('paciente').insert({ 
            nombre: arg.nombre,
            apellido_paterno: arg.apellido_paterno,
            apellido_materno: arg.apellido_materno,
            genero: arg.genero,
            nacimiento: arg.nacimiento,
            telefono: arg.telefono,
            sexo: arg.sexo
        })
        .catch((err) => { console.log(err); throw err })
        .finally(() => {
            knex.destroy();
        });
          
        event.returnValue = 'dato insertado'
      })

    ipcMain.on('add-sesion', (event, arg) => {
        const knex = require('knex')(options);
        knex('sesiones').insert({ 
            paciente: arg.paciente,
            fecha: arg.fecha
        }).returning('id')
        .then(function (id) {
        event.returnValue = id
        })
        .catch((err) => { console.log(err); throw err })
        .finally(() => {
            knex.destroy();
        });
      })

    ipcMain.on('add-esquema', (event, arg) => {
        const knex = require('knex')(options);
        knex('sesiones').where({ 'id': arg.id })
        .update({ esquema: arg.esquema })
        .catch((err) => { console.log(err); throw err })
        .finally(() => {
            knex.destroy();
        });
        event.returnValue = 'esquema insertado'
      })

    ipcMain.on('add-captura', (event, arg) => {
        const knex = require('knex')(options);
        knex('captura').insert({ 
            sesion: arg.sesion,
            identificador: arg.identificador,
            captura: arg.captura,
            descripcion: arg.descripcion
        }).returning('id')
        .then(function (id) {
        event.returnValue = id
        })
        .catch((err) => { console.log(err); throw err })
        .finally(() => {
            knex.destroy();
        });
      })
    
    ipcMain.on('get-pacientes', (event, arg) => {
        const knex = require('knex')(options);
        var pacientes=[];
        knex.from('paciente').select("*")
        .then((rows) => {
            for (row of rows) {
                var paciente = {
                    id: row.id, 
                    nombre: row.nombre,
                    apellido_paterno: row.apellido_paterno,
                    apellido_materno: row.apellido_materno,
                    genero: row.genero,
                    nacimiento: row.nacimiento,
                    telefono: row.telefono,
                    sexo: row.sexo
                };
                pacientes.push(paciente);
            }
            event.returnValue = pacientes
        }).catch((err) => { console.log( err); throw err })
        .finally(() => {
            knex.destroy();
        });
      })

    ipcMain.on('get-sesiones', (event, arg) => {
        const knex = require('knex')(options);
        var sesiones=[];
        knex.from('sesiones').select("*")
        .where({ paciente: arg.user_id })
        .then((rows) => {
            for (row of rows) {
                var sesion = {
                    id: row.id, 
                    fecha: row.fecha,
                    esquema: row.esquema,
                };
                sesiones.push(sesion);
            }
            event.returnValue = sesiones
        }).catch((err) => { console.log( err); throw err })
        .finally(() => {
            knex.destroy();
        });
      })
    
    ipcMain.on('get-capturas', (event, arg) => {
        const knex = require('knex')(options);
        var capturas=[];
        knex.from('captura').select("*")
        .where({ sesion: arg.sesion_id })
        .then((rows) => {
            for (row of rows) {
                var captura = {
                    id: row.id, 
                    identificador: row.identificador,
                    captura: row.captura,
                    descripcion: row.descripcion,
                };
                capturas.push(captura);
            }
            event.returnValue = capturas
        }).catch((err) => { console.log( err); throw err })
        .finally(() => {
            knex.destroy();
        });
    })
   
    ipcMain.on('get-paciente', (event, arg) => {
        const knex = require('knex')(options);
        var paciente;
        knex.from('paciente').select("*")
        .where({ id: arg.paciente_id })
        .then((rows) => {
            for (row of rows) {
                var paciente_row = {
                    id: row.id, 
                    nombre: row.nombre,
                    apellido_paterno: row.apellido_paterno,
                    apellido_materno: row.apellido_materno,
                    genero: row.genero,
                    nacimiento: row.nacimiento,
                    telefono: row.telefono,
                    sexo: row.sexo
                };
                paciente = paciente_row;
            }
            event.returnValue = paciente
        }).catch((err) => { console.log( err); throw err })
        .finally(() => {
            knex.destroy();
        });
    })
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});