import React, {useCallback, useEffect} from 'react'
import {AddItemForm} from '../../../components/AddItemForm/AddItemForm'
import {EditableSpan} from '../../../components/EditableSpan/EditableSpan'
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import {Delete} from '@mui/icons-material';
import {Task} from './Task/Task'
import {TaskStatuses, TaskType} from '../../../api/todolists-api'
import {FilterValuesType, TodolistDomainType} from '../todolists-reducer'
import {useDispatch} from 'react-redux'
import {fetchTasksTC} from '../tasks-reducer'

export const Todolist = React.memo(function ({demo = false, ...props}: PropsType) {

  const {todolist, tasks, changeFilter, changeTaskStatus, changeTaskTitle, removeTask} = props
  const dispatch = useDispatch()

  useEffect(() => {
    if (demo) {
      return
    }
    dispatch(fetchTasksTC(todolist.id))
  }, [])

  const addTask = useCallback((title: string) => {
    props.addTask(title, todolist.id)
  }, [props.addTask, todolist.id])

  const removeTodolist = () => {
    props.removeTodolist(todolist.id)
  }
  const changeTodolistTitle = useCallback((title: string) => {
    props.changeTodolistTitle(todolist.id, title)
  }, [todolist.id, props.changeTodolistTitle])

  const onAllClickHandler = useCallback(() => changeFilter('all', todolist.id), [todolist.id, changeFilter])
  const onActiveClickHandler = useCallback(() => changeFilter('active', todolist.id), [todolist.id, changeFilter])
  const onCompletedClickHandler = useCallback(() => changeFilter('completed', todolist.id), [todolist.id, changeFilter])

  let tasksForTodolist = tasks

  if (todolist.filter === 'active') {
    tasksForTodolist = tasks.filter(t => t.status === TaskStatuses.New)
  }
  if (todolist.filter === 'completed') {
    tasksForTodolist = tasks.filter(t => t.status === TaskStatuses.Completed)
  }

  return (
    <div>
      <h3 className={'todolist-title'}><EditableSpan value={todolist.title} onChange={changeTodolistTitle}/>
        <IconButton onClick={removeTodolist} disabled={todolist.entityStatus === 'loading'}>
          <Delete/>
        </IconButton>
      </h3>
      <AddItemForm addItem={addTask} disabled={todolist.entityStatus === 'loading'}/>
      <div>
        {
          tasksForTodolist.map(t => <Task key={t.id} task={t} todolistId={todolist.id}
                                          removeTask={removeTask}
                                          changeTaskTitle={changeTaskTitle}
                                          changeTaskStatus={changeTaskStatus}
          />)
        }
      </div>
      <div style={{paddingTop: '10px'}}>
        <Button variant={todolist.filter === 'all' ? 'outlined' : 'text'}
                onClick={onAllClickHandler}
                classes={{root: 'buttonFilter', text: 'buttonFilterText'}}
        >
          All
        </Button>
        <Button variant={todolist.filter === 'active' ? 'outlined' : 'text'}
                onClick={onActiveClickHandler}
                classes={{root: 'buttonFilter', text: 'buttonFilterText'}}
        >
          Active
        </Button>
        <Button variant={todolist.filter === 'completed' ? 'outlined' : 'text'}
                onClick={onCompletedClickHandler}
                classes={{root: 'buttonFilter', text: 'buttonFilterText'}}
        >
          Completed
        </Button>
      </div>
    </div>
  )
})

type PropsType = {
  todolist: TodolistDomainType
  tasks: Array<TaskType>
  changeFilter: (value: FilterValuesType, todolistId: string) => void
  addTask: (title: string, todolistId: string) => void
  changeTaskStatus: (id: string, status: TaskStatuses, todolistId: string) => void
  changeTaskTitle: (taskId: string, newTitle: string, todolistId: string) => void
  removeTask: (taskId: string, todolistId: string) => void
  removeTodolist: (id: string) => void
  changeTodolistTitle: (id: string, newTitle: string) => void
  demo?: boolean
}
