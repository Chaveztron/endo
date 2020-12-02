import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Route, NavLink } from 'react-router-dom'
import queryString from 'query-string'
import './App.css'
import { Button, Card, Elevation, ControlGroup, InputGroup } from "@blueprintjs/core";
import Webcam from "react-webcam";
import { Form, Input, Select, NumInput, Radios, DatePiker } from "./components";
import HomePage from "./esquemaJs/HomePage";
import { useReactToPrint } from 'react-to-print';
import { Container, Row, Col, Card as Card2, Form as BForm } from "react-bootstrap";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import ReactHtmlParser from 'react-html-parser';

const { ipcRenderer } = window.require("electron");

const App = () => {
  return (
    <BrowserRouter>
      <nav class="bp3-navbar .modifier">
        <div class="bp3-navbar-group bp3-align-left">
        <Route render={NavegacionImperativa} />
        <span class="bp3-navbar-divider"></span>
          <div class="bp3-navbar-heading">EndoClinic</div>
          <input class="bp3-input" placeholder="Search files..." type="text" />
        </div>
        <div class="bp3-navbar-group bp3-align-right">
        <NavLink to='/' exact activeClassName='active'><button class="bp3-button bp3-minimal bp3-intent-success bp3-icon-add">Agregar paciente</button></NavLink>
        <NavLink to='/Pacientes' activeClassName='active'><button class="bp3-button bp3-minimal bp3-icon-database">Pacientes</button></NavLink>
        <NavLink to='/sesiones' activeClassName='active'><button class="bp3-button bp3-minimal bp3-icon-document">Sesiones</button></NavLink>
        <NavLink to='/configuracion' activeClassName='active'><button class="bp3-button bp3-minimal bp3-icon-cog">Configuracion</button></NavLink>
          <span class="bp3-navbar-divider"></span>
          <button class="bp3-button bp3-minimal bp3-icon-user"></button>
          <button class="bp3-button bp3-minimal bp3-icon-notifications"></button>
          <button class="bp3-button bp3-minimal bp3-icon-cog"></button>
        </div>
      </nav>
      <Route path='/' exact render={Add_paciente}/>
      <Route path='/Pacientes' render={(props)=> <Pacientes {...props} />} />
      <Route path='/videos' render={(props)=> <Videos {...props} />} />
      <Route path='/esquema' render={(props)=> <Esquema {...props} />} />
      <Route path='/estudios' render={(props)=> <Estudios {...props} />} />
      <Route path='/sesiones' render={(props)=> <Sesiones {...props} />} />
      <Route path='/reportes' render={(props)=> <Reportes {...props} />} />
      <Route path='/configuracion' render={(props)=> <Configuracion {...props} />} />
    </BrowserRouter>
  )
}

const Add_paciente = (props) => {
  const onSubmit = data => {
    console.log(data)
    console.log(ipcRenderer.sendSync('add-paciente', {
      nombre: data.Nombre,
      apellido_paterno: data.Apellido_paterno,
      apellido_materno: data.Apellido_materno,
      genero: data.Genero,
      nacimiento: data.Nacimiento,
      telefono: data.Telefono,
      sexo: data.Sexo
    }))    
  };
  return(
    <React.Fragment>
      <h1>Agregar Paciente</h1>
      <Form onSubmit={onSubmit}>
        <Input name="Nombre"/>
        <Input name="Apellido_paterno" />
        <Input name="Apellido_materno" />
        <NumInput name="Telefono"/>
        <Radios name="Genero" values={["Hombre", "Mujer"]}/>
        <Select name="Sexo" options={["mujer", "hombre"]} />
        <DatePiker name="Nacimiento"/>
        <Button type="submit" value="Submit" >Agregar </Button>
      </Form> 
    </React.Fragment>
  )
}

const Configuracion = (props) => {
  const [doctores, setDoctores] = useState(ipcRenderer.sendSync('get-doctores'));
  const [doctor, setDoctor] = useState("");
  const [procedimientos, setProcedimientos] = useState(ipcRenderer.sendSync('get-procedimientos'));
  const [procedimiento, setProcedimiento] = useState("");
  const [sedantes, setSedantes] = useState(ipcRenderer.sendSync('get-sedantes'));
  const [sedante, setSedante] = useState("");

  const handleSubmitDoctor = (evt) => {
    evt.preventDefault();
    var idTemp = ipcRenderer.sendSync('add-doctor', { doctor: doctor })
    setDoctores(doctores => [...doctores,{id: idTemp, doctor: doctor}])      
  }

  const handleSubmitProcedimiento = (evt) => {
    evt.preventDefault();
    var idTemp = ipcRenderer.sendSync('add-procedimiento', { procedimiento: procedimiento })
    setProcedimientos(procedimientos => [...procedimientos,{id: idTemp, procedimiento: procedimiento}])      
  }

  const handleSubmitSedante = (evt) => {
    evt.preventDefault();
    var idTemp = ipcRenderer.sendSync('add-sedante', { sedante: sedante })
    setSedantes(sedantes => [...sedantes,{id: idTemp, sedante: sedante }])      
  }

  const deleteDoctor = (i) => {
    console.log(ipcRenderer.sendSync('del-doctor', {
      id: doctores[i].id,
    }))
    const newDoctores = [...doctores]
    newDoctores.splice(i, 1)
    setDoctores(newDoctores)
  }

  const deleteProcedimiento = (i) => {
    console.log(ipcRenderer.sendSync('del-procedimiento', {
      id: procedimientos[i].id,
    }))
    const newProcedimientos = [...procedimientos]
    newProcedimientos.splice(i, 1)
    setProcedimientos(newProcedimientos)
  }

  const deleteSedante = (i) => {
    console.log(ipcRenderer.sendSync('del-sedante', {
      id: sedantes[i].id,
    }))
    const newSedantes = [...sedantes]
    newSedantes.splice(i, 1)
    setSedantes(newSedantes)
  }

  return(
    <React.Fragment>
      <h1>Configuracion</h1>

    <form onSubmit={handleSubmitDoctor}>
        <ControlGroup fill={false} vertical={false}>
        <InputGroup placeholder="Nombre de la doctora" type="text" value={doctor}
          onChange={e => setDoctor(e.target.value)} 
        />
        <Button icon="add" type="submit" value="Submit">Agregar Doctor@</Button>
        </ControlGroup>
    </form>
    <ul>
    {doctores.map((doctor, index) => (      
      <li>{doctor.id} {doctor.doctor}
      <button onClick={() => deleteDoctor(index)} class="bp3-button bp3-minimal bp3-icon-trash"/>
      </li>
    ))}
    </ul>

    <form onSubmit={handleSubmitProcedimiento}>
          <ControlGroup fill={false} vertical={false}>
          <InputGroup placeholder="Procedimiento" type="text" value={procedimiento}
            onChange={e => setProcedimiento(e.target.value)} 
          />
          <Button icon="add" type="submit" value="Submit">Agregar Procedimiento</Button>
          </ControlGroup>
      </form>
      <ul>
      {procedimientos.map((procedimiento, index) => (      
        <li>{procedimiento.id} {procedimiento.procedimiento}
        <button onClick={() => deleteProcedimiento(index)} class="bp3-button bp3-minimal bp3-icon-trash"/>
        </li>
      ))}
      </ul>

      <form onSubmit={handleSubmitSedante}>
          <ControlGroup fill={false} vertical={false}>
          <InputGroup placeholder="Procedimiento" type="text" value={sedante}
            onChange={e => setSedante(e.target.value)} 
          />
          <Button icon="add" type="submit" value="Submit">Agregar Grupo de sedante</Button>
          </ControlGroup>
      </form>
      <ul>
      {sedantes.map((sedante, index) => (      
        <li>{sedante.id} {sedante.sedante}
        <button onClick={() => deleteSedante(index)} class="bp3-button bp3-minimal bp3-icon-trash"/>
        </li>
      ))}
      </ul>

    
    </React.Fragment>
  )
}

const Pacientes = (props) => {
  const [users, setUser] = useState(ipcRenderer.sendSync('get-pacientes'))
  const [toggleState, setToggleState] = useState(false)

  const [search, setSearch] = useState('');
  const [filteredPacientes, setFilteredPacientes] = useState([]);

  useEffect(() => {
    setFilteredPacientes(
      users.filter( user => {
        return (user.nombre.toLowerCase()
        +user.apellido_paterno.toLowerCase()
        +user.apellido_materno.toLowerCase()).includes(search.toLowerCase())
      })
    )
  },[search, users])

  const deletePaciente = (i) => {
      let sesiones = (ipcRenderer.sendSync('get-sesiones', {
        user_id: users[i].id,
      }))
      sesiones.map((sesion) => (
        console.log(ipcRenderer.sendSync('del-sesion', {
          id: sesion.id,
        }))
      ))
      console.log(ipcRenderer.sendSync('del-paciente', {
        id: users[i].id,
      }))
      const newPacientes = [...users]
      newPacientes.splice(i, 1)
      setUser(newPacientes)
  }

  const toggle = () => {
    setToggleState(toggleState === false ? true : false)
  }

  return(
    <React.Fragment>
    <h1>Pacientes</h1>
    <button onClick={toggle}>{toggleState?"Cancelar": "Editar"}</button>
    
    <input
    type="text"
    placeholder="Buscar paciente"
    onChange={(e) => setSearch(e.target.value)}
    />

      <table class="bp3-html-table bp3-html-table-bordered bp3-html-table-condensed bp3-html-table-striped bp3-interactive bp3-small">
      <thead>
        <tr>
          <th>id</th>
          <th>Nombre</th>
          <th>A.Paterno</th>
          <th>A.Materno</th>
          <th>Telefono</th>
          <th>Sexo</th>
          <th>Genero</th>
          <th>Nacimiento</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {filteredPacientes.map((user, index) =>(
          <tr key={user.id}>
            <td>{ user.id }</td>
            <td>{ user.nombre }</td>
            <td>{ user.apellido_paterno }</td>
            <td>{ user.apellido_materno }</td>
            <td>{ user.telefono }</td>
            <td>{ user.sexo }</td>
            <td>{ user.genero }</td>            
            <td>{ user.nacimiento }</td>
            <td>
            <NavLink to={`/videos?id=${user.id}`}>
            <button class="bp3-button bp3-minimal bp3-icon-desktop"/>
            </NavLink>
            <NavLink 
            to={{pathname:'/estudios',
            estudiosProps:{
              user_id: user.id
            }}}
            >
            <button class="bp3-button bp3-minimal bp3-icon-document"/>
            </NavLink>
            {toggleState?
              <React.Fragment>
              <button onClick={() => deletePaciente(index)} class="bp3-button bp3-minimal bp3-icon-trash"/>
              </React.Fragment>
            :<button class="bp3-button bp3-minimal bp3-icon-trash" disabled/>}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    </React.Fragment>
    )    
}

const Estudios = (props) => {
  const [estudios, setEstudios] = useState(ipcRenderer.sendSync('get-sesiones', {
    user_id:  props.location.estudiosProps.user_id
  }))
  const [toggleState, setToggleState] = useState(false)

  const deleteEstudio = (i) => {
    console.log(ipcRenderer.sendSync('del-sesion', {
      id: estudios[i].id,
    }))
    const newEstudios = [...estudios]
    newEstudios.splice(i, 1)
    setEstudios(newEstudios)
}

const toggle = () => {
  setToggleState(toggleState === false ? true : false)
}


  console.log(estudios)
  return(
    <React.Fragment>
    <h1>Estudios</h1>
    <button onClick={toggle}>{toggleState?"Cancelar": "Editar"}</button>
      <table class="bp3-html-table bp3-html-table-bordered bp3-html-table-condensed bp3-html-table-striped bp3-interactive bp3-small">
      <thead>
        <tr>
          <th>id</th>
          <th>Fecha</th>
          <th>acciones</th>
        </tr>
      </thead>
      <tbody>
        {estudios.map((estudio,index) =>(
          <tr key={estudio.id}>
            <td>{ estudio.id }</td>
            <td>
            {new Intl.DateTimeFormat("default", {
              year: "numeric",
              month: "long",
              day: "2-digit",
              hour: 'numeric',
              minute: 'numeric',
              second: 'numeric'
            }).format(estudio.fecha)}
            </td>
            <td>
            <NavLink
            to={{pathname:'/reportes',
            reporteProps:{
              fechaEstudio:estudio.fecha,
              paciente: props.location.estudiosProps.user_id,
              estudios_id: estudio.id,
              esquema: estudio.esquema,
              hallazgo: estudio.hallazgo,
              doctor: estudio.doctor,
              procedimiento: estudio.procedimiento,
              sedante: estudio.sedante
            }}}
            >
            <button class="bp3-button bp3-minimal bp3-icon-print"/>
            </NavLink>
            {toggleState?
              <React.Fragment>
              <button onClick={() => deleteEstudio(index)} class="bp3-button bp3-minimal bp3-icon-trash"/>
              </React.Fragment>
            :<button class="bp3-button bp3-minimal bp3-icon-trash" disabled/>}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    </React.Fragment>
    )    
}

const Sesiones = (props) => {
  const [sesiones, setSesiones] = useState(ipcRenderer.sendSync('get-todas_sesiones'))
  const [toggleState, setToggleState] = useState(false)

  const deleteSesion = (i) => {
    console.log(ipcRenderer.sendSync('del-sesion', {
      id: sesiones[i].id,
    }))
    const newSesiones = [...sesiones]
    newSesiones.splice(i, 1)
    setSesiones(newSesiones)
}

const toggle = () => {
  setToggleState(toggleState === false ? true : false)
}

  console.log(sesiones)
  return(
    <React.Fragment>
    <h1>Sesiones</h1>
    <button onClick={toggle}>{toggleState?"Cancelar": "Editar"}</button>
      <table class="bp3-html-table bp3-html-table-bordered bp3-html-table-condensed bp3-html-table-striped bp3-interactive bp3-small">
      <thead>
        <tr>
          <th>id</th>
          <th>Fecha</th>
          <th>acciones</th>
        </tr>
      </thead>
      <tbody>
        {sesiones.map((estudio, index) =>(
          <tr key={estudio.id}>
            <td>{ estudio.id }</td>
            <td>
            {new Intl.DateTimeFormat("default", {
              year: "numeric",
              month: "long",
              day: "2-digit",
              hour: 'numeric',
              minute: 'numeric',
              second: 'numeric'
            }).format(estudio.fecha)}
            </td>
            <td>
            <NavLink
            to={{pathname:'/reportes',
            reporteProps:{
              fechaEstudio:estudio.fecha,
              paciente: estudio.paciente,
              estudios_id: estudio.id,
              esquema: estudio.esquema,
              hallazgo: estudio.hallazgo,
              doctor: estudio.doctor,
              procedimiento: estudio.procedimiento,
              sedante: estudio.sedante
            }}}
            >
            <button class="bp3-button bp3-minimal bp3-icon-print"/>
            </NavLink>
            {toggleState?
              <React.Fragment>
              <button onClick={() => deleteSesion(index)} class="bp3-button bp3-minimal bp3-icon-trash"/>
              </React.Fragment>
            :<button class="bp3-button bp3-minimal bp3-icon-trash" disabled/>}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    </React.Fragment>
    )    
}

const Reportes = (props) => {
  const [capturas, setCapturas] = useState(ipcRenderer.sendSync('get-capturas', {
    sesion_id:  props.location.reporteProps.estudios_id
  }))
  const [esquema, setEsquema] = React.useState(props.location.reporteProps.esquema)
  const paciente = ipcRenderer.sendSync('get-paciente', {
    paciente_id:  props.location.reporteProps.paciente
  })
  const hallazgo = props.location.reporteProps.hallazgo
  const doctor = ipcRenderer.sendSync('get-doctor', {doctor_id: props.location.reporteProps.doctor})
  const procedimiento = ipcRenderer.sendSync('get-procedimiento', {procedimiento_id: props.location.reporteProps.procedimiento})
  const sedante = ipcRenderer.sendSync('get-sedante', {sedante_id: props.location.reporteProps.sedante})

  let now = new Date().getTime();

    const componentRef = useRef();
    const handlePrint = useReactToPrint({
      content: () => componentRef.current,
    });

  var fecha = (paciente.nacimiento).split("-");
  var anoNacimiento = fecha[0]

  return(
    <React.Fragment>
    <button onClick={handlePrint}>Print this out!</button>
    <Container ref={componentRef}>
    <Row>
      <Col
        auto
        xs={3}
        style={{ backgroundColor: "rgba(73,155,234,1)", margin: "10px" }}
      >
        <img
          src="http://endoclinik.com.mx/wp-content/uploads/2019/05/logobalnco.png"
          style={{ width: "230px" }}
        />
      </Col>
      <Col
        auto
        style={{ background: "rgba(212,228,239,1)", margin: "10px" }}
      >
        <div
          style={{
            margin: "10px",
            marginLeft: "20%",
            alignContent: "center"
          }}
        >
          INFORME DEL ESTUDIO ENDOCLINIC
          <h6>SERVICIO DE ENDOSCOPIA</h6>
        </div>
      </Col>
    </Row>
    <Row>
      <Col style={{ marginRight: "-110px" }}>
        <b>Paciente:</b>
        <br />
        <b>Edad:</b>
        <br />

        <b>Referido por:</b>
        <br />
        <b>Procedimiento:</b>
        <br />
        <b>Fecha del estudio:</b>
        <br />
        <b>Sedacion:</b>
        <br />
      </Col>
      <Col auto>
      { (paciente.apellido_paterno+" "
      +paciente.apellido_materno+" "
      +paciente.nombre).toUpperCase() }
        <br />
        {parseInt(new Intl.DateTimeFormat("default", {
          year: "numeric"
        }).format(now)) - parseInt(anoNacimiento)} AÑOS
        
        <br />
        {(doctor.doctor).toUpperCase()}
        <br />
        {procedimiento.procedimiento}
        <br />
        {new Intl.DateTimeFormat("default", {
          day: "2-digit"
        }).format(props.location.reporteProps.fechaEstudio)}/
        {new Intl.DateTimeFormat("default", {
          month: "long"
        }).format(props.location.reporteProps.fechaEstudio)}/
        {new Intl.DateTimeFormat("default", {
          year: "numeric"
        }).format(props.location.reporteProps.fechaEstudio)} {new Intl.DateTimeFormat("default", {
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric'
        }).format(props.location.reporteProps.fechaEstudio)}
        <br />
        {sedante.sedante}
        <br />
      </Col>
      <Col>
        <img
          src={esquema}
          style={{ width: "300px" }}
        />
      </Col>
    </Row>

    <Row>
    {capturas.slice(0).map((photo, index) => (
      <Col xs={{ order: photo.id }}>
        <Card2 style={{ width: "15rem" }}>
          <Card2.Img
            variant="top"
            src={photo.captura}
            style={{ width: "230px" }}
          />
          <Card2.Footer>
            <h6>{photo.identificador}-{photo.descripcion}</h6>
          </Card2.Footer>
        </Card2>
      </Col>
    ))}
      </Row>

    <Row>
      <Col>
        <h2>Hallazgos</h2>
        <p>
          {ReactHtmlParser(hallazgo)}
        </p>
      </Col>
    </Row>
  </Container>


    </React.Fragment>
    )    
}

const Videos = ({location}, props) => {
  const [deviceId, setDeviceId] = React.useState("");
  const [devices, setDevices] = React.useState([]);
  const [photos, setPhotos] = React.useState([]);
  const [sesion, setSesion] = React.useState("")
  
  const handleDevices = React.useCallback(
    mediaDevices =>
      setDevices(mediaDevices.filter(({ kind }) => kind === "videoinput")),
    [setDevices]
  );
  
  React.useEffect(
    () => {
      navigator.mediaDevices.enumerateDevices().then(handleDevices);
    },
    [handleDevices]
  );
  let ids=0;
  const webcamRef = React.useRef(null);
  const areaOrgano = React.useRef(null);
  const capture = React.useCallback(
    () => {
      
      ids = ids + 1
      const imageSrc = webcamRef.current.getScreenshot();
      const lugarOrgano = areaOrgano.current.value
      console.log(lugarOrgano)
      console.log(imageSrc)
      
      setPhotos(photos => [...photos,{ids, imageSrc, lugarOrgano}])
    },
    [webcamRef]
  )
  console.log(location)
  const { id } = queryString.parse(location.search)
  
  const onSubmit = data => {
    setDeviceId(data.Device)
    let now = new Date().getTime();
    console.log(now)
    console.log(Date(now))

    setSesion(ipcRenderer.sendSync('add-sesion', {
      paciente: id,
      fecha: now,
      doctor: data.Doctor_encargado,
      procedimiento: data.Procedimiento,
      sedante: data.Sedantes
    }))


  }
  let myArray = [];
  devices.map((device) => (
    myArray.push([device.deviceId, device.label])
  ))

  let doctorArray = [];
  (ipcRenderer.sendSync('get-doctores')).map((doctor) =>(
    doctorArray.push([doctor.id, doctor.doctor])
  ))

  let procedimientoArray = [];
  (ipcRenderer.sendSync('get-procedimientos')).map((procedimiento) =>(
    procedimientoArray.push([procedimiento.id, procedimiento.procedimiento])
  ))

  let sedanteArray = [];
  (ipcRenderer.sendSync('get-sedantes')).map((sedante) =>(
    sedanteArray.push([sedante.id, sedante.sedante])
  ))


  return (
    <React.Fragment>
      <h1>Endoscopía</h1>
      <h2>ID: { id }</h2>
      <Form onSubmit={onSubmit}>
        <Select name="Doctor_encargado" options={doctorArray} />
        <Select name="Procedimiento" options={procedimientoArray} />
        <Select name="Sedantes" options={sedanteArray} />
        <Select name="Device" options={myArray} />
        <Button type="submit" value="Submit" >Comenzar estudio</Button>
      </Form>
      {deviceId
        ?  <React.Fragment>
        <div class="bp3-control-group">
        <div class="bp3-input-group">
        <input type="text" class="bp3-input" placeholder="Lugar del organo..." ref={areaOrgano}/>
        <button onClick={capture} class="bp3-button bp3-minimal bp3-icon-camera"/>

        <NavLink 
        to={{pathname:'/esquema',
            esquemaProps:{
              photos: photos,
              sesion: sesion
            }}}>
        <button class="bp3-button bp3-minimal bp3-icon-desktop"/>
        </NavLink>
        
        </div>
        </div>
        <br/>
        <Webcam audio={false} videoConstraints={{ deviceId: deviceId }} ref={webcamRef} screenshotFormat="image/jpeg" />

        </React.Fragment>
        : <h1>Rellene el fomulario y seleccione fuente capturadora</h1>
      }



      <table class="bp3-html-table bp3-html-table-bordered bp3-html-table-condensed bp3-html-table-striped bp3-interactive bp3-small">
      <thead>
        <tr>
          <th>id</th>
          <th>Lugar</th>
          <th>Fotografia</th>
          <th>Acciones</th>   
        </tr>
      </thead>
      <tbody>
        {photos.slice(0).reverse().map((photo) => (
          <tr key={photo.ids}>
            <td>{photo.ids}</td>
            <td>{photo.lugarOrgano}</td>
            <td> <img style={{width: "150px"}} src={photo.imageSrc}/></td>
            <td>Borrar</td>
          </tr>
        ))}
      </tbody>
    </table>
    </React.Fragment>
  )
}

const Esquema = (props) => {
  const [photos, setPhotos] = React.useState(props.location.esquemaProps.photos)
  const [sesion, setSesion] = React.useState(props.location.esquemaProps.sesion)
  const [esquema, setEsquema] = React.useState("")
  const [hallazgo, setHallazgo] = React.useState("")

  useEffect(()=>{
    console.log("dentro de Esquema")
    return(
      console.log("Saliendo del Esquema")
    )
  })


  const deleteItem = (i) => {
    const newPhotos = [...photos]
    newPhotos.splice(i, 1)
    setPhotos(newPhotos)
}

const updateFieldChanged = index => e => {
  console.log('index: ' + index);
  console.log('property name: '+ e.target.name);
  let newArr = [...photos]; // copying the old datas array
  newArr[index].lugarOrgano = e.target.value; // replace e.target.value with whatever you want to change it to
  setPhotos(newArr); // ??
}

const handleOnChage = (e, editor) => {
  setHallazgo(editor.getData())
}

const guardar = () => {
  console.log(ipcRenderer.sendSync('add-esquema', {
    id: sesion,
    esquema: esquema,
  }))

  console.log(ipcRenderer.sendSync('add-hallazgo', {
    id: sesion,
    hallazgo: hallazgo,
  }))

  photos.map((photo) => ( 
    console.log(ipcRenderer.sendSync('add-captura', {
      sesion:  sesion,
      identificador: photo.ids,
      captura: photo.imageSrc,
      descripcion:  photo.lugarOrgano
    })) 
  ))

}

  return(
    <React.Fragment>
    <h1>Esquema</h1>
    <h1>{sesion}</h1>
    <div class="flexy">
    <div class="flex-container">
    {photos.slice(0).map((photo, index) => (
      <Card interactive={true} elevation={Elevation.TWO} key={photo.ids} style={{width: "250px", margin: "20px"}}>
        <p style={{width: "250px", margin: "-20px", marginBottom: "20px"}}><button onClick={() => deleteItem(index)} class="bp3-button bp3-minimal bp3-icon-trash"/>{photo.ids}</p>
        <img style={{width: "250px", margin: "-20px"}} src={photo.imageSrc}/>
        <input style={{width: "250px", margin: "-20px", marginTop: "20px"}} type="text" name="name" value={photo.lugarOrgano} onChange={updateFieldChanged(index)}  />
        
      </Card>
    ))}
    </div>
    <div class="c"  >
    <HomePage dataImage={image => setEsquema(image)}/>
    </div>
    <button onClick={guardar} class="bp3-button bp3-minimal bp3-icon-camera"/>
    </div>

    <CKEditor
      editor={ClassicEditor}
      onChange={handleOnChage}
    />

    </React.Fragment>
    )    
}

const NavegacionImperativa = ({ history }) => {
  console.log(history)
  return (
    <div>
      <button class="bp3-button bp3-minimal bp3-icon-undo" onClick={history.goBack}/>
      <button class="bp3-button bp3-minimal bp3-icon-flow-end" onClick={history.goForward}/>
    </div>
  )
}

export default App
