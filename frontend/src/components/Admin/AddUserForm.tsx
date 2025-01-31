import { FormEvent, useContext, useRef, useState } from 'react';

import { Add } from '@mui/icons-material';

import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from "axios";
import { LanguageSelect } from '../LanguageMenu';

import './style/AddUserForm.css'
import { ConfigContext } from '../../AppConfigContext';

type UserDataToChange = {
  names: string[],
  email: string | null,
  token: string | null,
  lang: string
}

export default function AddUserForm() {
  const config = useContext(ConfigContext);
  const [lang, setLang] = useState(Object.keys(config.languages)[0] ?? 'en');
  const [canSubmit, setCanSubmit] = useState(true);
  const [numNames, setNumNames] = useState(1);

  const namesRef = useRef<HTMLInputElement[]>([]);
  const emailRef = useRef<HTMLInputElement>(null);
  const tokenRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient()

  const addMutation = useMutation({
    mutationFn: (userData: UserDataToChange) => {
      console.log('sending new user: ' + JSON.stringify(userData));
      return axios.post('/api/user', userData)
    },
    onSuccess: () => {
      for (let i = 0; i < numNames; i++) {
        namesRef.current[i].value = "";
      }
      queryClient.invalidateQueries({ queryKey: ['get_users'] });
      emailRef.current!.value = "";
      tokenRef.current!.value = "";
    },
    onSettled: () => { setCanSubmit(true); }
  })

  function handleSubmit(evt: FormEvent) {
    evt.preventDefault();
    function nullIfEmpty(str: string): string | null {
      return str !== '' ? str : null;
    }

    const names = namesRef.current.slice(0, numNames).filter(el => el && el.value).map(el => el.value);
    setCanSubmit(false);
    addMutation.mutate({
      names,
      email: nullIfEmpty(emailRef.current!.value),
      token: nullIfEmpty(tokenRef.current!.value),
      lang
    });
  }
  namesRef.current = [];

  return (
    <form className='add-user-form' onSubmit={handleSubmit}>
      <div className='name-inputs'>
        {[...Array(numNames).keys()].map(i =>
          <input key={i} type="text" placeholder={'Name ' + (i + 1)} name="name" ref={el => { namesRef.current[i] = el!; }} />
        )}
        {numNames > 1 && <button type="button" onClick={() => setNumNames(numNames - 1)}>-</button>}
        {numNames < 10 && <button type="button" onClick={() => setNumNames(numNames + 1)}>+</button>}
      </div>
      <input type="text" placeholder='e-mail' ref={emailRef} />
      <input type="text" placeholder='token' ref={tokenRef} />
      <LanguageSelect lang={lang} handleChange={setLang} styleName='user-form__language-select' />
      <button type="submit" disabled={!canSubmit}><Add /> Add user</button>
    </form>
  )
}
