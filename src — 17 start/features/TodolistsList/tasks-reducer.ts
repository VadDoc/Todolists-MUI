import {AddTodolistActionType, RemoveTodolistActionType, SetTodolistsActionType} from './todolists-reducer'
import {TaskPriorities, TaskStatuses, TaskType, todolistsAPI, UpdateTaskModelType} from '../../api/todolists-api'
import {Dispatch} from 'redux'
import {AppRootStateType} from '../../app/store'
import {SetAppErrorActionType, setAppStatusAC, SetAppStatusActionType} from '../../app/app-reducer'
import {handleServerAppError, handleServerNetworkError} from '../../utils/error-utils'
import axios from "axios";

const initialState: TasksStateType = {}

export const tasksReducer = (state: TasksStateType = initialState, action: ActionsType): TasksStateType => {
  switch (action.type) {
    case 'REMOVE-TASK':
      return {...state, [action.todolistId]: state[action.todolistId].filter(t => t.id !== action.taskId)}
    case 'ADD-TASK':
      return {...state, [action.task.todoListId]: [action.task, ...state[action.task.todoListId]]}
    case 'UPDATE-TASK':
      return {
        ...state,
        [action.todolistId]: state[action.todolistId]
          .map(t => t.id === action.taskId ? {...t, ...action.model} : t)
      }
    case 'ADD-TODOLIST':
      return {...state, [action.todolist.id]: []}
    case 'REMOVE-TODOLIST':
      const copyState = {...state}
      delete copyState[action.id]
      return copyState
    case 'SET-TODOLISTS': {
      const copyState = {...state}
      action.todolists.forEach(tl => {
        copyState[tl.id] = []
      })
      return copyState
    }
    case 'SET-TASKS':
      return {...state, [action.todolistId]: action.tasks}
    default:
      return state
  }
}

// actions
export const removeTaskAC = (taskId: string, todolistId: string) => ({type: 'REMOVE-TASK', taskId, todolistId} as const)
export const addTaskAC = (task: TaskType) => ({type: 'ADD-TASK', task} as const)
export const updateTaskAC = (taskId: string, model: UpdateDomainTaskModelType, todolistId: string) => ({
  type: 'UPDATE-TASK', model, todolistId, taskId
} as const)
export const setTasksAC = (tasks: Array<TaskType>, todolistId: string) => ({
  type: 'SET-TASKS', tasks, todolistId
} as const)

// thunks
export const fetchTasksTC = (todolistId: string) => async (dispatch: Dispatch<ActionsType | SetAppStatusActionType>) => {
  dispatch(setAppStatusAC({status: 'loading'}))
  const response = await todolistsAPI.getTasks(todolistId)
  const tasks = response.data.items
  dispatch(setTasksAC(tasks, todolistId))
  dispatch(setAppStatusAC({status: 'succeeded'}))
}

export const removeTaskTC = (taskId: string, todolistId: string) => async (dispatch: Dispatch<ActionsType>) => {
  await todolistsAPI.deleteTask(todolistId, taskId)
  dispatch(removeTaskAC(taskId, todolistId))
}

export const addTaskTC = (title: string, todolistId: string) => async (dispatch: Dispatch<ActionsType | SetAppErrorActionType | SetAppStatusActionType>) => {
  dispatch(setAppStatusAC({status: 'loading'}))
  try {
    const response = await todolistsAPI.createTask(todolistId, title)
    if (response.data.resultCode === 0) {
      const task = response.data.data.item
      dispatch(addTaskAC(task))
      dispatch(setAppStatusAC({status: 'succeeded'}))
    } else {
      handleServerAppError(response.data, dispatch);
    }
  } catch (error) {
    if (axios.isAxiosError(error)) handleServerNetworkError(error, dispatch)
  }
}

export const updateTaskTC = (taskId: string, domainModel: UpdateDomainTaskModelType, todolistId: string) =>
  async (dispatch: ThunkDispatch, getState: () => AppRootStateType) => {
    const state = getState()
    const task = state.tasks[todolistId].find(t => t.id === taskId)
    if (!task) {
      //throw new Error("task not found in the state");
      console.warn('task not found in the state')
      return
    }

    const apiModel: UpdateTaskModelType = {
      deadline: task.deadline,
      description: task.description,
      priority: task.priority,
      startDate: task.startDate,
      title: task.title,
      status: task.status,
      ...domainModel
    }

    try {
      const response = await todolistsAPI.updateTask(todolistId, taskId, apiModel)
      if (response.data.resultCode === 0) {
        const action = updateTaskAC(taskId, domainModel, todolistId)
        dispatch(action)
      } else {
        handleServerAppError(response.data, dispatch);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) handleServerNetworkError(error, dispatch);
    }
  }

// types
export type UpdateDomainTaskModelType = {
  title?: string
  description?: string
  status?: TaskStatuses
  priority?: TaskPriorities
  startDate?: string
  deadline?: string
}
export type TasksStateType = {
  [key: string]: Array<TaskType>
}
type ActionsType =
  | ReturnType<typeof removeTaskAC>
  | ReturnType<typeof addTaskAC>
  | ReturnType<typeof updateTaskAC>
  | AddTodolistActionType
  | RemoveTodolistActionType
  | SetTodolistsActionType
  | ReturnType<typeof setTasksAC>
type ThunkDispatch = Dispatch<ActionsType | SetAppStatusActionType | SetAppErrorActionType>
