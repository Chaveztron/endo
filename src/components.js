import React from "react";
import { useForm } from "react-hook-form";
import { Row } from 'simple-flexbox';


export function Form({ defaultValues, children, onSubmit }) {
  const methods = useForm({ defaultValues });
  const { handleSubmit } = methods;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {React.Children.map(children, child => {
        return child.props.name
          ? React.createElement(child.type, {
              ...{
                ...child.props,
                register: methods.register,
                key: child.props.name
              }
            })
          : child;
      })}
    </form>
  );
}

export function Input({ register, name, ...rest }) {
  return <div><label class="bp3-label bp3-inline">{ name.replace('_', ' ') }<input class="bp3-input bp3-round" name={name} ref={register} key={name} {...rest} /></label></div>;
}

export function NumInput({ register, name, ...rest }) {
  return <div><label class="bp3-label bp3-inline">{ name.replace('_', ' ') }<input type='number' class="bp3-input bp3-round numIn" name={name} ref={register} key={name} {...rest} /></label></div>;
}

export function DatePiker({ register, name, ...rest }) {
  return (
    <div><label class="bp3-label bp3-inline">{ name.replace('_', ' ') }<input type="date" class="bp3-input bp3-round" name={name} ref={register} key={name} {...rest}/></label></div>
  );
}

export function Radios({ register, values, name, ...rest }) {
  return (
    <React.Fragment>
    <Row vertical='center'>
      {values.map(value => (
        <label class="bp3-control bp3-radio">
          <input type="radio" name={name} value={value} key={value} {...rest} ref={register({ required: true })}/>
          <span class="bp3-control-indicator"></span>
          {value}
        </label>
    ))}
    </Row>
    </React.Fragment>
  );
}

export function Select({ register, options, name, ...rest }) {
  return (
    <label class="bp3-label bp3-inline">{ name.replace('_', ' ') }
<div class="bp3-select" >
    <select name={name} ref={register} {...rest}>
      {options.map(value => (
        <option key={value} value={value}>
          {value}
        </option>
      ))}
    </select>
</div>
</label>
  );
}
