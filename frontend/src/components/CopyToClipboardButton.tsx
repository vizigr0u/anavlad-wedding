import './style/CopyToClipboard.css'

import { Snackbar } from '@mui/material'
import { ContentCopy } from '@mui/icons-material';
import { useState } from 'react'

export default function CopyToClipboardButton({ text, message = '', buttonText = '', styleName = '' }:
  { text: string, message?: string, buttonText?: string, styleName?: string }) {
  const [open, setOpen] = useState(false)

  const handleClick = () => {
    setOpen(true)
    navigator.clipboard.writeText(text)
  }
  return (
    <>
      <button className={'copy-to-clipboard-button ' + styleName} onClick={handleClick}><ContentCopy />{buttonText}</button>
      {message && <Snackbar
        open={open}
        onClose={() => setOpen(false)}
        autoHideDuration={2000}
        message={message}
      />}
    </>
  )
}
