import { createSlice } from '@reduxjs/toolkit'

interface AuthState {
  user: {
    id: string
    name: string
    email: string
  }
  isLoggedIn: boolean
}

const initialState: AuthState = {
  user: {
    id: '',
    name: '',
    email: ''
  },
  isLoggedIn: false
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action) {
      state.isLoggedIn = true
      state.user = action.payload
    },
    logout(state) {
      state.isLoggedIn = false
      state.user = initialState.user
    }
  }
})

export default authSlice.reducer
export { authSlice }