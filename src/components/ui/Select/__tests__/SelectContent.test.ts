import { render, screen } from '@testing-library/vue';
import { describe, it, expect } from 'vitest';
import SelectContent from '../SelectContent.vue';
import { SelectRoot } from 'radix-vue';
import { h } from 'vue';

describe('SelectContent', () => {
  it('renders correctly', async () => {
    // SelectContent must be inside SelectRoot
    const Wrapper = {
      setup() {
        return () =>
          h(
            SelectRoot,
            { open: true },
            {
              default: () =>
                h(SelectContent, null, {
                  default: () => h('div', 'Content')
                })
            }
          );
      }
    };

    render(Wrapper);
    expect(await screen.findByText('Content')).toBeInTheDocument();
  });
});
