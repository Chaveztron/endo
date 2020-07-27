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
    
      
      ipcMain.on('get-pacientes', (event, arg) => {
        const knex = require('knex')(options);
        var pacientes=[];
        knex.from('paciente').select("*")
        .then((rows) => {
            for (row of rows) {
                var paciente = {id: row.id, 'nombre': row.nombre };
                pacientes.push(paciente);
            }
            event.returnValue = pacientes
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