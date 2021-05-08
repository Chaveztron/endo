import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Route, NavLink } from 'react-router-dom'
import queryString from 'query-string'
import './App.css'
import { Button, Card, Elevation, ControlGroup, InputGroup } from "@blueprintjs/core";
import Webcam from "react-webcam";
import { Form, Input, Select, NumInput, Radios, DatePiker } from "./components";
import HomePage from "./esquemaJs/HomePage";
import { useReactToPrint } from 'react-to-print';
import { Container, Row, Col, Card as Card2, Form as BForm, Modal } from "react-bootstrap";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import ReactHtmlParser from 'react-html-parser';

import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { ListContainer, ListItem } from "./styles";



const { ipcRenderer } = window.require("electron");

const App = () => {
  return (
    <BrowserRouter>
      <nav class="bp3-navbar .modifier">
        <div class="bp3-navbar-group bp3-align-left">
        <span class="bp3-navbar-divider"></span>
          <div class="bp3-navbar-heading">EndoClinik</div>
        </div>
        <div class="bp3-navbar-group bp3-align-right">
        <NavLink to='/' exact activeClassName='active'><button class="bp3-button bp3-minimal bp3-intent-success bp3-icon-add">Agregar paciente</button></NavLink>
        <NavLink to='/Pacientes' activeClassName='active'><button class="bp3-button bp3-minimal bp3-icon-database">Pacientes</button></NavLink>
        <NavLink to='/sesiones' activeClassName='active'><button class="bp3-button bp3-minimal bp3-icon-document">Sesiones</button></NavLink>
        <NavLink to='/configuracion' activeClassName='active'><button class="bp3-button bp3-minimal bp3-icon-cog">Configuracion</button></NavLink>
        <NavLink to='/editarInforme' activeClassName='active'><button class="bp3-button bp3-minimal bp3-icon-cog">editarInforme</button></NavLink>
          <span class="bp3-navbar-divider"></span>
        </div>
      </nav>
      <Route path='/' exact render={Add_paciente}/>
      <Route path='/Pacientes' render={(props)=> <Pacientes {...props} />} />
      <Route path='/videos' render={(props)=> <Videos {...props} />} />
      <Route path='/esquema' render={(props)=> <Esquema {...props} />} />
      <Route path='/estudios' render={(props)=> <Estudios {...props} />} />
      <Route path='/sesiones' render={(props)=> <Sesiones {...props} />} />
      <Route path='/reportes' render={(props)=> <Reportes {...props} />} />
      <Route path='/editarInforme' render={(props)=> <EdicionInforme {...props} />} />
      <Route path='/configuracion' render={(props)=> <Configuracion {...props} />} />
    </BrowserRouter>
  )
}

const Add_paciente = (props) => {
  let now = new Date().getTime();

  const onSubmit = data => {
    var fechaNacimiento;
    if(data.Edad){
      var fechaN = parseInt(new Intl.DateTimeFormat("default", {
        year: "numeric"
      }).format(now)) - parseInt(data.Edad)
      fechaNacimiento = fechaN+"-01-01"
    }else{
      fechaNacimiento = data.Nacimiento
    }
    console.log(ipcRenderer.sendSync('add-paciente', {
      nombre: data.Nombre,
      apellido_paterno: data.Apellido_paterno,
      apellido_materno: data.Apellido_materno,
      genero: data.Genero,
      nacimiento: fechaNacimiento,
      telefono: data.Telefono
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
        <DatePiker name="Nacimiento"/>
        <NumInput name="Edad"/>
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

  const [asistentes, setAsistentes] = useState(ipcRenderer.sendSync('get-asistentes'));
  const [asistente, setAsistente] = useState("");

  const [instrumentos, setInstrumentos] = useState(ipcRenderer.sendSync('get-instrumentos'));
  const [instrumento, setInstrumento] = useState("");

  const [encabezados, setEncabezados] = useState(ipcRenderer.sendSync('get-encabezados'));
  const [direccion, setDireccion] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [giro, setGiro] = useState("");
  const [telefono, setTelefono] = useState("");

  const handleSubmitDoctor = (evt) => {
    evt.preventDefault();
    var idTemp = ipcRenderer.sendSync('add-doctor', { doctor: doctor })
    setDoctores(doctores => [...doctores,{id: idTemp, doctor: doctor}])      
  }
  const deleteDoctor = (i) => {
    console.log(ipcRenderer.sendSync('del-doctor', {
      id: doctores[i].id,
    }))
    const newDoctores = [...doctores]
    newDoctores.splice(i, 1)
    setDoctores(newDoctores)
  }

  const handleSubmitProcedimiento = (evt) => {
    evt.preventDefault();
    var idTemp = ipcRenderer.sendSync('add-procedimiento', { procedimiento: procedimiento })
    setProcedimientos(procedimientos => [...procedimientos,{id: idTemp, procedimiento: procedimiento}])      
  }
  const deleteProcedimiento = (i) => {
    console.log(ipcRenderer.sendSync('del-procedimiento', {
      id: procedimientos[i].id,
    }))
    const newProcedimientos = [...procedimientos]
    newProcedimientos.splice(i, 1)
    setProcedimientos(newProcedimientos)
  }

  const handleSubmitSedante = (evt) => {
    evt.preventDefault();
    var idTemp = ipcRenderer.sendSync('add-sedante', { sedante: sedante })
    setSedantes(sedantes => [...sedantes,{id: idTemp, sedante: sedante }])      
  }
  const deleteSedante = (i) => {
    console.log(ipcRenderer.sendSync('del-sedante', {
      id: sedantes[i].id,
    }))
    const newSedantes = [...sedantes]
    newSedantes.splice(i, 1)
    setSedantes(newSedantes)
  }

  const handleSubmitAsistente = (evt) => {
    evt.preventDefault();
    var idTemp = ipcRenderer.sendSync('add-asistente', { asistente: asistente })
    setAsistentes(asistentes => [...asistentes,{id: idTemp, asistente: asistente }])      
  }
  const deleteAsistente = (i) => {
    console.log(ipcRenderer.sendSync('del-asistente', {
      id: asistentes[i].id,
    }))
    const newAsistentes = [...asistentes]
    newAsistentes.splice(i, 1)
    setAsistentes(newAsistentes)
  }

  const handleSubmitInstrumento = (evt) => {
    evt.preventDefault();
    var idTemp = ipcRenderer.sendSync('add-instrumento', { instrumento: instrumento })
    setInstrumentos(instrumentos => [...instrumentos,{id: idTemp, instrumento: instrumento }])      
  }
  const deleteInstrumento = (i) => {
    console.log(ipcRenderer.sendSync('del-instrumento', {
      id: instrumentos[i].id,
    }))
    const newInstrumentos = [...instrumentos]
    newInstrumentos.splice(i, 1)
    setInstrumentos(newInstrumentos)
  }


  const handleSubmitEncabezado = (evt) => {
    evt.preventDefault();
    var idTemp = ipcRenderer.sendSync('add-encabezado', { direccion: direccion, empresa: empresa, giro: giro, telefono: telefono })
    setEncabezados(encabezados => [...encabezados,{id: idTemp, direccion: direccion, empresa: empresa, giro: giro, telefono: telefono }])      
  }
  const deleteEncabezado = (i) => {
    console.log(ipcRenderer.sendSync('del-encabezado', {
      id: encabezados[i].id,
    }))
    const newEncabezados = [...encabezados]
    newEncabezados.splice(i, 1)
    setEncabezados(newEncabezados)
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

      <form onSubmit={handleSubmitAsistente}>
          <ControlGroup fill={false} vertical={false}>
          <InputGroup placeholder="Asistente" type="text" value={asistente}
            onChange={e => setAsistente(e.target.value)} 
          />
          <Button icon="add" type="submit" value="Submit">Agregar asistente</Button>
          </ControlGroup>
      </form>
      <ul>
      {asistentes.map((asistente, index) => (      
        <li>{asistente.id} {asistente.asistente}
        <button onClick={() => deleteAsistente(index)} class="bp3-button bp3-minimal bp3-icon-trash"/>
        </li>
      ))}
      </ul>

      <form onSubmit={handleSubmitInstrumento}>
      <ControlGroup fill={false} vertical={false}>
      <InputGroup placeholder="Instrumento" type="text" value={instrumento}
        onChange={e => setInstrumento(e.target.value)} 
      />
      <Button icon="add" type="submit" value="Submit">Agregar instrumento</Button>
      </ControlGroup>
      </form>
      <ul>
        {instrumentos.map((instrumento, index) => (      
          <li>{instrumento.id} {instrumento.instrumento}
          <button onClick={() => deleteInstrumento(index)} class="bp3-button bp3-minimal bp3-icon-trash"/>
          </li>
        ))}
      </ul>

      <form onSubmit={handleSubmitEncabezado}>
      <ControlGroup fill={false} vertical={false}>
      <InputGroup placeholder="Direccion" type="text" value={direccion}
        onChange={e => setDireccion(e.target.value)} 
      />
      <InputGroup placeholder="Empresa" type="text" value={empresa}
        onChange={e => setEmpresa(e.target.value)} 
      />
      <InputGroup placeholder="Giro" type="text" value={giro}
        onChange={e => setGiro(e.target.value)} 
      />
      <InputGroup placeholder="Telefono" type="text" value={telefono}
        onChange={e => setTelefono(e.target.value)} 
      />
      <Button icon="add" type="submit" value="Submit">Agregar Encabezado</Button>
      </ControlGroup>
      </form>
      <ul>
        {encabezados.map((encabezado, index) => (      
          <li>{encabezado.id} {encabezado.direccion}
          <button onClick={() => deleteEncabezado(index)} class="bp3-button bp3-minimal bp3-icon-trash"/>
          </li>
        ))}
      </ul>

    
    </React.Fragment>
  )
}

const Pacientes = (props) => {
  const [users, setUser] = useState(ipcRenderer.sendSync('get-pacientes').reverse())
  const [toggleState, setToggleState] = useState(false)

  const [search, setSearch] = useState('');
  const [filteredPacientes, setFilteredPacientes] = useState([]);

  const [nom, setNom] = useState("")
  const [ap, setAp] = useState("")
  const [am, setAm] = useState("")
  const [tel, setTel] = useState("")
  const [birt, setBirt] = useState("")
  const [sx, setSx] = useState("")
  const [idd, setIdd] = useState("")

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);

  const handleShow = (u, i) => {
    console.log(u)
    console.log(i)

    setNom(u.nombre)
    setAp(u.apellido_paterno)
    setAm(u.apellido_materno)
    setTel(u.telefono)
    setBirt(u.nacimiento)
    setSx(u.genero)
    setIdd(u.id)

    setShow(true)
  }

  const handleSubmitPaciente = (evt) => {
    evt.preventDefault();

    console.log(ipcRenderer.sendSync('update-paciente', {
      id: idd,
      nombre: nom,
      apellido_paterno: ap,
      apellido_materno: am,
      genero: sx,
      nacimiento: birt,
      telefono: tel
    }))
   

    /*
    var idTemp = ipcRenderer.sendSync('add-instrumento', { instrumento: instrumento })
    setInstrumentos(instrumentos => [...instrumentos,{id: idTemp, instrumento: instrumento }]) 
    */     
   setShow(false)
   window.location.reload(false)
  }

  useEffect(() => {
    setFilteredPacientes(
      users.filter( user => {
        return (user.nombre.toLowerCase()
        +user.apellido_paterno.toLowerCase()
        +user.apellido_materno.toLowerCase()).includes(search.toLowerCase())
      })
    )
  },[search, users])

  const deletePaciente = (i, id) => {
      const newPacientes = [...filteredPacientes]
      newPacientes.splice(i, 1)
      setFilteredPacientes(newPacientes)

      let sesiones = (ipcRenderer.sendSync('get-sesiones', {
        user_id: id,
      }))
      sesiones.map((sesion) => (
        console.log(ipcRenderer.sendSync('del-sesion', {
          id: sesion.id,
        }))
      ))
      console.log(ipcRenderer.sendSync('del-paciente', {
        id: id,
      }))
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
            <button class="bp3-button bp3-minimal bp3-icon-edit" onClick={() => handleShow(user, index)}/>
            {toggleState?
              <React.Fragment>
              <button onClick={() => deletePaciente(index, user.id)} class="bp3-button bp3-minimal bp3-icon-trash"/>
              </React.Fragment>
            :<button class="bp3-button bp3-minimal bp3-icon-trash" disabled/>}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    
    <Modal
    show={show}
    onHide={handleClose}
    backdrop="static"
    keyboard={false}
    >
      <Modal.Header closeButton>
        <Modal.Title>Editar paciente</Modal.Title>
      </Modal.Header>
        <Modal.Body>
        <form onSubmit={handleSubmitPaciente}>
            <ControlGroup fill={false} vertical>
            <InputGroup placeholder="Nombre" type="text" value={nom}
              onChange={e => setNom(e.target.value)} 
            />
            <InputGroup placeholder="Apellido paterno" type="text" value={ap}
            onChange={e => setAp(e.target.value)} 
            />
            <InputGroup placeholder="Apellido materno" type="text" value={am}
            onChange={e => setAm(e.target.value)} 
            />
            <InputGroup placeholder="Telefono" type="text" value={tel}
            onChange={e => setTel(e.target.value)} 
            />
            <InputGroup placeholder="dd-mm-yyyy" type="date" value={birt}
            onChange={e => setBirt(e.target.value)} 
            />
            <InputGroup placeholder="Genero" type="text" value={sx}
            onChange={e => setSx(e.target.value)} 
            />
            </ControlGroup>
            <Button variant="primary" type="submit" value="Submit">Aplicar Cambios</Button>
        </form> 
        </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancelar
        </Button>
        
      </Modal.Footer>
    </Modal>
    

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

  return(
    <React.Fragment>
    <h1>Estudios</h1>
    <button onClick={toggle}>{toggleState?"Cancelar": "Editar"}</button>
      <table class="bp3-html-table bp3-html-table-bordered bp3-html-table-condensed bp3-html-table-striped bp3-interactive bp3-small">
      <thead>
        <tr>
          <th>id</th>
          <th>Fecha</th>
          <th>Doctor</th>
          <th>Procedimiento</th>
          <th>acciones</th>
        </tr>
      </thead>
      <tbody>
        {estudios.slice(0).reverse().map((estudio,index) =>(
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
            <td>{ (ipcRenderer.sendSync('get-doctor', {doctor_id: estudio.doctor})).doctor  }</td>
            <td>{ (ipcRenderer.sendSync('get-procedimiento', {procedimiento_id: estudio.procedimiento})).procedimiento }</td>
            <td>
            <NavLink
            to={{pathname:'/editarInforme',
            props:{
              idReporte: estudio.id
            }}}
            >
            <button class="bp3-button bp3-minimal bp3-icon-edit"/>
            </NavLink>
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
  const [sesiones, setSesiones] = useState(ipcRenderer.sendSync('get-todas_sesiones').reverse())
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

  return(
    <React.Fragment>
    <h1>Sesiones</h1>
    <button onClick={toggle}>{toggleState?"Cancelar": "Editar"}</button>
      <table class="bp3-html-table bp3-html-table-bordered bp3-html-table-condensed bp3-html-table-striped bp3-interactive bp3-small">
      <thead>
        <tr>
          <th>id</th>
          <th>Fecha</th>
          <th>Doctor</th>
          <th>Paciente</th>
          <th>Procedimiento</th>
          <th>Motivo</th>
          <th>Asistente</th>
          <th>Instrumento</th>
          <th>Acciones</th>
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
            <td>{ (ipcRenderer.sendSync('get-doctor', {doctor_id: estudio.doctor})).doctor  }</td>

            <td>{
              (ipcRenderer.sendSync('get-paciente', {paciente_id:  estudio.paciente})).nombre+" "+
              (ipcRenderer.sendSync('get-paciente', {paciente_id:  estudio.paciente})).apellido_paterno+" "+
              (ipcRenderer.sendSync('get-paciente', {paciente_id:  estudio.paciente})).apellido_materno
            }</td>


            <td>{ (ipcRenderer.sendSync('get-procedimiento', {procedimiento_id: estudio.procedimiento})).procedimiento }</td>

            <td>{ estudio.motivo_estudio }</td>
            <td>{(ipcRenderer.sendSync('get-asistente', {asistente_id: estudio.asistente})).asistente}</td>
            <td>{(ipcRenderer.sendSync('get-instrumento', {instrumento_id: estudio.instrumento})).instrumento}</td>
            
            <td>
            <NavLink
            to={{pathname:'/editarInforme',
            props:{
              idReporte: estudio.id
            }}}
            >
            <button class="bp3-button bp3-minimal bp3-icon-edit"/>
            </NavLink>
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
              sedante: estudio.sedante,

              motivo_estudio: estudio.motivo_estudio,
              asistente: estudio.asistente,
              instrumento: estudio.instrumento,

              encabezado: estudio.encabezado

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
  const [fotos, setFotos] = useState([])

  const [esquema, setEsquema] = React.useState(props.location.reporteProps.esquema)
  const paciente = ipcRenderer.sendSync('get-paciente', {
    paciente_id:  props.location.reporteProps.paciente
  })


  useEffect(() => {
    setFotos(capturas.sort((a, b) => a.identificador > b.identificador ? 1 : -1))
    console.log(fotos)
  },[]);

  const hallazgo = props.location.reporteProps.hallazgo
  const doctor = ipcRenderer.sendSync('get-doctor', {doctor_id: props.location.reporteProps.doctor})
  const procedimiento = ipcRenderer.sendSync('get-procedimiento', {procedimiento_id: props.location.reporteProps.procedimiento})
  const sedante = ipcRenderer.sendSync('get-sedante', {sedante_id: props.location.reporteProps.sedante})

  const instrumento = ipcRenderer.sendSync('get-instrumento', {instrumento_id: props.location.reporteProps.instrumento})
  const asistente = ipcRenderer.sendSync('get-asistente', {asistente_id: props.location.reporteProps.asistente})
  const motivo = props.location.reporteProps.motivo_estudio

  const encabezado = ipcRenderer.sendSync('get-encabezado', {encabezado_id: props.location.reporteProps.encabezado})

  let now = new Date().getTime();

    const componentRef = useRef();
    const handlePrint = useReactToPrint({
      content: () => componentRef.current,
    });

  var fecha = (paciente.nacimiento).split("-");
  var anoNacimiento = fecha[0]

  return(
    <React.Fragment>
    <Button icon="add" icon="print" onClick={handlePrint}>Imprimir Reporte!!</Button>
    <Container ref={componentRef}>
    <body className="hoja">
    <div className="logo" style={{backgroundColor: "#499ae9", padding: "5px", width: "20%", height: "108px", marginRight: "10px", float: "left", borderRadius: "10px" }}>
    <img src="http://endoclinik.com.mx/wp-content/uploads/2019/05/logobalnco.png" style={{width: "200px", marginTop:"20px"}} />
  </div>

  <div className="titulo" style={{backgroundColor: "#d4e4ef", padding: "5px", textAlign: "center", width: "70%", height: "108px", float: "left", borderRadius: "10px"}}>
      <b>{encabezado.empresa}</b>  <br/>
      {encabezado.giro}<br/>
      {encabezado.telefono}<br/>
      {encabezado.direccion}<br/>
  </div>


  <div className="esquema" style={{float: "left"}}>
  <img
     src={esquema}
     style={{ width: "250px", float: "left" }}
  />
    </div>

  <table className="tablaI" style={{float: "left", marginTop: "0px", fontSize: "medium", float:"left"}}>
    <tr>
      <td><b>Paciente:</b></td>
      <td>
      { (paciente.apellido_paterno+" "
      +paciente.apellido_materno+" "
      +paciente.nombre).toUpperCase() }
      </td>
    </tr>
    <tr>
      <td><b>Edad:</b></td>
      <td>
      {parseInt(new Intl.DateTimeFormat("default", {
        year: "numeric"
      }).format(now)) - parseInt(anoNacimiento)} AÑOS
      </td>
    </tr>
    <tr>
      <td><b>Referido por:</b></td>
      <td>{(doctor.doctor).toUpperCase()}</td>
    </tr>
    <tr>
      <td><b>Procedimiento:</b></td>
      <td>{procedimiento.procedimiento}</td>
    </tr>
    <tr>
      <td><b>Fecha del estudio:</b></td>
      <td>
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
      </td>
    </tr>
    <tr>
      <td><b>Sedacion:</b></td>
      <td>{sedante.sedante}</td>
    </tr>
  </table>

  <table className="tablaI" style={{float: "left", marginTop: "0px", fontSize: "medium", float:"left"}}>
  <tr>
    <td><b>Instrumento:</b></td>
    <td>
      {instrumento.instrumento}
    </td>
  </tr>
  <tr>
    <td><b>Asistente:</b></td>
    <td>
      {asistente.asistente}
    </td>
  </tr>
  <tr>
    <td><b>Motivo:</b></td>
    <td>{motivo}</td>
  </tr>
</table>



 <div className="fotografias" style={{float:"left", alignContent: "center"}}>
  {fotos.map((photo, index) => (
    
    <div className="foto" key={{ index }} style={{margin: "5px", textAlign: "center", float: "left", display:photo.visible==='true'?'true':'none'}}>
    <img src={photo.captura} style={{ width: "230px", height: "230px", borderRadius: "10px" }} />
    <h6 style={{marginTop: "2px"}}>{photo.identificador}-{photo.descripcion} </h6>
    </div>
  ))}

 </div>
<div style={{float:"left"}}>
        <p>
          {ReactHtmlParser(hallazgo)}
        </p>
  </div>


  <div className="pie" style={{width: "85%"}}>
    <b>{encabezado.empresa}</b>
  </div>

  </body>


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
      areaOrgano.current.value = ""      
      setPhotos(photos => [...photos,{ids, imageSrc, lugarOrgano}])
    },
    [webcamRef]
  )
  const { id } = queryString.parse(location.search)

  const deleteItem = (i) => {
    const newPhotos = [...photos]
    newPhotos.splice(i, 1)
    setPhotos(newPhotos)
}

const addPhotos = () => {

  photos.map((photo, index) => ( 
    console.log(ipcRenderer.sendSync('add-captura', {


      sesion: sesion,
      identificador: photo.ids,
      captura: photo.imageSrc,
      descripcion: photo.lugarOrgano,



    })) 
  ))



}
  
  const onSubmit = data => {
    setDeviceId(data.Device)
    let now = new Date().getTime();

    setSesion(ipcRenderer.sendSync('add-sesion', {
      paciente: id,
      fecha: now,
      doctor: data.Doctor_encargado,
      asistente: data.Asistente,
      instrumento: data.Instrumento,
      procedimiento: data.Procedimiento,
      sedante: data.Sedantes,
      encabezado: data.Encabezado,
      motivo_estudio: data.Motivo_del_estudio
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

  let asistenteArray = [];
  (ipcRenderer.sendSync('get-asistentes')).map((asistente) =>(
    asistenteArray.push([asistente.id, asistente.asistente])
  ))

  let instrumentoArray = [];
  (ipcRenderer.sendSync('get-instrumentos')).map((instrumento) =>(
    instrumentoArray.push([instrumento.id, instrumento.instrumento])
  ))

  let encabezadoArray = [];
  (ipcRenderer.sendSync('get-encabezados')).map((encabezado) =>(
    encabezadoArray.push([encabezado.id, encabezado.direccion])
  ))



  return (
    <React.Fragment>
      <h1>Endoscopía al paciente { (ipcRenderer.sendSync('get-paciente', {paciente_id:  id})).nombre }</h1>

      {deviceId
        ?  <React.Fragment>
        <Container fluid>
            <Row>
              <Col sm={8}>
              
                    <NavLink 
                    to={{pathname:'/editarInforme',
                    props:{
                      idReporte: sesion
                    }}}>
                    <Button icon="flow-end" intent="success" large text="Continuar con el estudio" onClick={() => addPhotos()}/>
                    </NavLink>


                  <br/>
                    <Webcam audio={false} videoConstraints={{ deviceId: deviceId }} ref={webcamRef} screenshotFormat="image/jpeg" />
                  <br/>
                  <input type="text" class="bp3-input bp3-large bp3-fill bp3-round" placeholder="Lugar del organo..." ref={areaOrgano}/> 
                  <Button icon="camera" intent="primary" large text="Capturar fotografia" onClick={capture}/>
              
              </Col>
              <Col sm={4}>
                {photos.slice(0).reverse().map((photo, index) => (
                      <Card elevation={Elevation.TWO} key={photo.ids} style={{width: "250px", margin: "20px"}}>
                        <p style={{width: "250px", margin: "-20px", marginBottom: "20px"}}><button onClick={() => deleteItem(index)} class="bp3-button bp3-minimal bp3-icon-trash"/>{photo.ids}</p>
                        <img style={{width: "250px", margin: "-20px"}} src={photo.imageSrc}/>
                        <br/>  
                        <p style={{marginTop: "20px"}}>{photo.lugarOrgano}</p>
                    </Card>
                    ))}
              </Col>
            </Row>
        </Container>
        </React.Fragment>
        : <React.Fragment>
        <h3>Rellene el fomulario y seleccione fuente capturadora</h3>
          <Form onSubmit={onSubmit}>
            <Select name="Doctor_encargado" options={doctorArray} />
            <Input name="Motivo_del_estudio"/>
            <Select name="Procedimiento" options={procedimientoArray} />
            <Select name="Sedantes" options={sedanteArray} />
            <Select name="Asistente" options={asistenteArray} />
            <Select name="Instrumento" options={instrumentoArray} />
            <Select name="Encabezado" options={encabezadoArray} />
            <Select name="Device" options={myArray} />
            <Button type="submit" value="Submit" >Comenzar estudio</Button>
          </Form>
        </React.Fragment>
      }



      
    </React.Fragment>
  )
}

const Esquema = (props) => {
  const [photos, setPhotos] = React.useState((props.location.esquemaProps.photos))
  const [sesion, setSesion] = React.useState(props.location.esquemaProps.sesion)
  const [toggleState, setToggleState] = useState(false)
  const [esquema, setEsquema] = React.useState("")
  const [hallazgo, setHallazgo] = React.useState("")

  const [imageCode, setImageCode] = React.useState()
  const [imageCodeIndex, setImageCodeIndex] = React.useState()

  const [photoEdit, setphotoEdit] = React.useState("")

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  //const handleShow = () => setShow(true);


  const handleShow = (i) => {
    setImageCode(photos[i].imageSrc)
    setImageCodeIndex(i)
    setShow(true)
  }
  
  var pacienteiD = props.location.esquemaProps.paciente

  var sesionReporte = ipcRenderer.sendSync('get-sesion', {
    sesion_id: sesion,
  })

const deleteItem = (i) => {
    const newPhotos = [...photos]
    newPhotos.splice(i, 1)
    setPhotos(newPhotos)
}

const editPhoto = (i) => {
  const Photos = [...photos]
  Photos[i].imageSrc = photoEdit
  setPhotos(Photos)
  setShow(false)
}

const updateFieldChanged = index => e => {
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
  setToggleState(toggleState === false ? true : false)
}

  return(
    <React.Fragment>
    <h1>Esquema {sesion}</h1>

    {toggleState?
      <NavLink
      to={{pathname:'/reportes',
      reporteProps:{
      fechaEstudio: sesionReporte.fecha,
      paciente: pacienteiD,
      estudios_id: sesionReporte.id,
      esquema: esquema,
      hallazgo: hallazgo,
      doctor: sesionReporte.doctor,
      procedimiento: sesionReporte.procedimiento,
      sedante: sesionReporte.sedante,

      motivo_estudio: sesionReporte.motivo_estudio,
      asistente: sesionReporte.asistente,
      instrumento: sesionReporte.instrumento,

      encabezado: sesionReporte.encabezado

      }}}
      >
      <Button icon="print" large text="Generar Reporte" intent="success"/>
      </NavLink>
      : 
      <Button onClick={guardar} icon="floppy-disk" large text="Guardar" intent="primary"/>}

    <Container fluid>
    <Row>     
      <Col >
      <CKEditor
      editor={ClassicEditor}
      onChange={handleOnChage}
      />
      </Col>
    </Row>
  </Container>

  <Container fluid>
  <Row>
    <Col sm={8}>
        <Container fluid>
        <Row>
            {photos.slice(0).map((photo, index) => (
              <Col xs={{ order: photo.id }}>
              <Card interactive={true} elevation={Elevation.TWO} key={photo.ids} style={{width: "250px", margin: "5px"}}>
                  <p style={{width: "250px", margin: "-20px", marginBottom: "20px"}}><button onClick={() => deleteItem(index)} class="bp3-button bp3-minimal bp3-icon-trash"/>
                  <button onClick={() => handleShow(index)} class="bp3-button bp3-minimal bp3-icon-edit"/>
                  {photo.ids}
                  </p>
                <img style={{width: "250px", margin: "-20px"}} src={photo.imageSrc}/>
                <input style={{width: "250px", margin: "-20px", marginTop: "20px"}} type="text" name="name" value={photo.lugarOrgano} onChange={updateFieldChanged(index)}  />
                
              </Card>
              </Col>
            ))}
        </Row>
      </Container>
    </Col>
    <Col sm={4}>
        <Container fluid>
        <Row>     
          <Col >
          <HomePage dataImage={image => setEsquema(image)} photo={null}/>
          </Col>
        </Row>
      </Container>
    </Col>
  </Row>
</Container>

    <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
        >
          <Modal.Header closeButton>
            <Modal.Title>Edición de fotografía</Modal.Title>
          </Modal.Header>
            <Modal.Body>
            <HomePage dataImage={image => setphotoEdit(image)} photo={imageCode}/>
            
            </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={() => editPhoto(imageCodeIndex)}>Aplicar Cambios</Button>
          </Modal.Footer>
    </Modal>
  </React.Fragment>
    )    
}

const EdicionInforme = (props) => {

  const [capturas, setCapturas] = useState(ipcRenderer.sendSync('get-capturas', {
      sesion_id:  props.location.props.idReporte
    }))
    const [toggleState, setToggleState] = useState(false)
    const [esquema, setEsquema] = React.useState("")
    const [date, setDate] = useState("")
    const [doc, setDoc] = useState("")
    const [proc, setProc] = useState("")
    const [sed, setSed] = useState("")
    const [mot, setMot] = useState("")
    const [asis, setAsis] = useState("")
    const [ins, setIns] = useState("")
    const [enc, setEnc] = useState("")
    const [datos, setDatos] = useState("")
    
    useEffect(() => {
      var dia = new Intl.DateTimeFormat("default", {day: "2-digit"}).format(sesionReporte.fecha)
      var mes = new Intl.DateTimeFormat("default", {month: "2-digit"}).format(sesionReporte.fecha)
      var years = new Intl.DateTimeFormat("default", {year: "numeric"}).format(sesionReporte.fecha)
      var fecha = years+"-"+mes+"-"+dia
      // Update the document title using the browser API
      setDate(fecha)
      setDoc(sesionReporte.doctor)
      setProc(sesionReporte.procedimiento)
      setSed(sesionReporte.sedante)
      setMot(sesionReporte.motivo_estudio)
      setAsis(sesionReporte.asistente)
      setIns(sesionReporte.instrumento)
      setEnc(sesionReporte.encabezado)
      setDatos(sesionReporte.hallazgo)
      setEsquema(sesionReporte.esquema)
      setCapturas(capturas.sort((a, b) => a.identificador > b.identificador ? 1 : -1))
    },[]);

    const [imageCode, setImageCode] = React.useState()
    const [imageCodeIndex, setImageCodeIndex] = React.useState()
  
    const [photoEdit, setphotoEdit] = React.useState("")

    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    //const handleShow = () => setShow(true);
  
    const handleShow = (i) => {
      setImageCode(capturas[i].captura)
      setImageCodeIndex(i)
      setShow(true)
    }

    const editPhoto = (i) => {
      const Photos = [...capturas]
      Photos[i].captura = photoEdit
      setCapturas(Photos)
      setShow(false)
    }
  
    const handleOnChage = (e, editor) => {
      setDatos(editor.getData())
    }
  
    const updateCheckChanged = index => e => {
      console.log(index)
      console.log(e.target.checked)
      let newArr = [...capturas]; // copying the old datas array
      newArr[index].visible = e.target.checked; // replace e.target.value with whatever you want to change it to
      setCapturas(newArr); // ??
    }

    const updateFieldChanged = index => e => {
      let newArr = [...capturas]; // copying the old datas array
      newArr[index].descripcion = e.target.value; // replace e.target.value with whatever you want to change it to
      setCapturas(newArr); // ??
    }
    
    var sesionReporte = ipcRenderer.sendSync('get-sesion', {
      sesion_id: props.location.props.idReporte,
    })

    var fechaOriginal = sesionReporte.fecha

    var dia = new Intl.DateTimeFormat("default", {day: "2-digit"}).format(fechaOriginal)
    var mes = new Intl.DateTimeFormat("default", {month: "2-digit"}).format(fechaOriginal)
    var years = new Intl.DateTimeFormat("default", {year: "numeric"}).format(fechaOriginal)

    var paciente = ipcRenderer.sendSync('get-paciente', {
      paciente_id: sesionReporte.paciente,
    })
  
    let procedimientoArray = [];
    (ipcRenderer.sendSync('get-procedimientos')).map((procedimiento) =>(
      procedimientoArray.push([procedimiento.id, procedimiento.procedimiento])
    ))
  
    let sedanteArray = [];
    (ipcRenderer.sendSync('get-sedantes')).map((sedante) =>(
      sedanteArray.push([sedante.id, sedante.sedante])
    ))
    let asistenteArray = [];
    (ipcRenderer.sendSync('get-asistentes')).map((asistente) =>(
      asistenteArray.push([asistente.id, asistente.asistente])
    ))
    let instrumentoArray = [];
    (ipcRenderer.sendSync('get-instrumentos')).map((instrumento) =>(
      instrumentoArray.push([instrumento.id, instrumento.instrumento])
    ))
    let encabezadoArray = [];
    (ipcRenderer.sendSync('get-encabezados')).map((encabezado) =>(
      encabezadoArray.push([encabezado.id, encabezado.direccion])
    ))
    let doctorArray = [];
    (ipcRenderer.sendSync('get-doctores')).map((doctor) =>(
      doctorArray.push([doctor.id, doctor.doctor])
    ))
     
  
    const handleSubmit = (evt) => {
      evt.preventDefault();

  
      var fechaO = years+"-"+mes+"-"+dia
      console.log(ipcRenderer.sendSync('update-sesion', {
        id: props.location.props.idReporte,
        fecha: fechaO === date?fechaOriginal:Date.parse(date),
        hallazgo: datos,
        doctor: doc,
        procedimiento: proc,
        sedante: sed,
        motivo_estudio: mot,
        asistente: asis,
        instrumento: ins,
        encabezado: enc,
        esquema: esquema
      }))
      capturas.map((photo, index) => ( 
        console.log(ipcRenderer.sendSync('update-captura', {
          id: photo.id,
          identificador: index+1,
          captura: photo.captura,
          descripcion: photo.descripcion,
          visible: photo.visible === 'true'||photo.visible === true?'true':null
        })) 
      ))

      setToggleState(toggleState === false ? true : false)
    }
  
    return(
      <React.Fragment>
      <h3>Datos del estudio {sesionReporte.id} ({paciente.nombre+' '+paciente.apellido_paterno+' '+paciente.apellido_materno})</h3>
        <h6> Fecha: 
        {new Intl.DateTimeFormat("default", {
          day: "2-digit"
        }).format(sesionReporte.fecha)}/
        {new Intl.DateTimeFormat("default", {
          month: "2-digit"
        }).format(sesionReporte.fecha)}/
        {new Intl.DateTimeFormat("default", {
          year: "numeric"
        }).format(sesionReporte.fecha)} {new Intl.DateTimeFormat("default", {
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric'
        }).format(sesionReporte.fecha)}
        </h6>
  
        <Container fluid>
        <Row>     
          <Col >
                  <form onSubmit={handleSubmit}>
                  <label class="bp3-label bp3-inline"> Fecha del estudio:
                  <input placeholder="Apellido materno" type="date" value={date} onChange={e => setDate(e.target.value)}/></label>
            
                  <label class="bp3-label bp3-inline"> Doctor
                  <div class="bp3-select" >
                      <select onChange={e => setDoc(e.target.value)}>
                        { doctorArray.map(value => (
                          <option key={value[0]} value={value[0]} selected={value[0] === sesionReporte.doctor?true:false}>
                            {value[1]}
                          </option>
                        ))}
                      </select>
                  </div>
                  </label>
                  <label class="bp3-label bp3-inline"> Procedimiento
                  <div class="bp3-select" >
                      <select onChange={e => setProc(e.target.value)}>
                        {procedimientoArray.map(value => (
                          <option key={value[0]} value={value[0]} selected={value[0] === sesionReporte.procedimiento?true:false}>
                            {value[1]}
                          </option>
                        ))}
                      </select>
                  </div>
                  </label>
                  <label class="bp3-label bp3-inline"> Sedante
                  <div class="bp3-select" >
                      <select onChange={e => setSed(e.target.value)}>
                        {sedanteArray.map(value => (
                          <option key={value[0]} value={value[0]} selected={value[0] === sesionReporte.sedante?true:false}>
                            {value[1]}
                          </option>
                        ))}
                      </select>
                  </div>
                  </label>
                  <label class="bp3-label bp3-inline"> Motivo del estudio:
                  <input placeholder="Motivo del estudio" type="text" value={mot} onChange={e => setMot(e.target.value)}/></label>
                  <label class="bp3-label bp3-inline"> Asistente
                  <div class="bp3-select" >
                      <select onChange={e => setAsis(e.target.value)}>
                        {asistenteArray.map(value => (
                          <option key={value[0]} value={value[0]} selected={value[0] === sesionReporte.asistente?true:false}>
                            {value[1]}
                          </option>
                        ))}
                      </select>
                  </div>
                  </label>
                  <label class="bp3-label bp3-inline"> Instrumento
                  <div class="bp3-select" >
                      <select onChange={e => setIns(e.target.value)}>
                        {instrumentoArray.map(value => (
                          <option key={value[0]} value={value[0]} selected={value[0] === sesionReporte.instrumento?true:false}>
                            {value[1]}
                          </option>
                        ))}
                      </select>
                  </div>
                  </label>
                  <label class="bp3-label bp3-inline"> Encabezado
                  <div class="bp3-select" >
                      <select onChange={e => setEnc(e.target.value)}>
                        {encabezadoArray.map(value => (
                          <option key={value[0]} value={value[0]} selected={value[0] === sesionReporte.encabezado?true:false}>
                            {value[1]}
                          </option>
                        ))}
                      </select>
                  </div>
                  </label>

                  {toggleState?
                    <NavLink
                    to={{pathname:'/reportes',
                    reporteProps:{
                    fechaEstudio: years+"-"+mes+"-"+dia === date?fechaOriginal:Date.parse(date),
                    paciente: sesionReporte.paciente,
                    estudios_id: sesionReporte.id,
                    esquema: esquema,
                    hallazgo: datos,
                    doctor: doc,
                    procedimiento: proc,
                    sedante: sed,
              
                    motivo_estudio: mot,
                    asistente: asis,
                    instrumento: ins,
              
                    encabezado: enc
              
                    }}}
                    >
                    <Button icon="print" large text="Generar Reporte" intent="success"/>
                    </NavLink>
                    : 
                    <button type="submit">Guardar Cambios</button>}

                  
                  </form>
        </Col>
        <Col >
            <HomePage dataImage={image => setEsquema(image)} photo={sesionReporte.esquema}/>
        </Col>
        </Row>
      </Container>
  
       
        <h3>Fotografias</h3>
  
        <div style={{height: 320, paddingTop: '30px',  backgroundColor: 'khaki', overflow: "scroll"}}>
        <DragDropContext 
        onDragEnd={(param) => {
          const srcI = param.source.index;
          const desI = param.destination?.index;
          if (desI) {
            capturas.splice(desI, 0, capturas.splice(srcI, 1)[0]);
            setCapturas(capturas)
          }
        }}
        >       
        <Droppable droppableId="droppable-1" direction="horizontal">
        {(provided, _) => (
              <div ref={provided.innerRef} {...provided.droppableProps} style={{ display: "flex", padding: "grid", width: capturas.length*230}}>
              {capturas.map((photo, index) => (
                <Draggable key={photo.identificador} draggableId={"draggable-"+photo.identificador} index={index}>
                {(provided, snapshot) => (
                  <div  key={{ index }}  ref={provided.innerRef}
                  {...provided.draggableProps}
                  style={{
                    ...provided.draggableProps.style,
                    userSelect: "none",
                    padding: "grid * 2",
                    margin: `0 2px 0 0`,
                    boxShadow: snapshot.isDragging
                      ? "0 0 .4rem #666"
                      : "none",
                  }}>
                    <label class="bp3-control bp3-checkbox bp3-align-right" style={{marginBottom: '-35px'}}>
                      <input type="checkbox" class="bp3-large" checked={photo.visible} onChange={updateCheckChanged(index)}/>
                      <span class="bp3-control-indicator"></span>
                      <b style={{fontSize: '170%', WebkitTextStrokeWidth: '1px', WebkitTextStrokeColor: 'white'}}>{index+1}</b>
                    </label>
                    <img src={photo.captura} style={{ width: "230px", height: "230px", borderRadius: "10px" }} {...provided.dragHandleProps}/>
                    <input  type="text" name="name" value={photo.descripcion} onChange={updateFieldChanged(index)}  />
                    <button onClick={() => handleShow(index)} class="bp3-button bp3-minimal bp3-icon-edit"/>

                  </div>
                )}
                </Draggable>
              ))}
            </div>
        )}
       </Droppable>
       </DragDropContext>
       </div>

       <CKEditor
       editor={ClassicEditor}
       onChange={handleOnChage}
       data = {datos}
       />

       <Modal
       show={show}
       onHide={handleClose}
       backdrop="static"
       keyboard={false}
       >
         <Modal.Header closeButton>
           <Modal.Title>Edición de fotografía</Modal.Title>
         </Modal.Header>
           <Modal.Body>
           <HomePage dataImage={image => setphotoEdit(image)} photo={imageCode}/>
           
           </Modal.Body>
         <Modal.Footer>
           <Button variant="secondary" onClick={handleClose}>
             Cancelar
           </Button>
           <Button variant="primary" onClick={() => editPhoto(imageCodeIndex)}>Aplicar Cambios</Button>
         </Modal.Footer>
        </Modal>

      </React.Fragment>
      )    
  }

export default App