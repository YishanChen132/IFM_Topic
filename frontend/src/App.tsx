import {AppRouter} from '@/router/AppRouter';
import {CrmStoreProvider} from '@/store/crmStore';

export default function App() {
  return (
    <CrmStoreProvider>
      <AppRouter />
    </CrmStoreProvider>
  );
}
