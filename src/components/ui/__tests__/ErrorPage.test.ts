import { render, screen, fireEvent } from '@testing-library/vue';
import { describe, it, expect, vi } from 'vitest';
import ErrorPage from '../ErrorPage.vue';
import { renderWithProviders } from '@/test/test-utils';

describe('ErrorPage', () => {
  it('renders default error message', () => {
    renderWithProviders(ErrorPage);
    expect(screen.getByText('An unexpected error occurred.')).toBeInTheDocument();
    expect(screen.getByText('404')).toBeInTheDocument();
  });

  it('renders string error message', () => {
    renderWithProviders(ErrorPage, {
      props: { error: 'Custom error message' }
    });
    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  it('renders Error object message', () => {
    renderWithProviders(ErrorPage, {
      props: { error: new Error('Error object message') }
    });
    expect(screen.getByText('Error object message')).toBeInTheDocument();
  });

  it('renders error status if provided', () => {
    renderWithProviders(ErrorPage, {
      props: { error: { status: '500', message: 'Server Error' } }
    });
    expect(screen.getByText('500')).toBeInTheDocument();
  });

  it('renders status even if no message', () => {
    renderWithProviders(ErrorPage, {
      props: { error: { status: '403' } }
    });
    expect(screen.getByText('403')).toBeInTheDocument();
    expect(screen.getByText('An unexpected error occurred.')).toBeInTheDocument();
  });

  it('handles reload', async () => {
    const originalLocation = window.location;
    delete (window as any).location;
    window.location = { ...originalLocation, reload: vi.fn() };

    renderWithProviders(ErrorPage);
    const reloadButton = screen.getByText('Try Again');
    await fireEvent.click(reloadButton);

    expect(window.location.reload).toHaveBeenCalled();
    window.location = originalLocation;
  });

  it('handles back to home', async () => {
    const { router } = renderWithProviders(ErrorPage);
    const pushSpy = vi.spyOn(router, 'push');
    
    const homeButton = screen.getByText('Back to Home');
    await fireEvent.click(homeButton);

    expect(pushSpy).toHaveBeenCalledWith('/');
  });
});
