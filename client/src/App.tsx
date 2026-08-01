import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import FadeContent from '@/components/FadeContent'
import { GlobalStats } from '@/components/Panel/GlobalStats'
import { Dashboard } from '@/components/Panel/Dashboard'
import { RoomStrip } from '@/components/Panel/RoomStrip'
import { House } from '@/components/Scene/House'
import { useMqtt } from '@/hooks/useMqtt'
import { useSensorBootstrap } from '@/hooks/useSensorBootstrap'
import { useWebSocket } from '@/hooks/useWebSocket'

function App() {
  const [activeRoom, setActiveRoom] = useState('')
  const _ = useMqtt(); void _
  useSensorBootstrap()
  useWebSocket()

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden relative">
      <main className="flex-grow relative z-10 flex items-center justify-center pointer-events-none">
        <div className="w-full h-full bg-[linear-gradient(rgba(137,114,109,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(137,114,109,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

        <FadeContent
          blur
          duration={800}
          threshold={0}
          initialOpacity={0}
          className="absolute top-6 left-6 pointer-events-auto"
        >
          <GlobalStats />
        </FadeContent>

        <AnimatePresence>
          {activeRoom && (
            <motion.div
              key={activeRoom}
              initial={{ opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 28 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="absolute top-6 right-6 pointer-events-auto"
            >
              <Dashboard roomId={activeRoom} onClose={() => setActiveRoom('')} />
            </motion.div>
          )}
        </AnimatePresence>

        <FadeContent
          blur
          duration={800}
          delay={200}
          threshold={0}
          initialOpacity={0}
          className="absolute bottom-10 left-0 w-full px-6 pointer-events-auto"
        >
          <RoomStrip activeRoom={activeRoom} onRoomSelect={setActiveRoom} />
        </FadeContent>
      </main>

      <House activeRoom={activeRoom} onRoomSelect={setActiveRoom} />
    </div>
  )
}

export default App
