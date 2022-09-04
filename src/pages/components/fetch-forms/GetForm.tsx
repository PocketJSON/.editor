import React, { useEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom'

import classes from './GetForm.module.scss';

import DefaultEditor from '../../../core/editor/DefaultEditor';
import getCurrentDate from '../../../core/tools/getCurrentDate';

function GetForm(): JSX.Element {  

  useEffect(() => {
    sessionStorage.clear()
  }, [])
  
  const [isChecked, setIsChecked] = useState(false);

  const parametersDivClass = [classes.ParametersWrapper];
  if(isChecked){
    parametersDivClass.push(classes.active);
  }
  const [parameters, setParameters] = useState('');
  const [needRedirect, setNeedRedirect] = useState(false)

  const urlRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: any) {
    e.preventDefault();
    
    if(urlRef.current?.value && nameRef.current?.value){
      let date = getCurrentDate();
      localStorage.setItem(date, JSON.stringify({name: nameRef.current?.value, time: date, url: urlRef.current?.value, params: parameters}));
      sessionStorage.setItem(date, JSON.stringify({url: urlRef.current?.value, params: parameters}));
      setNeedRedirect(true);
    } else {
      console.log('err: не все поля заполнены');
    }
  }

  return (
    <div className={classes.SettingsWrapper}>
      <div>
        <form>
          <label>
            <span>Fetch url:</span>
            <input 
              ref={urlRef}
              type="text" 
              placeholder='Url...'
            />
          </label>
          <label>
            <span>File name:</span>
            <input 
              ref={nameRef}
              type="text" 
              placeholder='Some text...'
            />
          </label>
        </form>
        <form>
          <label>
            <input
              type="checkbox"
              onChange={() => {
                setIsChecked(!isChecked);
              }}
            />
            <span>Add params.</span>
          </label>
        </form>
      </div>
      <div className={parametersDivClass.join(' ')}>
        <DefaultEditor 
        width={'450px'} 
        height={'400px'} 
        value={{ "params": {  } }} 
        options={{tabSize: 2}} 
        setContent={setParameters}/>
      </div>
      <button onClick={handleSubmit}>submit</button>
      {needRedirect 
        ? <Navigate 
            to="/workspace"
          /> 
        : <></>}
    </div>
  )
}

export default GetForm;