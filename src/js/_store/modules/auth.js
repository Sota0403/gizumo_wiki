import Cookies from 'js-cookie';
import axios from '@Helpers/axiosDefault';

export default {
  state: {
    loading: false,
    signedIn: false,
    token: '',
    errorMessage: '',
    user: {
      email: '',
      id: null,
      account_name: '',
      password_reset_flg: null,
      role: '',
    },
  },
  getters: {
    token: state => state.token,
    user: state => state.user,
  },
  mutations: {
    hasToken(state, { token }) {
      state.signedIn = true;
      state.token = token;
    },
    noToken(state) {
      state.signedIn = false;
      state.token = '';
    },
    sendRequest(state) {
      state.loading = true;
      state.errorMessage = '';
    },
    signInSuccess(state, { token, user }) {
      Cookies.set('user-token', token, { expires: 10 });
      state.token = token;
      state.user = Object.assign({}, { ...state.user }, { ...user });
      state.loading = false;
      state.signedIn = true;
    },
    signInFailure(state, payload) {
      Cookies.remove('user-token');
      state.loading = false;
      state.errorMessage = payload.errorMessage;
    },
    signOut(state) {
      Cookies.remove('user-token');
      state.loading = false;
      state.signedIn = false;
    },
    doneChangePassword() {
      console.log('doneChangePassword');
    },
    failRequest(state, { message }) {
      state.loading = false;
      state.errorMessage = message;
    },
  },
  actions: {
    checkAuth({ commit }, { token }) {
      return new Promise((resolve, reject) => {
        if (!token) {
          commit('signInFailure');
          reject(new Error('認証に失敗しました'));
        } else {
          axios(token)({
            method: 'GET',
            url: '/me',
          }).then((res) => {
            const payload = {
              token,
              user: res.data,
            };
            commit('signInSuccess', payload);
            resolve();
          }).catch(() => {
            commit('signInFailure', {
              errorMessage: 'エラーが発生しました。',
            });
            reject(new Error('エラーが発生しました'));
          });
        }
      });
    },
    signIn({ commit }, { email, password }) {
      commit('sendRequest');
      return new Promise((resolve, reject) => {
        const data = new URLSearchParams();
        data.append('email', email);
        data.append('password', password);
        axios()({
          url: '/me',
          method: 'POST',
          data,
        }).then((response) => {
          if (!response.data.token) reject(new Error());

          return axios(response.data.token)({
            method: 'GET',
            url: '/me',
          }).then((user) => {
            if (user.data.code === 0) return reject(new Error());

            return { token: response.data.token, user: user.data };
          }).catch(() => reject(new Error()));
        }).then((payload) => {
          commit('signInSuccess', payload);
          resolve();
        }).catch(() => {
          commit('signInFailure', {
            errorMessage: 'ログインに失敗しました。メールアドレスとパスワードを確認して再度ログインし直してみてください。',
          });
          reject(new Error());
        });
      });
    },
    signOut({ commit }) {
      commit('signOut');
    },

    // パスワードの設定（初回ログイン時）
    changePassword({ commit, rootGetters }, data) {
      commit('sendRequest');
      console.log(data);

      axios(rootGetters.token)({
        url: '/user/info',
        method: 'POST',
        data,
      }).then((response) => {
        console.log(response);
        commit('doneChangePassword');
      }).catch((err) => {
        commit('failRequest', { message: err.message });
      });
    },
  },
};
