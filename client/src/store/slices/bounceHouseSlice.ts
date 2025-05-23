import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { BounceHouseState, BounceHouse } from '../../types';
import { bounceHouseAPI } from '../../services/api';

const initialState: BounceHouseState = {
  items: [],
  selectedItem: null,
  loading: false,
  error: null
};

export const fetchBounceHouses = createAsyncThunk(
  'bounceHouses/fetchAll',
  async (params: {
    theme?: string;
    minCapacity?: number;
    maxPrice?: number;
    startDate?: string;
    endDate?: string;
  } = {}, { rejectWithValue }) => {
    try {
      const response = await bounceHouseAPI.getAll(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch bounce houses');
    }
  }
);

export const fetchBounceHouseById = createAsyncThunk(
  'bounceHouses/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await bounceHouseAPI.getById(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch bounce house');
    }
  }
);

export const createBounceHouse = createAsyncThunk(
  'bounceHouses/create',
  async (bounceHouseData: Partial<BounceHouse>, { rejectWithValue }) => {
    try {
      const response = await bounceHouseAPI.create(bounceHouseData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create bounce house');
    }
  }
);

export const updateBounceHouse = createAsyncThunk(
  'bounceHouses/update',
  async ({ id, data }: { id: string; data: Partial<BounceHouse> }, { rejectWithValue }) => {
    try {
      const response = await bounceHouseAPI.update(id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update bounce house');
    }
  }
);

export const deleteBounceHouse = createAsyncThunk(
  'bounceHouses/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await bounceHouseAPI.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete bounce house');
    }
  }
);

export const addReview = createAsyncThunk(
  'bounceHouses/addReview',
  async ({ id, reviewData }: { id: string; reviewData: { rating: number; comment: string } }, { rejectWithValue }) => {
    try {
      const response = await bounceHouseAPI.addReview(id, reviewData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add review');
    }
  }
);

const bounceHouseSlice = createSlice({
  name: 'bounceHouses',
  initialState,
  reducers: {
    clearSelectedItem: (state) => {
      state.selectedItem = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchBounceHouses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBounceHouses.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchBounceHouses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch By Id
      .addCase(fetchBounceHouseById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBounceHouseById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedItem = action.payload;
      })
      .addCase(fetchBounceHouseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create
      .addCase(createBounceHouse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBounceHouse.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createBounceHouse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update
      .addCase(updateBounceHouse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBounceHouse.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedItem?.id === action.payload.id) {
          state.selectedItem = action.payload;
        }
      })
      .addCase(updateBounceHouse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete
      .addCase(deleteBounceHouse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBounceHouse.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(item => item.id !== action.payload);
        if (state.selectedItem?.id === action.payload) {
          state.selectedItem = null;
        }
      })
      .addCase(deleteBounceHouse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add Review
      .addCase(addReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addReview.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedItem?.id === action.payload.id) {
          state.selectedItem = action.payload;
        }
      })
      .addCase(addReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearSelectedItem, clearError } = bounceHouseSlice.actions;
export default bounceHouseSlice.reducer; 