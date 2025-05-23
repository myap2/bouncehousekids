import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import bounceHouseReducer from './slices/bounceHouseSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    bounceHouses: bounceHouseReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 