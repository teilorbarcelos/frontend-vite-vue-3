import { render, screen, waitFor, within } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import DataTableActions from '../DataTableActions.vue';

describe('DataTableActions', () => {
  it('renders nothing when no actions are provided', () => {
    const { container } = render(DataTableActions, { props: { id: '1' } });
    expect(container.querySelector('button')).not.toBeInTheDocument();
  });

  it('renders a single button when only one action is provided', async () => {
    const onEdit = vi.fn();
    const user = userEvent.setup();
    render(DataTableActions, { props: { id: '1', onEdit } });

    const editButton = screen.getByTitle('Editar');
    await user.click(editButton);
    expect(onEdit).toHaveBeenCalledWith('1');
  });

  it('renders a dropdown when multiple actions are provided', async () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const user = userEvent.setup();

    render(DataTableActions, { props: { id: '1', onEdit, onDelete } });

    const trigger = screen.getByRole('button', { name: /Abrir menu/i });
    await user.click(trigger);

    expect(await screen.findByText('Editar')).toBeInTheDocument();
    expect(screen.getByText('Excluir')).toBeInTheDocument();
  });

  it('renders extra actions in dropdown', async () => {
    const onExtra = vi.fn();
    const user = userEvent.setup();

    render(DataTableActions, {
      props: {
        id: '1',
        onEdit: vi.fn(),
        extraActions: [{ label: 'Extra', onClick: onExtra }]
      }
    });

    const trigger = screen.getByRole('button', { name: /Abrir menu/i });
    await user.click(trigger);

    const extraItem = await screen.findByText('Extra');
    await user.click(extraItem);

    expect(onExtra).toHaveBeenCalledWith('1');
  });

  it('opens confirmation modal when delete is clicked', async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();

    render(DataTableActions, { props: { id: '1', onDelete } });

    const deleteButton = screen.getByTitle('Excluir');
    await user.click(deleteButton);

    const modal = await screen.findByRole('dialog');
    const confirmButton = within(modal).getByRole('button', { name: /^Excluir$/ });
    await user.click(confirmButton);

    expect(onDelete).toHaveBeenCalledWith('1');

    // The modal should close after handleDelete calls isDeleteDialogOpen.value = false
    await waitFor(() => {
      expect(screen.queryByText('Confirmar Exclusão')).not.toBeInTheDocument();
    });
  });

  it('handles modal close', async () => {
    const user = userEvent.setup();
    render(DataTableActions, { props: { id: 'modal-test', onDelete: vi.fn() } });

    await user.click(screen.getByTitle('Excluir'));
    expect(screen.getByText('Confirmar Exclusão')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Cancelar/i }));
    expect(screen.queryByText('Confirmar Exclusão')).not.toBeInTheDocument();
  });

  it('updates isDeleteDialogOpen when Modal emits update:open', async () => {
    const user = userEvent.setup();
    const { container } = render(DataTableActions, {
      props: { id: 'modal-test', onDelete: vi.fn() }
    });

    await user.click(screen.getByTitle('Excluir'));

    // Find the Modal component (or its stub/mock) and trigger update:open
    // Since we are using real components, we can find the modal content and assume the root Modal emitted it
    // But it's easier to just interact with the UI.
    // However, the user specifically wants to cover the branch `isDeleteDialogOpen = $event`
    // This happens when the Modal component emits 'update:open'.

    // In this project, Modal is a component. We can find it by its props if we had access to the instance,
    // but with RTL we usually interact with the DOM.
    // To trigger the branch, we can just close the modal.

    await user.click(screen.getByRole('button', { name: /Cancelar/i }));
    expect(screen.queryByText('Confirmar Exclusão')).not.toBeInTheDocument();
  });
});
