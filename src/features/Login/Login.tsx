import React from 'react'
import Grid from '@mui/material/Grid';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import FormLabel from '@mui/material/FormLabel';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import {useFormik} from "formik";
import {useDispatch, useSelector} from "react-redux";
import {loginTC} from "./auth-reducer";
import {AppRootStateType} from "../../app/store";
import {useNavigate} from "react-router-dom";

export type LoginParamsType = {
  email: string
  password: string
}

export const Login = () => {
  type FormikErrorType = {
    email?: string
    password?: string
    rememberMe?: boolean
  }

  const dispatch = useDispatch()

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      rememberMe: false
    },
    validate: (values) => {
      const errors: FormikErrorType = {};
      if (!values.email) {
        errors.email = 'Required';
      } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
        errors.email = 'Invalid email address';
      }
      if (!values.password) {
        errors.password = 'Required';
      } else if (values.password.length < 3) {
        errors.password = 'Password should content more than 2 symbols';
      }
      return errors;
    },
    onSubmit: values => {
      dispatch(loginTC(values))
      formik.resetForm() //очистка формы
    },
  })

  const isLoggedIn = useSelector((state: AppRootStateType) => state.auth.isLoggedIn)
  //useNavigate вместо Redirect пишется внизу перед return
  const navigate = useNavigate()
  if(isLoggedIn) navigate('/')

  //если нужно изменить данные в инпут, не из инпут, a например из редакса, будут проблемы,
  // так как initialValues сработает только при первой перезарисовке. Используем:
  // formik.setFieldValue('email', 'any value')

  return <Grid container justifyContent={'center'}>
    <Grid item justifyContent={'center'}>
      <form onSubmit={formik.handleSubmit}>
        <FormControl>
          <FormLabel>
            <p>To log in get registered
              <a href={'https://social-network.samuraijs.com/'}
                 target={'_blank'}> here
              </a>
            </p>
            <p>or use common test account credentials:</p>
            <p>Email: free@samuraijs.com</p>
            <p>Password: free</p>
          </FormLabel>
          <FormGroup>
            <TextField
              label="Email"
              margin="normal"
              {...formik.getFieldProps('email')} //деструктуризация что есть в formik
              // onBlur={formik.handleBlur}
              // name={"email"}
              // onChange={formik.handleChange}
              // value={formik.values.email}
              error={!!formik.errors.email && formik.touched.email} // пишем ниже деструктуризации
              helperText={formik.touched.email ? formik.errors.email : ''}
            />
            {/*{formik.touched.email && formik.errors.email ? <div style={{color: 'red'}}>{formik.errors.email}</div> : null}*/}
            <TextField
              type="password"
              label="Password"
              margin="normal"
              name={"password"}
              onChange={formik.handleChange}
              value={formik.values.password}
              onBlur={formik.handleBlur}
            />
            {formik.touched.password && formik.errors.password ? <div style={{color: 'red'}}>{formik.errors.password}</div> : null}
            <FormControlLabel
              label={'Remember me'}
              control={
                <Checkbox
                  name={"rememberMe"}
                  onChange={formik.handleChange}
                  checked={formik.values.rememberMe}
                />
              }
            />
            <Button type={'submit'} variant={'contained'} color={'primary'}>
              Login
            </Button>
          </FormGroup>
        </FormControl>
      </form>
    </Grid>
  </Grid>
}
