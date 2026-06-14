const ACCESS_TOKEN_KEY = 'dpow_access_token';
const REFRESH_TOKEN_KEY = 'dpow_refresh_token';
const USER_KEY = 'dpow_user';

export const tokenStorage = {
  getAccessToken: () =>
    typeof window !== 'undefined' ? localStorage.getItem(ACCESS_TOKEN_KEY) : null,
  getRefreshToken: () =>
    typeof window !== 'undefined' ? localStorage.getItem(REFRESH_TOKEN_KEY) : null,
  setTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },
  clearTokens: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
  setUser: (user: object) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  getUser: () => {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
};
