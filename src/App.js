import React from 'react'
import { BrowserRouter, Route, NavLink } from 'react-router-dom'
import './App.css'
import { Button } from "@blueprintjs/core";
import { Form, Input, Select, NumInput, Radios, DatePiker } from "./components";


const add_paciente = () => {
  const onSubmit = data => console.log(data);
  return(
    <>
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
    </>
  )
}
  



const pacientes = () => {
  
  return(
    <h1>Pacientes</h1>
    )
}

const Videos = () => (
  <h1>Videos</h1>
)

const NavegacionImperativa = ({ history }) => {
  console.log(history)

  return (
    <div>
      <button class="bp3-button bp3-minimal bp3-icon-undo" onClick={history.goBack}/>
      <button class="bp3-button bp3-minimal bp3-icon-flow-end" onClick={history.goForward}/>
    </div>
  )
}

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
        <NavLink to='/pacientes' activeClassName='active'><button class="bp3-button bp3-minimal bp3-icon-database">Pacientes</button></NavLink>
        <NavLink to='/videos' activeClassName='active'><button class="bp3-button bp3-minimal bp3-icon-document">Videos</button></NavLink>
          <span class="bp3-navbar-divider"></span>
          <button class="bp3-button bp3-minimal bp3-icon-user"></button>
          <button class="bp3-button bp3-minimal bp3-icon-notifications"></button>
          <button class="bp3-button bp3-minimal bp3-icon-cog"></button>
        </div>
      </nav>

      <Route path='/' exact render={add_paciente} />
      <Route path='/pacientes' render={pacientes} />
      <Route path='/videos' render={Videos} />
    </BrowserRouter>
  )
}

export default App
