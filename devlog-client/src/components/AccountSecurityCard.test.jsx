import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '../api/axios';
import useAuthStore from '../store/authStore';
import AccountSecurityCard from './AccountSecurityCard';

vi.mock('../api/axios', () => ({
  default: {
    delete: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

describe('AccountSecurityCard', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: { _id: 'user-id', email: 'dev@example.com', emailVerified: true },
      sessionChecked: true,
    });
    api.delete.mockResolvedValue({ data: { message: 'Cuenta eliminada' } });
  });

  it('envía la contraseña actual al solicitar la eliminación de cuenta', async () => {
    render(
      <MemoryRouter>
        <AccountSecurityCard />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText('Contraseña actual para eliminar la cuenta'), {
      target: { value: 'password-seguro' },
    });
    fireEvent.change(screen.getByLabelText('Confirmación para eliminar cuenta'), {
      target: { value: 'ELIMINAR' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar definitivamente' }));

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith('/users/account', {
        data: { currentPassword: 'password-seguro' },
      });
    });
  });
});
