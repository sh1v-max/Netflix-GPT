import { Provider } from 'react-redux'
import { MotionConfig } from 'motion/react'
import { TooltipProvider } from '@/components/ui/tooltip'
import Body from './components/Body'
import appStore from './store/appStore'

function App() {
  return (
    <Provider store={appStore}>
      {/* reducedMotion="user" makes every motion.* component in the tree
          respect prefers-reduced-motion automatically — no need to thread
          useReducedMotion() into each component individually. */}
      <MotionConfig reducedMotion="user">
        <TooltipProvider delayDuration={200}>
          <Body />
        </TooltipProvider>
      </MotionConfig>
    </Provider>
  )
}

export default App
