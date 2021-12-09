import React, {useEffect} from 'react'
import './App.css'
import {TodolistsList} from '../features/TodolistsList/TodolistsList'
import {useDispatch, useSelector} from 'react-redux'
import {AppRootStateType} from './store'
import {initializeAppTC, RequestStatusType} from './app-reducer'
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import LinearProgress from '@mui/material/LinearProgress';
import {Menu} from '@mui/icons-material';
import {ErrorSnackbar} from '../components/ErrorSnackbar/ErrorSnackbar'
import {Login} from "../features/Login/Login";
import {Routes, Route} from "react-router-dom";
import {CircularProgress} from "@mui/material";
import {logoutTC} from "../features/Login/auth-reducer";

type PropsType = {
  demo?: boolean
}

function App({demo = false}: PropsType) {
  const status = useSelector<AppRootStateType, RequestStatusType>((state) => state.app.status)
  const isInitialized = useSelector<AppRootStateType, boolean>((state) => state.app.isInitialized)
  const isLoggedIn = useSelector<AppRootStateType, boolean>((state) => state.auth.isLoggedIn)

  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(initializeAppTC())
  }, [dispatch])

  //проверка на инициализацию, чтобы не прыгало приложение на /login и обратно,
  //a сразу проверяет dispatch(initializeAppTC())
  if (!isInitialized) {
    return <div
      style={{position: 'fixed', top: '30%', textAlign: 'center', width: '100%'}}>
      <CircularProgress/>
    </div>
  }

  const onLogOut = () => {
    dispatch(logoutTC())
  }

  return (
    <div className="App">
      <ErrorSnackbar/>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu">
            <Menu/>
          </IconButton>
          <Typography variant="h6">
            News
          </Typography>
          {isLoggedIn && <Button onClick={onLogOut} color={"inherit"}>Log out</Button>}
        </Toolbar>
        {status === 'loading' && <LinearProgress/>}
      </AppBar>
      <Container fixed>
        <Routes>
          <Route path={'/'} element={<TodolistsList demo={demo}/>}/>
          <Route path={'/login'} element={<Login/>}/>
          <Route path={'/*'} element={<div>404</div>}/>
        </Routes>
      </Container>
    </div>
  )
}

export default App
