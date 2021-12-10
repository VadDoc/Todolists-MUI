import React, {ChangeEvent, KeyboardEvent, useState} from 'react';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import {AddBox} from '@mui/icons-material';

type AddItemFormPropsType = {
  addItem: (title: string) => void
  disabled?: boolean
}

export const AddItemForm = React.memo(function ({addItem, disabled = false}: AddItemFormPropsType) {
  const [title, setTitle] = useState('')
  const [error, setError] = useState<string | null>(null)

  const addItemHandler = () => {
    if (title.trim() !== '') {
      addItem(title);
      setTitle('');
    } else {
      setError('Title is required');
    }
  }

  const onChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.currentTarget.value)
  }

  const onKeyPressHandler = (e: KeyboardEvent<HTMLInputElement>) => {
    if (error !== null) {
      setError(null);
    }
    if (e.charCode === 13) {
      addItemHandler();
    }
  }

  return (
    <div className={'add-item'}>
      <TextField variant="outlined"
                 disabled={disabled}
                 error={!!error}
                 value={title}
                 onChange={onChangeHandler}
                 onKeyPress={onKeyPressHandler}
                 label="Title"
                 helperText={error}
      />
      <IconButton color="success" onClick={addItemHandler} disabled={disabled}>
        <AddBox/>
      </IconButton>
    </div>
  )
})
