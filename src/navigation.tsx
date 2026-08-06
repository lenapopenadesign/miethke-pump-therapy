import { createContext, useContext } from 'react';

export type ScreenId =
  | 'home-no-therapy'
  | 'add-medication'
  | 'base-dose'
  | 'frequency'
  | 'windows'
  | 'intervals-empty'
  | 'add-interval-when'
  | 'add-interval-dose'
  | 'intervals-populated'
  | 'regular-therapy'
  | 'review'
  | 'activate'
  | 'home-active'
  | 'help'
  | 'patient-detail'
  | 'implant-detail'
  | 'therapy-detail'
  | 'actions'
  | 'refill-filling'
  | 'refill-same-therapy'
  | 'refill-date'
  | 'notifications';

const NavContext = createContext<(to: ScreenId) => void>(() => {});

export const NavProvider = NavContext.Provider;
export const useNavigate = () => useContext(NavContext);
