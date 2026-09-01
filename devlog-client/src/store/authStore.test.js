import { beforeEach, describe, expect, it } from 'vitest';
import useAuthStore from './authStore';

describe('authStore', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useAuthStore.setState({ user: null, sessionChecked: false });
  });

  it('mantiene la identidad solo en memoria', () => {
    const user = { _id: 'user-id', username: 'dev', email: 'dev@example.com' };

    useAuthStore.getState().login(user);

    expect(useAuthStore.getState()).toMatchObject({ user, sessionChecked: true });
    expect(window.localStorage.getItem('auth-storage')).toBeNull();
    expect(window.localStorage.getItem('token')).toBeNull();
  });

  it('limpia la identidad sin depender del almacenamiento del navegador', () => {
    useAuthStore.getState().restoreSession({ _id: 'user-id', username: 'dev' });

    useAuthStore.getState().logout();

    expect(useAuthStore.getState()).toMatchObject({ user: null, sessionChecked: true });
  });
});
