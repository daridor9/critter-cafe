import { useState } from 'react'
import { Splash } from './components/Splash'
import { KitchenScene } from './components/KitchenScene'

type Scene = 'splash' | 'kitchen'

function App() {
  const [scene, setScene] = useState<Scene>('splash')

  if (scene === 'splash') {
    return <Splash onEnter={() => setScene('kitchen')} />
  }

  return <KitchenScene onExit={() => setScene('splash')} />
}

export default App
