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
            fecha: arg.fecha,
            doctor: arg.doctor,
            procedimiento: arg.procedimiento,
            sedante: arg.sedante
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

    ipcMain.on('add-hallazgo', (event, arg) => {
        const knex = require('knex')(options);
        knex('sesiones').where({ 'id': arg.id })
        .update({ hallazgo: arg.hallazgo })
        .catch((err) => { console.log(err); throw err })
        .finally(() => {
            knex.destroy();
        });
        event.returnValue = 'hallazgo insertado'
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

    ipcMain.on('del-paciente', (event, arg) => {
        const knex = require('knex')(options);
        knex('paciente').where({ 'id': arg.id })
        .del()
        .catch((err) => { console.log(err); throw err })
        .finally(() => {
            knex.destroy();
        });
        event.returnValue = 'borrado de la base de datos'
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
                    hallazgo: row.hallazgo,
                    doctor: row.doctor,
                    procedimiento: row.procedimiento,
                    sedante: row.sedante
                };
                sesiones.push(sesion);
            }
            event.returnValue = sesiones
        }).catch((err) => { console.log( err); throw err })
        .finally(() => {
            knex.destroy();
        });
      })

    ipcMain.on('del-sesion', (event, arg) => {
        const knex = require('knex')(options);
        knex('sesiones').where({ 'id': arg.id })
        .del()
        .catch((err) => { console.log(err); throw err })
        .finally(() => {
            knex.destroy();
        });
        knex('captura').where({ 'sesion': arg.id })
        .del()
        .catch((err) => { console.log(err); throw err })
        .finally(() => {
            knex.destroy();
        });
        event.returnValue = 'borrado de la base de datos'
    })
    
    ipcMain.on('get-todas_sesiones', (event, arg) => {
        const knex = require('knex')(options);
        var sesiones=[];
        knex.from('sesiones').select("*")
        .then((rows) => {
            for (row of rows) {
                var sesion = {
                    id: row.id,
                    paciente: row.paciente, 
                    fecha: row.fecha,
                    esquema: row.esquema,
                    hallazgo: row.hallazgo,
                    doctor: row.doctor,
                    procedimiento: row.procedimiento,
                    sedante: row.sedante
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

    ipcMain.on('add-doctor', (event, arg) => {
        const knex = require('knex')(options);
        knex('doctor').insert({ 
            doctor: arg.doctor,
        }).returning('id')
        .then(function (id) {
        event.returnValue = id
        })
        .catch((err) => { console.log(err); throw err })
        .finally(() => {
            knex.destroy();
        });
      })

    ipcMain.on('get-doctores', (event, arg) => {
        const knex = require('knex')(options);
        var doctores=[];
        knex.from('doctor').select("*")
        .then((rows) => {
            for (row of rows) {
                var doctor = {
                    id: row.id, 
                    doctor: row.doctor,
                };
                doctores.push(doctor);
            }
            event.returnValue = doctores
        }).catch((err) => { console.log( err); throw err })
        .finally(() => {
            knex.destroy();
        });
      })
    
    ipcMain.on('get-doctor', (event, arg) => {
        const knex = require('knex')(options);
        var doctor;
        knex.from('doctor').select("*")
        .where({ id: arg.doctor_id })
        .then((rows) => {
            for (row of rows) {
                var doctor_row = {
                    id: row.id,
                    doctor: row.doctor
                };
                doctor = doctor_row;
            }
            event.returnValue = doctor
        }).catch((err) => { console.log( err); throw err })
        .finally(() => {
            knex.destroy();
        });
    })

    ipcMain.on('del-doctor', (event, arg) => {
        const knex = require('knex')(options);
        knex('doctor').where({ 'id': arg.id })
        .del()
        .catch((err) => { console.log(err); throw err })
        .finally(() => {
            knex.destroy();
        });
        event.returnValue = 'borrado de la base de datos'
    })

    ipcMain.on('add-procedimiento', (event, arg) => {
        const knex = require('knex')(options);
        knex('procedimiento').insert({ 
            procedimiento: arg.procedimiento,
        }).returning('id')
        .then(function (id) {
        event.returnValue = id
        })
        .catch((err) => { console.log(err); throw err })
        .finally(() => {
            knex.destroy();
        });
      })

    ipcMain.on('get-procedimientos', (event, arg) => {
        const knex = require('knex')(options);
        var procedimientos=[];
        knex.from('procedimiento').select("*")
        .then((rows) => {
            for (row of rows) {
                var procedimiento = {
                    id: row.id, 
                    procedimiento: row.procedimiento,
                };
                procedimientos.push(procedimiento);
            }
            event.returnValue = procedimientos
        }).catch((err) => { console.log( err); throw err })
        .finally(() => {
            knex.destroy();
        });
      })

    ipcMain.on('get-procedimiento', (event, arg) => {
        const knex = require('knex')(options);
        var procedimiento;
        knex.from('procedimiento').select("*")
        .where({ id: arg.procedimiento_id })
        .then((rows) => {
            for (row of rows) {
                var procedimiento_row = {
                    id: row.id,
                    procedimiento: row.procedimiento
                };
                procedimiento = procedimiento_row;
            }
            event.returnValue = procedimiento
        }).catch((err) => { console.log( err); throw err })
        .finally(() => {
            knex.destroy();
        });
    })

    ipcMain.on('del-procedimiento', (event, arg) => {
        const knex = require('knex')(options);
        knex('procedimiento').where({ 'id': arg.id })
        .del()
        .catch((err) => { console.log(err); throw err })
        .finally(() => {
            knex.destroy();
        });
        event.returnValue = 'borrado de la base de datos'
    })

    ipcMain.on('add-sedante', (event, arg) => {
        const knex = require('knex')(options);
        knex('sedante').insert({ 
            sedante: arg.sedante,
        }).returning('id')
        .then(function (id) {
        event.returnValue = id
        })
        .catch((err) => { console.log(err); throw err })
        .finally(() => {
            knex.destroy();
        });
      })

    ipcMain.on('get-sedantes', (event, arg) => {
        const knex = require('knex')(options);
        var sedantes=[];
        knex.from('sedante').select("*")
        .then((rows) => {
            for (row of rows) {
                var sedante = {
                    id: row.id, 
                    sedante: row.sedante,
                };
                sedantes.push(sedante);
            }
            event.returnValue = sedantes
        }).catch((err) => { console.log( err); throw err })
        .finally(() => {
            knex.destroy();
        });
      })

    ipcMain.on('get-sedante', (event, arg) => {
        const knex = require('knex')(options);
        var sedante;
        knex.from('sedante').select("*")
        .where({ id: arg.sedante_id })
        .then((rows) => {
            for (row of rows) {
                var sedante_row = {
                    id: row.id,
                    sedante: row.sedante
                };
                sedante = sedante_row;
            }
            event.returnValue = sedante
        }).catch((err) => { console.log( err); throw err })
        .finally(() => {
            knex.destroy();
        });
    })

    ipcMain.on('del-sedante', (event, arg) => {
        const knex = require('knex')(options);
        knex('sedante').where({ 'id': arg.id })
        .del()
        .catch((err) => { console.log(err); throw err })
        .finally(() => {
            knex.destroy();
        });
        event.returnValue = 'borrado de la base de datos'
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