import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { AppDispatch } from '../store.ts';
import { postRequest } from "../../utils/fetch.ts";
import { LoginParamsType, LoginResponseType, UserStateType, TokenType } from '../../utils/type.ts';

export function getUserInfo(token: string): UserStateType {
  if (token) {
    const tokenParts = token.split('.');
    const encodedPayload = tokenParts[1];
    const decodedPayload = atob(encodedPayload);
    const userInfo: TokenType = JSON.parse(decodedPayload) as TokenType;
    return {
      token: token,
      id: userInfo.user,
      role: userInfo.role
    }
  }
  return {
    token: '',
    id: '',
    role: ''
  }
}

export const userSlice = createSlice({
  name: 'user',
  initialState: getUserInfo(localStorage.getItem('token') || ''),
  reducers: {
    updateUser: (state, action: PayloadAction<string>) => {
      const info: UserStateType = getUserInfo(action.payload);
      state.token = info.token;
      state.id = info.id;
      state.role = info.role;
    },
  },
});

export const { updateUser } = userSlice.actions;

export const doLogin = (data: LoginParamsType) => async (dispatch: AppDispatch) => {
  try {
    const res: LoginResponseType = await postRequest<LoginResponseType>('/auth/login', data);
    console.log(res);
    localStorage.setItem('token', res.token);
    dispatch(updateUser(res.token));
  } catch (e) {
    const msg: string = e as string;
    throw new Error(msg);
  }
};

export default userSlice.reducer;