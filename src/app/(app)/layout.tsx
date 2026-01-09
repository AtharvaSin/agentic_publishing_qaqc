import { AppShell } from '@/components/layout';
import { FilterProvider } from '@/contexts/FilterContext';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <FilterProvider>
      <AppShell>{children}</AppShell>
    </FilterProvider>
  );
}
