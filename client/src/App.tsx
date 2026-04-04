import { AppProvider, useApp } from './hooks/useAppStore'
import { useToast } from './hooks/useToast'
import Header from './components/Header'
import ProgressStrip from './components/ProgressStrip'
import ToastContainer from './components/Toast'
import LoginScreen from './screens/LoginScreen'
import SelectScreen from './screens/SelectScreen'
import AdminScreen from './screens/admin'
import ProvaRecuperacao from './screens/recuperacao/ProvaRecuperacao'
import DesafioPresenca from './screens/presenca/DesafioPresenca'
import StudyGuideScreen from './screens/study/StudyGuideScreen'

function Inner() {
  const { state } = useApp()
  const { toast, toasts } = useToast()

  return (
    <div className="min-h-screen bg-bg text-text">
      <Header />
      <ProgressStrip />

      <main className="mx-auto w-full max-w-[1440px]">
        {state.screen === 'login' && <LoginScreen />}
        {state.screen === 'select' && <SelectScreen />}
        {state.screen === 'admin' && <AdminScreen onToast={toast} />}
        {state.screen === 'recuperacao' && <ProvaRecuperacao />}
        {state.screen === 'presenca' && <DesafioPresenca />}
        {state.screen === 'roteiro' && <StudyGuideScreen />}
      </main>

      <ToastContainer toasts={toasts} />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Inner />
    </AppProvider>
  )
}
