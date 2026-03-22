'use client';

import React, { createContext, useContext, useState } from 'react';

const EffectContext = createContext({
  grain: true, setGrain: (v: boolean) => {},
  spotlight: true, setSpotlight: (v: boolean) => {},
});

export const EffectProvider = ({ children }: { children: React.ReactNode }) => {
  const [grain, setGrain] = useState(false);
  const [spotlight, setSpotlight] = useState(false);

  return (
    <EffectContext.Provider value={{ grain, setGrain, spotlight, setSpotlight }}>
      {children}
    </EffectContext.Provider>
  );
};

export const useEffects = () => useContext(EffectContext);