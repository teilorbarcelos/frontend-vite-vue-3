import { render, screen } from '@testing-library/vue';
import { describe, it, expect, vi } from 'vitest';
import SelectContent from '../SelectContent.vue';
import { SelectRoot } from 'radix-vue';
import { h } from 'vue';

vi.mock('radix-vue', async (importOriginal) => {
  const original = await importOriginal<typeof import('radix-vue')>();
  return {
    ...original,
    SelectScrollUpButton: {
      template: '<div><slot /></div>'
    },
    SelectScrollDownButton: {
      template: '<div><slot /></div>'
    }
  };
});

describe('SelectContent', () => {
  it('renders correctly and covers scroll buttons', async () => {
    // SelectContent must be inside SelectRoot
    const ContentNode = () =>
      h(SelectContent, null, {
        default: () => h('div', 'Content')
      });

    const RootNode = () => h(SelectRoot, { open: true }, { default: ContentNode });

    const Wrapper = {
      setup() {
        return RootNode;
      }
    };

    render(Wrapper);
    expect(await screen.findByText('Content')).toBeInTheDocument();
  });
});
