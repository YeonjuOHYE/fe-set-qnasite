export const Token = {
  token: localStorage.getItem("token"),
  getToken: () => Token.token,
  setToken: token => {
    localStorage.setItem("token", token);
    Token.token = token;
  },
  clearToken: () => {
    localStorage.clear("token");
    Token.token = null;
  }
};
