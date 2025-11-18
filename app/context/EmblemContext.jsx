import React, { createContext, useState } from 'react'
import defaultTeamIcon from '@/assets/images/club.png'

export const EmblemContext = createContext()

export const EmblemProvider = ({ children }) => {
  const [localEmblem, setLocalEmblem] = useState(defaultTeamIcon)
  const [visitorEmblem, setVisitorEmblem] = useState(defaultTeamIcon)

  const resetEmblems = () => {
    setLocalEmblem(defaultTeamIcon)
    setVisitorEmblem(defaultTeamIcon)
  }

  return (
    <EmblemContext.Provider value={{
      localEmblem,
      visitorEmblem,
      setLocalEmblem,
      setVisitorEmblem,
      resetEmblems
    }}>
      {children}
    </EmblemContext.Provider>
  )
}