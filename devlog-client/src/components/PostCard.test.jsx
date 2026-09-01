import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '../api/axios';
import useAuthStore from '../store/authStore';
import PostCard from './PostCard';

vi.mock('../api/axios', () => ({
  default: {
    put: vi.fn(),
    delete: vi.fn(),
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

const post = {
  _id: 'post-id',
  author: { _id: 'author-id', username: 'author' },
  content: 'Contenido',
  likesCount: 0,
  likedByCurrentUser: false,
  createdAt: new Date().toISOString(),
};

describe('PostCard', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: { _id: 'current-user', username: 'dev' },
      sessionChecked: true,
    });
    api.put.mockResolvedValue({ data: { likes: 1, liked: true } });
    api.delete.mockResolvedValue({ data: { likes: 0, liked: false } });
  });

  it('usa PUT para dar like y DELETE para quitarlo', async () => {
    render(
      <MemoryRouter>
        <PostCard post={post} />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Dar me gusta' }));
    await waitFor(() => expect(api.put).toHaveBeenCalledWith('/posts/post-id/like'));

    fireEvent.click(await screen.findByRole('button', { name: 'Quitar me gusta' }));
    await waitFor(() => expect(api.delete).toHaveBeenCalledWith('/posts/post-id/like'));
  });
});
