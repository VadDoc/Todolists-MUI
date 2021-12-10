import React, {ChangeEvent, useCallback} from 'react'
import {EditableSpan} from '../../../../components/EditableSpan/EditableSpan'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import IconButton from '@mui/material/IconButton';
import Checkbox from '@mui/material/Checkbox';
import {TaskStatuses, TaskType} from '../../../../api/todolists-api'

export const Task = React.memo((props: TaskPropsType) => {
  const {task, todolistId, changeTaskStatus, changeTaskTitle, removeTask} = props

  const onClickHandler = useCallback(() => removeTask(task.id, todolistId), [task.id, todolistId, removeTask]);

  const onChangeHandler = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    let newIsDoneValue = e.currentTarget.checked
    changeTaskStatus(task.id, newIsDoneValue ? TaskStatuses.Completed : TaskStatuses.New, todolistId)
  }, [task.id, todolistId, changeTaskStatus]);

  const onTitleChangeHandler = useCallback((newValue: string) => {
    changeTaskTitle(task.id, newValue, todolistId)
  }, [task.id, todolistId, changeTaskTitle]);

  return (
    <div key={task.id} className={[task.status === TaskStatuses.Completed ? 'is-done' : '', 'task'].join(' ')}>
      <Checkbox
        checked={task.status === TaskStatuses.Completed}
        color="success"
        onChange={onChangeHandler}
      />

      <EditableSpan value={task.title} onChange={onTitleChangeHandler}/>
      <IconButton onClick={onClickHandler}>
        <DeleteForeverIcon/>
      </IconButton>
    </div>
  )
})

type TaskPropsType = {
  task: TaskType
  todolistId: string
  changeTaskStatus: (id: string, status: TaskStatuses, todolistId: string) => void
  changeTaskTitle: (taskId: string, newTitle: string, todolistId: string) => void
  removeTask: (taskId: string, todolistId: string) => void
}