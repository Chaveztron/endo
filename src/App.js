import React, { useState, useEffect } from 'react';
import { BrowserRouter, Route, NavLink } from 'react-router-dom'
import queryString from 'query-string'
import './App.css'
import { Button } from "@blueprintjs/core";
import Webcam from "react-webcam";
import { Form, Input, Select, NumInput, Radios, DatePiker } from "./components";
const { ipcRenderer } = window.require("electron");

const App = () => {
  return (
    <BrowserRouter>
    <div style={{backgroundColor: "#566573", color: "white"}}>
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
        <NavLink to='/videos' activeClassName='active'><button class="bp3-button bp3-minimal bp3-icon-document">Videos</button></NavLink>
          <span class="bp3-navbar-divider"></span>
          <button class="bp3-button bp3-minimal bp3-icon-user"></button>
          <button class="bp3-button bp3-minimal bp3-icon-notifications"></button>
          <button class="bp3-button bp3-minimal bp3-icon-cog"></button>
        </div>
      </nav>
      <Route path='/' exact render={Add_paciente}/>
      <Route path='/Pacientes' render={(props)=> <Pacientes {...props} />} />
      <Route path='/videos' render={(props)=> <Videos {...props} />} />
      </div>
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
        <Radios name="Sexo" values={["Woman", "Man"]}/>
        <Select name="Genero" options={["mujer", "hombre"]} />
        <DatePiker name="Nacimiento"/>
        <Button type="submit" value="Submit" >Agregar </Button>
      </Form> 
    </React.Fragment>
  )
}

const Pacientes = (props) => {
  const [users, setUser] = useState(ipcRenderer.sendSync('get-pacientes'))
  useEffect(()=>{
    console.log("dentro de los Pacientes")
    return(
      console.log("Saliendo del componente")
    )
  })

  return(
    <React.Fragment>
    <h1>Pacientes</h1>
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
        {users.map(user =>(
          <tr key={user.id}>
            <td>{ user.id }</td>
            <td>{ user.nombre }</td>
            <td>{ user.apellido_paterno }</td>
            <td>{ user.apellido_materno }</td>
            <td>{ user.telefono }</td>
            <td>{ user.sexo }</td>
            <td>{ user.genero }</td>            
            <td>{ user.nacimiento }</td>
            <td><NavLink to={`/videos?id=${user.id}`}><button class="bp3-button bp3-minimal bp3-icon-desktop"/></NavLink></td>
          </tr>
        ))}
      </tbody>
    </table>
    </React.Fragment>
    )    
}

const Videos = ({location}, props) => {
  const [deviceId, setDeviceId] = React.useState("");
  const [devices, setDevices] = React.useState([]);
  const [photos, setPhotos] = React.useState([]);
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
  const webcamRef = React.useRef(null);
  const capture = React.useCallback(
    () => {
      const imageSrc = webcamRef.current.getScreenshot();
      console.log(imageSrc)
      setPhotos(photos => [...photos,imageSrc])
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
  }
  let myArray = [];
  devices.map((device) => (
    myArray.push(device.deviceId)
  ))
  return (
    <React.Fragment>
      <h1>Endoscopía</h1>
      <h2>ID: { id }</h2>
      <Form onSubmit={onSubmit}>
        <Select name="Device" options={myArray} />
        <Button type="submit" value="Submit" >Seleccionar</Button>
      </Form>
      {deviceId
        ?  <React.Fragment>
        <Webcam audio={false} videoConstraints={{ deviceId: deviceId }} ref={webcamRef} screenshotFormat="image/jpeg" />  
        <Button onClick={capture}>Capture photo</Button></React.Fragment>
        : <h1>Rellene el fomulario y seleccione fuente capturadora</h1>
      }
          {photos.map((photo) => (
            <img src={photo} />
          ))}
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
