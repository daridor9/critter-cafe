import { useState } from 'react'
import { Splash } from './components/Splash'
import { About } from './components/About'
import { KitchenScene } from './components/KitchenScene'

type Scene = 'splash' | 'kitchen' | 'about'

function App() {
  const [scene, setScene] = useState<Scene>('splash')

  if (scene === 'splash') {
    return <Splash onEnter={() => setScene('kitchen')} onAbout={() => setScene('about')} />
  }

  if (scene === 'about') {
    return <About onBack={() => setScene('splash')} />
  }

  return <KitchenScene onExit={() => setScene('splash')} />
}

export default App
