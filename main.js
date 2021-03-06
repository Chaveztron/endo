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
        width: 1634,
        height: 855,
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
            telefono: arg.telefono
        })
        .catch((err) => { console.log(err); throw err })
        .finally(() => {
            knex.destroy();
        });
          
        event.returnValue = 'dato insertado'
    })

    ipcMain.on('update-paciente', (event, arg) => {
        const knex = require('knex')(options);
        knex('paciente').where({ 'id': arg.id })
        .update({ 
            nombre: arg.nombre,
            apellido_paterno: arg.apellido_paterno,
            apellido_materno: arg.apellido_materno,
            genero: arg.genero,
            nacimiento: arg.nacimiento,
            telefono: arg.telefono
        })
        .catch((err) => { console.log(err); throw err })
        .finally(() => {
            knex.destroy();
        });
        event.returnValue = 'paciente actualizado'
    })

    ipcMain.on('add-sesion', (event, arg) => {
        const knex = require('knex')(options);
        knex('sesiones').insert({ 
            paciente: arg.paciente,
            fecha: arg.fecha,
            doctor: arg.doctor,
            asistente: arg.asistente,
            instrumento: arg.instrumento,
            procedimiento: arg.procedimiento,
            sedante: arg.sedante,
            motivo_estudio: arg.motivo_estudio,
            encabezado: arg.encabezado
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
                    visible: row.visible,
                    sesion: row.sesion
                };
                capturas.push(captura);
            }
            event.returnValue = capturas
        }).catch((err) => { console.log( err); throw err })
        .finally(() => {
            knex.destroy();
        });
    })

    ipcMain.on('update-captura', (event, arg) => {
        const knex = require('knex')(options);
        knex('captura').where({ 'id': arg.id })
        .update({ 
            identificador: arg.identificador,
            captura: arg.captura,
            descripcion: arg.descripcion,
            visible: arg.visible
        })
        .catch((err) => { console.log(err); throw err })
        .finally(() => {
            knex.destroy();
        });
        event.returnValue = 'captura actualizado'
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
                    telefono: row.telefono
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
                    paciente: row.paciente, 
                    fecha: row.fecha,
                    esquema: row.esquema,
                    hallazgo: row.hallazgo,
                    doctor: row.doctor,
                    procedimiento: row.procedimiento,
                    sedante: row.sedante,

                    motivo_estudio: row.motivo_estudio,
                    asistente: row.asistente,
                    instrumento: row.instrumento,

                    encabezado: row.encabezado
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
    
    ipcMain.on('get-sesion', (event, arg) => {
        const knex = require('knex')(options);
        var sesion;
        knex.from('sesiones').select("*")
        .where({ id: arg.sesion_id })
        .then((rows) => {
            for (row of rows) {
                var sesionF = {
                    id: row.id,
                    paciente: row.paciente, 
                    fecha: row.fecha,
                    esquema: row.esquema,
                    hallazgo: row.hallazgo,
                    doctor: row.doctor,
                    procedimiento: row.procedimiento,
                    sedante: row.sedante,

                    motivo_estudio: row.motivo_estudio,
                    asistente: row.asistente,
                    instrumento: row.instrumento,

                    encabezado: row.encabezado
                };
                sesion = sesionF;
            }
            event.returnValue = sesion
        }).catch((err) => { console.log( err); throw err })
        .finally(() => {
            knex.destroy();
        });
    })

    ipcMain.on('update-sesion', (event, arg) => {
        const knex = require('knex')(options);
        knex('sesiones').where({ 'id': arg.id })
        .update({ 
            fecha: arg.fecha,
            hallazgo: arg.hallazgo,
            doctor: arg.doctor,
            procedimiento: arg.procedimiento,
            sedante: arg.sedante,
            motivo_estudio: arg.motivo_estudio,
            asistente: arg.asistente,
            instrumento: arg.instrumento,
            encabezado: arg.encabezado,
            esquema: arg.esquema
        })
        .catch((err) => { console.log(err); throw err })
        .finally(() => {
            knex.destroy();
        });
        event.returnValue = 'sesion actualizada'
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
                    sedante: row.sedante,

                    motivo_estudio: row.motivo_estudio,
                    asistente: row.asistente,
                    instrumento: row.instrumento,

                    encabezado: row.encabezado
                };
                sesiones.push(sesion);
            }
            event.returnValue = sesiones
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
                    telefono: row.telefono
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

    ipcMain.on('add-asistente', (event, arg) => {
        const knex = require('knex')(options);
        knex('asistente').insert({ 
            asistente: arg.asistente,
        }).returning('id')
        .then(function (id) {
        event.returnValue = id
        })
        .catch((err) => { console.log(err); throw err })
        .finally(() => {
            knex.destroy();
        });
    })

    ipcMain.on('get-asistentes', (event, arg) => {
        const knex = require('knex')(options);
        var asistentes=[];
        knex.from('asistente').select("*")
        .then((rows) => {
            for (row of rows) {
                var asistente = {
                    id: row.id, 
                    asistente: row.asistente,
                };
                asistentes.push(asistente);
            }
            event.returnValue = asistentes
        }).catch((err) => { console.log( err); throw err })
        .finally(() => {
            knex.destroy();
        });
    })

    ipcMain.on('get-asistente', (event, arg) => {
        const knex = require('knex')(options);
        var asistente;
        knex.from('asistente').select("*")
        .where({ id: arg.asistente_id })
        .then((rows) => {
            for (row of rows) {
                var asistente_row = {
                    id: row.id,
                    asistente: row.asistente
                };
                asistente = asistente_row;
            }
            event.returnValue = asistente
        }).catch((err) => { console.log( err); throw err })
        .finally(() => {
            knex.destroy();
        });
    })

    ipcMain.on('del-asistente', (event, arg) => {
        const knex = require('knex')(options);
        knex('asistente').where({ 'id': arg.id })
        .del()
        .catch((err) => { console.log(err); throw err })
        .finally(() => {
            knex.destroy();
        });
        event.returnValue = 'borrado de la base de datos'
    })

    ipcMain.on('add-instrumento', (event, arg) => {
        const knex = require('knex')(options);
        knex('instrumento').insert({ 
            instrumento: arg.instrumento,
        }).returning('id')
        .then(function (id) {
        event.returnValue = id
        })
        .catch((err) => { console.log(err); throw err })
        .finally(() => {
            knex.destroy();
        });
    })

    ipcMain.on('get-instrumentos', (event, arg) => {
        const knex = require('knex')(options);
        var instrumentos=[];
        knex.from('instrumento').select("*")
        .then((rows) => {
            for (row of rows) {
                var instrumento = {
                    id: row.id, 
                    instrumento: row.instrumento,
                };
                instrumentos.push(instrumento);
            }
            event.returnValue = instrumentos
        }).catch((err) => { console.log( err); throw err })
        .finally(() => {
            knex.destroy();
        });
    })

    ipcMain.on('get-instrumento', (event, arg) => {
        const knex = require('knex')(options);
        var instrumento;
        knex.from('instrumento').select("*")
        .where({ id: arg.instrumento_id })
        .then((rows) => {
            for (row of rows) {
                var instrumento_row = {
                    id: row.id,
                    instrumento: row.instrumento
                };
                instrumento = instrumento_row;
            }
            event.returnValue = instrumento
        }).catch((err) => { console.log( err); throw err })
        .finally(() => {
            knex.destroy();
        });
    })

    ipcMain.on('del-instrumento', (event, arg) => {
        const knex = require('knex')(options);
        knex('instrumento').where({ 'id': arg.id })
        .del()
        .catch((err) => { console.log(err); throw err })
        .finally(() => {
            knex.destroy();
        });
        event.returnValue = 'borrado de la base de datos'
    })

    ipcMain.on('add-encabezado', (event, arg) => {
        const knex = require('knex')(options);
        knex('encabezado').insert({ 
            direccion: arg.direccion,
            empresa: arg.empresa,
            giro: arg.giro,
            telefono: arg.telefono
        }).returning('id')
        .then(function (id) {
        event.returnValue = id
        })
        .catch((err) => { console.log(err); throw err })
        .finally(() => {
            knex.destroy();
        });
    })

    ipcMain.on('get-encabezados', (event, arg) => {
        const knex = require('knex')(options);
        var encabezados=[];
        knex.from('encabezado').select("*")
        .then((rows) => {
            for (row of rows) {
                var encabezado = {
                    id: row.id, 
                    direccion: row.direccion,
                    empresa: row.empresa,
                    giro: row.giro,
                    telefono: row.telefono
                };
                encabezados.push(encabezado);
            }
            event.returnValue = encabezados
        }).catch((err) => { console.log( err); throw err })
        .finally(() => {
            knex.destroy();
        });
    })

    ipcMain.on('get-encabezado', (event, arg) => {
        const knex = require('knex')(options);
        var encabezado;
        knex.from('encabezado').select("*")
        .where({ id: arg.encabezado_id })
        .then((rows) => {
            for (row of rows) {
                var encabezado_row = {
                    id: row.id, 
                    direccion: row.direccion,
                    empresa: row.empresa,
                    giro: row.giro,
                    telefono: row.telefono
                };
                encabezado = encabezado_row;
            }
            event.returnValue = encabezado
        }).catch((err) => { console.log( err); throw err })
        .finally(() => {
            knex.destroy();
        });
    })

    ipcMain.on('del-encabezado', (event, arg) => {
        const knex = require('knex')(options);
        knex('encabezado').where({ 'id': arg.id })
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