import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/vue';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../index';

describe('Tooltip', () => {
  it('renders and shows content when open', async () => {
    render({
      components: { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider },
      template: `
        <TooltipProvider>
          <Tooltip :open="true">
            <TooltipTrigger>Trigger</TooltipTrigger>
            <TooltipContent>Tooltip content</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      `
    });

    const tooltip = await screen.findByRole('tooltip', { hidden: true });
    expect(tooltip).toHaveTextContent('Tooltip content');
  });

  it('renders TooltipContent with custom class', async () => {
    render({
      components: { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider },
      template: `
        <TooltipProvider>
          <Tooltip :open="true">
            <TooltipTrigger>Trigger</TooltipTrigger>
            <TooltipContent class="custom-tooltip">Content</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      `
    });

    const tooltip = await screen.findByRole('tooltip', { hidden: true });
    expect(tooltip.closest('.custom-tooltip')).toBeInTheDocument();
  });
});
