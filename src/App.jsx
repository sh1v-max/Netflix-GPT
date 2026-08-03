import { Provider } from 'react-redux'
import { TooltipProvider } from '@/components/ui/tooltip'
import Body from './components/Body'
import appStore from './store/appStore'

function App() {
  return (
    <Provider store={appStore}>
      <TooltipProvider delayDuration={200}>
        <Body />
      </TooltipProvider>
    </Provider>
  )
}

export default App
