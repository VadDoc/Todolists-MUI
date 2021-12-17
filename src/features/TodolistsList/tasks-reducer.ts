import {addTodolistAC, removeTodolistAC, setTodolistsAC} from './todolists-reducer'
import {TaskPriorities, TaskStatuses, TaskType, todolistsAPI, UpdateTaskModelType} from '../../api/todolists-api'
import {Dispatch} from 'redux'
import {AppRootStateType} from '../../app/store'
import {setAppStatusAC} from '../../app/app-reducer'
import {handleServerAppError, handleServerNetworkError} from '../../utils/error-utils'
import axios from "axios";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";

const initialState: TasksStateType = {}

const slice = createSlice({
  name: 'tasks',
  initialState: initialState,
  reducers: {
    removeTaskAC(state, action: PayloadAction<{ taskId: string, todolistId: string }>) {
      const tasks = state[action.payload.todolistId]
      const index = tasks.findIndex(t => t.id === action.payload.taskId)
      if (index > -1) {
        tasks.splice(index, 1)
      }
    },
    addTaskAC(state, action: PayloadAction<{ task: TaskType }>) {
      state[action.payload.task.todoListId].unshift(action.payload.task)
    },
    updateTaskAC(state, action: PayloadAction<{ taskId: string, model: UpdateDomainTaskModelType, todolistId: string }>) {
      const tasks = state[action.payload.todolistId]
      const index = tasks.findIndex(t => t.id === action.payload.taskId)
      if (index > -1) {
        tasks[index] = {...tasks[index], ...action.payload.model}
      }
    },
    setTasksAC(state, action: PayloadAction<{ tasks: Array<TaskType>, todolistId: string }>) {
      state[action.payload.todolistId] = action.payload.tasks
    }
  },
  extraReducers: (builder) => {
    builder.addCase(addTodolistAC, (state, action) => {
      state[action.payload.todolist.id] = []
    })
    builder.addCase(removeTodolistAC, (state, action) => {
      delete state[action.payload.id]
    })
    builder.addCase(setTodolistsAC, (state, action) => {
      action.payload.todolists.forEach((tl: any) => {
        state[tl.id] = []
      })
    })
  }
})

export const tasksReducer = slice.reducer
export const {removeTaskAC, addTaskAC, updateTaskAC, setTasksAC} = slice.actions

// thunks
export const fetchTasksTC = (todolistId: string) => async (dispatch: Dispatch) => {
  dispatch(setAppStatusAC({status: 'loading'}))
  const response = await todolistsAPI.getTasks(todolistId)
  const tasks = response.data.items
  dispatch(setTasksAC({tasks, todolistId}))
  dispatch(setAppStatusAC({status: 'succeeded'}))
}

export const removeTaskTC = (taskId: string, todolistId: string) => async (dispatch: Dispatch) => {
  await todolistsAPI.deleteTask(todolistId, taskId)
  dispatch(removeTaskAC({taskId, todolistId}))
}

export const addTaskTC = (title: string, todolistId: string) => async (dispatch: Dispatch) => {
  dispatch(setAppStatusAC({status: 'loading'}))
  try {
    const response = await todolistsAPI.createTask(todolistId, title)
    if (response.data.resultCode === 0) {
      const task = response.data.data.item
      dispatch(addTaskAC({task}))
      dispatch(setAppStatusAC({status: 'succeeded'}))
    } else {
      handleServerAppError(response.data, dispatch);
    }
  } catch (error) {
    if (axios.isAxiosError(error)) handleServerNetworkError(error, dispatch)
  }
}

export const updateTaskTC = (taskId: string, model: UpdateDomainTaskModelType, todolistId: string) =>
  async (dispatch: Dispatch, getState: () => AppRootStateType) => {
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
      ...model
    }

    try {
      const response = await todolistsAPI.updateTask(todolistId, taskId, apiModel)
      if (response.data.resultCode === 0) {
        const action = updateTaskAC({taskId, model, todolistId})
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
