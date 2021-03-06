import { USER_LOGGED_IN, USER_LOGGED_OUT } from '../types';
import api from '../api';
import setAuthorizationHeader from '../utils/setAuthorizationHeader';

export const userLoggedIn = user => ({
  type: USER_LOGGED_IN,
  user,
});

export const login = credentials => dispatch =>
  api.user.login(credentials).then((user) => {
    localStorage.votingappJWT = user.token;
    localStorage.votingappUserID = user.id;
    setAuthorizationHeader(localStorage.votingappJWT);
    dispatch(userLoggedIn(user));
  });

export const userLoggedOut = () => ({
  type: USER_LOGGED_OUT,
});

export const logout = () => (dispatch) => {
  localStorage.removeItem('votingappJWT');
  localStorage.removeItem('votingappUserID');
  setAuthorizationHeader();
  dispatch(userLoggedOut());
};
