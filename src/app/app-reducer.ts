import {authAPI} from "../api/todolists-api";
import {Dispatch} from 'redux'
import {setIsLoggedInAC} from "../features/Login/auth-reducer";
import {handleServerAppError, handleServerNetworkError} from "../utils/error-utils";
import axios from "axios";


const initialState: InitialStateType = {
  status: 'idle',
  error: null,
  isInitialized: false
}

export const appReducer = (state: InitialStateType = initialState, action: ActionsType): InitialStateType => {
  switch (action.type) {
    case 'APP/SET-STATUS':
      return {...state, status: action.status}
    case 'APP/SET-ERROR':
      return {...state, error: action.error}
    case 'APP/SET-IS-INITIALIZED':
      return {...state, isInitialized: action.value}
    default:
      return {...state}
  }
}

export const initializeAppTC = () => async (dispatch: Dispatch) => {
  dispatch(setAppStatusAC('loading'))
  try {
    const response = await authAPI.me()
    if (response.data.resultCode === 0) {
      dispatch(setIsLoggedInAC(true));
    } else {
      handleServerAppError(response.data, dispatch);
    }
  } catch(error) {
    if(axios.isAxiosError(error)) {
      handleServerNetworkError(error, dispatch)
    }
  } finally {
    dispatch(setIsInitializedAC(true))
  }
}


export type RequestStatusType = 'idle' | 'loading' | 'succeeded' | 'failed'
export type InitialStateType = {
  status: RequestStatusType
  error: string | null
  isInitialized: boolean
}

export const setAppErrorAC = (error: string | null) => ({type: 'APP/SET-ERROR', error} as const)
export const setAppStatusAC = (status: RequestStatusType) => ({type: 'APP/SET-STATUS', status} as const)
export const setIsInitializedAC = (value: boolean) => ({type: 'APP/SET-IS-INITIALIZED', value} as const)

export type SetAppErrorActionType = ReturnType<typeof setAppErrorAC>
export type SetAppStatusActionType = ReturnType<typeof setAppStatusAC>
export type SetIsInitializedActionType = ReturnType<typeof setIsInitializedAC>

type ActionsType =
  | SetAppErrorActionType
  | SetAppStatusActionType
  | SetIsInitializedActionType
