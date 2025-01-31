import './style/PreviewAsUser.css'

import { useState } from 'react';

import { Checkbox, FormControlLabel } from '@mui/material';

import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from "axios";

export default function PreviewAsUserLevel({ userlevel }: { userlevel: number }) {
  const [enabled, setEnabled] = useState(true)

  const queryClient = useQueryClient()

  const setPreviewMutation = useMutation({
    mutationFn: () => {
      setEnabled(false);
      return axios.post('/api/user-level', { 'level': userlevel === 0 ? 2 : 0 })
    },
    onSuccess: () => {
      setEnabled(true);
      queryClient.invalidateQueries({ queryKey: ['get_user_data'] });
    }
  })

  return (
    <div className='admin__preview-as-user'>
      <FormControlLabel
        control={<Checkbox name='view-as-checkbox' disabled={!enabled} checked={userlevel === 0} onChange={() => setPreviewMutation.mutate()} />}
        label='Preview as logged out'
      />
    </div>
  )
}
