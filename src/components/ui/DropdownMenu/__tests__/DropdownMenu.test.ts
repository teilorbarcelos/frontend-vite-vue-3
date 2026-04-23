import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/vue';
import { nextTick } from 'vue';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../index';

describe('DropdownMenu', () => {
  it('renders DropdownMenuItem with inset', async () => {
    render({
      components: { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger },
      template: `
        <DropdownMenu :open="true">
          <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem :inset="true">Inset Item</DropdownMenuItem>
            <DropdownMenuItem :inset="false">Normal Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      `
    });

    await nextTick();

    const insetItem = await waitFor(() => screen.getByText('Inset Item'));
    const normalItem = screen.getByText('Normal Item');
    
    expect(insetItem).toHaveClass('pl-8');
    expect(normalItem).not.toHaveClass('pl-8');
  });
});
