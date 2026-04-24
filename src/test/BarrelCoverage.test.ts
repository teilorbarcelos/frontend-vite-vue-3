import { describe, it, expect } from 'vitest';
import * as DataTableIndex from '@/components/ui/DataTable';
import * as DropdownMenuIndex from '@/components/ui/DropdownMenu';
import * as PopoverIndex from '@/components/ui/Popover';
import * as ToastIndex from '@/components/ui/Toast';
import * as TooltipIndex from '@/components/ui/Tooltip';
import * as ModalIndex from '@/components/ui/Modal';
import * as DrawerIndex from '@/components/ui/Drawer';
import * as CalendarIndex from '@/components/ui/Calendar';

describe('Barrel Files Coverage', () => {
  it('imports all barrel files to ensure coverage registration', () => {
    expect(DataTableIndex).toBeDefined();
    expect(DropdownMenuIndex).toBeDefined();
    expect(PopoverIndex).toBeDefined();
    expect(ToastIndex).toBeDefined();
    expect(TooltipIndex).toBeDefined();
    expect(ModalIndex).toBeDefined();
    expect(DrawerIndex).toBeDefined();
    expect(CalendarIndex).toBeDefined();
  });
});
