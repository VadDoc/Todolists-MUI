import {Dispatch} from 'redux'
import {setAppStatusAC} from '../../app/app-reducer'
import {authAPI} from "../../api/todolists-api";
import {handleServerAppError, handleServerNetworkError} from "../../utils/error-utils";
import axios from "axios";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";

const initialState = {
  isLoggedIn: false
}

const slice = createSlice({
  name: 'auth',
  initialState: initialState,
  reducers: {
    //имя action creator
    setIsLoggedInAC (state, action: PayloadAction<{value: boolean}>) {
      //прописываем без созданий копий, т.к. уже приходит копия state см. библиотеку immerjs
      //все свойства находятся в объекте payload
      state.isLoggedIn = action.payload.value
    }
  }
})

//bp slice забираем reducer и action creators
export const authReducer = slice.reducer
export const {setIsLoggedInAC} = slice.actions //деструктуирующее присваивание

// thunks
export const loginTC = (data: any) => (dispatch: Dispatch) => {
  dispatch(setAppStatusAC({status: 'loading'}))
  authAPI.login(data)
    .then(res => {
      if (res.data.resultCode === 0) {
        //нужно передавать объект {value: true}
        dispatch(setIsLoggedInAC({value: true}))
        dispatch(setAppStatusAC({status: 'succeeded'}))
      } else {
        handleServerAppError(res.data, dispatch);
      }
    })
    .catch((error) => {
      handleServerNetworkError(error, dispatch)
    })
    .finally(() => dispatch(setAppStatusAC({status: 'idle'})))
}

export const logoutTC = () => async (dispatch: Dispatch) => {
  dispatch(setAppStatusAC({status: 'loading'}))
  try {
    const response = await authAPI.logout()
    if (response.data.resultCode === 0) {
      //нужно передавать объект {value: false}
      dispatch(setIsLoggedInAC({value: false}))
      dispatch(setAppStatusAC({status: 'succeeded'}))
    } else {
      handleServerAppError(response.data, dispatch)
    }
  } catch (error) {
    if (axios.isAxiosError(error)) handleServerNetworkError(error, dispatch)
  }
}


