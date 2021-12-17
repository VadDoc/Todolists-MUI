import {todolistsAPI, TodolistType} from '../../api/todolists-api'
import {Dispatch} from 'redux'
import {RequestStatusType, setAppStatusAC} from '../../app/app-reducer'
import {createSlice, PayloadAction} from "@reduxjs/toolkit";

const initialState: Array<TodolistDomainType> = []

const slice = createSlice({
  name: 'todolists',
  initialState: initialState,
  reducers: {
    removeTodolistAC(state, action: PayloadAction<{ id: string }>) {
      const index = state.findIndex(tl => tl.id === action.payload.id)
      if (index > -1) {
        state.splice(index, 1)
      }
    },
    addTodolistAC(state, action: PayloadAction<{ todolist: TodolistType }>) {
      state.unshift({...action.payload.todolist, filter: 'all', entityStatus: 'idle'})
    },
    changeTodolistTitleAC(state, action: PayloadAction<{ id: string, title: string }>) {
      const index = state.findIndex(tl => tl.id === action.payload.id)
      state[index].title = action.payload.title
    },
    changeTodolistFilterAC(state, action: PayloadAction<{ id: string, filter: FilterValuesType }>) {
      const index = state.findIndex(tl => tl.id === action.payload.id)
      state[index].filter = action.payload.filter
    },
    changeTodolistEntityStatusAC(state, action: PayloadAction<{ id: string, status: RequestStatusType }>) {
      const index = state.findIndex(tl => tl.id === action.payload.id)
      state[index].entityStatus = action.payload.status
    },
    setTodolistsAC(state, action: PayloadAction<{ todolists: Array<TodolistType> }>) {
      return action.payload.todolists.map(tl => ({...tl, filter: 'all', entityStatus: 'idle'}))
    },
  }
})

export const todolistsReducer = slice.reducer
export const {
  removeTodolistAC,
  addTodolistAC,
  changeTodolistTitleAC,
  changeTodolistFilterAC,
  changeTodolistEntityStatusAC,
  setTodolistsAC
} = slice.actions

// thunks
export const fetchTodolistsTC = () => async (dispatch: Dispatch) => {
  dispatch(setAppStatusAC({status: 'loading'}))
  const response = await todolistsAPI.getTodolists()
  dispatch(setTodolistsAC({todolists: response.data}))
  dispatch(setAppStatusAC({status: 'succeeded'}))
}

export const removeTodolistTC = (todolistId: string) => async (dispatch: Dispatch) => {
  dispatch(setAppStatusAC({status: 'loading'}))
  dispatch(changeTodolistEntityStatusAC({id: todolistId, status: 'loading'}))
  await todolistsAPI.deleteTodolist(todolistId)
  dispatch(removeTodolistAC({id: todolistId}))
  dispatch(setAppStatusAC({status: 'succeeded'}))
}

export const addTodolistTC = (title: string) => async (dispatch: Dispatch) => {
  dispatch(setAppStatusAC({status: 'loading'}))
  const response = await todolistsAPI.createTodolist(title)
  dispatch(addTodolistAC({todolist: response.data.data.item}))
  dispatch(setAppStatusAC({status: 'succeeded'}))
}

export const changeTodolistTitleTC = (id: string, title: string) => async (dispatch: Dispatch) => {
  await todolistsAPI.updateTodolist(id, title)
  dispatch(changeTodolistTitleAC({id: id, title: title}))
}

//types
export type FilterValuesType = 'all' | 'active' | 'completed';
export type TodolistDomainType = TodolistType & {
  filter: FilterValuesType
  entityStatus: RequestStatusType
}
