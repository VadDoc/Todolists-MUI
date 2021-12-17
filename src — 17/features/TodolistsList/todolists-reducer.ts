import {todolistsAPI, TodolistType} from '../../api/todolists-api'
import {Dispatch} from 'redux'
import {RequestStatusType, setAppStatusAC, SetAppStatusActionType} from '../../app/app-reducer'
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
      // state.filter(tl => tl.id !== action.payload.id)
    },
    addTodolistAC(state, action: PayloadAction<{ todolist: TodolistType }>) {
      state.unshift({...action.payload.todolist, filter: 'all', entityStatus: 'idle'})
      // [{...action.payload.todolist, filter: 'all', entityStatus: 'idle'}, state]
    },
    changeTodolistTitleAC(state, action: PayloadAction<{ id: string, title: string }>) {
      const index = state.findIndex(tl => tl.id === action.payload.id)
      state[index].title = action.payload.title
      // state.map(tl => tl.id === action.payload.id ? {...tl, title: action.payload.title} : tl)
    },
    changeTodolistFilterAC(state, action: PayloadAction<{ id: string, filter: FilterValuesType }>) {
      const index = state.findIndex(tl => tl.id === action.payload.id)
      state[index].filter = action.payload.filter
      // state.map(tl => tl.id === action.payload.id ? {...tl, filter: action.payload.filter} : tl)
    },
    changeTodolistEntityStatusAC(state, action: PayloadAction<{ id: string, status: RequestStatusType }>) {
      const index = state.findIndex(tl => tl.id === action.payload.id)
      state[index].entityStatus = action.payload.status
      // state.map(tl => tl.id === action.payload.id ? {...tl, entityStatus: action.payload.status} : tl)
    },
    setTodolistsAC(state, action: PayloadAction<{ todolists: Array<TodolistType> }>) {
      //тут возвращаем копию чтобы не перезатереть state
      return action.payload.todolists.map(tl => ({...tl, filter: 'all', entityStatus: 'idle'}))
    },
  }
})

//bp slice забираем reducer и action creators
export const todolistsReducer = slice.reducer
export const {
  removeTodolistAC,
  addTodolistAC,
  changeTodolistTitleAC,
  changeTodolistFilterAC,
  changeTodolistEntityStatusAC,
  setTodolistsAC
} = slice.actions //деструктуирующее присваивание

// export const todolistsReducer = (state: Array<TodolistDomainType> = initialState, action: ActionsType): Array<TodolistDomainType> => {
//   switch (action.type) {
//     case 'REMOVE-TODOLIST':
//       return state.filter(tl => tl.id !== action.id)
//     case 'ADD-TODOLIST':
//       return [{...action.todolist, filter: 'all', entityStatus: 'idle'}, ...state]
//
//     case 'CHANGE-TODOLIST-TITLE':
//       return state.map(tl => tl.id === action.id ? {...tl, title: action.title} : tl)
//     case 'CHANGE-TODOLIST-FILTER':
//       return state.map(tl => tl.id === action.id ? {...tl, filter: action.filter} : tl)
//     case 'CHANGE-TODOLIST-ENTITY-STATUS':
//       return state.map(tl => tl.id === action.id ? {...tl, entityStatus: action.status} : tl)
//     case 'SET-TODOLISTS':
//       return action.todolists.map(tl => ({...tl, filter: 'all', entityStatus: 'idle'}))
//     default:
//       return state
//   }
// }

// actions
// export const removeTodolistAC = (id: string) => ({type: 'REMOVE-TODOLIST', id} as const)
// export const addTodolistAC = (todolist: TodolistType) => ({type: 'ADD-TODOLIST', todolist} as const)
// export const changeTodolistTitleAC = (id: string, title: string) => ({
//   type: 'CHANGE-TODOLIST-TITLE', id, title
// } as const)
// export const changeTodolistFilterAC = (id: string, filter: FilterValuesType) => ({
//   type: 'CHANGE-TODOLIST-FILTER', id, filter
// } as const)
// export const changeTodolistEntityStatusAC = (id: string, status: RequestStatusType) => ({
//   type: 'CHANGE-TODOLIST-ENTITY-STATUS', id, status
// } as const)
// export const setTodolistsAC = (todolists: Array<TodolistType>) => ({type: 'SET-TODOLISTS', todolists} as const)

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

// types
export type AddTodolistActionType = ReturnType<typeof addTodolistAC>;
export type RemoveTodolistActionType = ReturnType<typeof removeTodolistAC>;
export type SetTodolistsActionType = ReturnType<typeof setTodolistsAC>;
// type ActionsType =
//   | RemoveTodolistActionType
//   | AddTodolistActionType
//   | ReturnType<typeof changeTodolistTitleAC>
//   | ReturnType<typeof changeTodolistFilterAC>
//   | SetTodolistsActionType
//   | ReturnType<typeof changeTodolistEntityStatusAC>
export type FilterValuesType = 'all' | 'active' | 'completed';
export type TodolistDomainType = TodolistType & {
  filter: FilterValuesType
  entityStatus: RequestStatusType
}
// type ThunkDispatch = Dispatch<ActionsType | SetAppStatusActionType>
