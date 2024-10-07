import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import type { AppDispatch } from '../store.ts';
import { getRequest, postRequest, putRequest, deleteRequest } from "../../utils/fetch.ts";
import { ProductStateType, ProductType, ProductQueryType } from '../../utils/type.ts';

export const getProducts = createAsyncThunk(
  'product/getProducts',
  async ({pageSize, sortField, sortOrder, page}: ProductQueryType) => {
    try {
      const res: ProductStateType = await getRequest(
        `/api/products?pageSize=${pageSize}&sortField=${sortField}&sortOrder=${sortOrder}&page=${page}`
      ) as ProductStateType;
      console.log(res);
      return res;
    } catch (e) {
      const msg: string = e as string;
      throw new Error(msg);
    }
  }
);


const productSlice = createSlice({
  name: 'product',
  initialState: {
    data: [],
    page: 1,
    pageSize: 10,
    pages: 1,
    total: 0,
    error: '',
    loading: false
  } as ProductStateType,
  reducers: {
    // updateProducts: (state, action: PayloadAction<ProductStateType>) => {
    //   state.products = action.payload.products;
    //   state.total = action.payload.total;
    // },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProducts.fulfilled, (state, action: PayloadAction<ProductStateType>) => {
        state.loading = false;
        state.data = action.payload.data;
        state.total = action.payload.total;
        state.pages = Math.ceil(action.payload.total / state.pageSize);
      })
      .addCase(getProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '';
      });
  }
});

// export const { updateProducts } = productSlice.actions;
export default productSlice.reducer;

