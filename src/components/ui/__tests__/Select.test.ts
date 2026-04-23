import { nextTick } from 'vue';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/vue';
import { describe, expect, it, vi } from 'vitest';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue
} from '../Select';

describe('Select', () => {
  it('renders correctly and opens', async () => {
    render({
      components: {
        Select,
        SelectContent,
        SelectItem,
        SelectTrigger,
        SelectValue,
        SelectGroup,
        SelectLabel,
        SelectSeparator
      },
      template: `
        <Select>
          <SelectTrigger class="w-[180px]">
            <SelectValue placeholder="Select a fruit" />
          </SelectTrigger>
          <SelectContent @close-auto-focus.prevent>
            <SelectGroup>
              <SelectLabel>Fruits</SelectLabel>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectSeparator />
              <SelectItem value="banana">Banana</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      `
    });

    const trigger = screen.getByRole('combobox');
    expect(trigger).toBeInTheDocument();
    expect(screen.getByText('Select a fruit')).toBeInTheDocument();

    const user = userEvent.setup({ pointerEventsCheck: 0 as any });
    await user.click(trigger);
    
    // Find the option in the portal, avoiding the native select options
    const appleOption = await waitFor(() => {
      const elements = screen.queryAllByText(/Apple/i);
      const target = elements.find(el => el.closest('[role="option"]'));
      if (!target) throw new Error('Apple option not found');
      return target;
    });

    const bananaOption = screen.queryAllByText(/Banana/i)
      .find(el => el.closest('[role="option"]'));
    
    expect(appleOption).toBeInTheDocument();
    expect(bananaOption).toBeInTheDocument();
  });

  it('selects an option', async () => {
    const onUpdateValue = vi.fn();
    render({
      components: {
        Select,
        SelectContent,
        SelectItem,
        SelectTrigger,
        SelectValue
      },
      setup() {
        return { onUpdateValue };
      },
      template: `
        <Select @update:modelValue="onUpdateValue">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent @close-auto-focus.prevent>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="banana">Banana</SelectItem>
          </SelectContent>
        </Select>
      `
    });

    const user = userEvent.setup({ pointerEventsCheck: 0 as any });
    await user.click(screen.getByRole('combobox'));
    
    const appleOption = await waitFor(() => {
      const elements = screen.queryAllByText(/Apple/i);
      const target = elements.find(el => el.closest('[role="option"]'));
      if (!target) throw new Error('Apple option not found');
      return target;
    });

    await user.click(appleOption);
    await nextTick();

    expect(onUpdateValue).toHaveBeenCalledWith('apple');
  });
});
