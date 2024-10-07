import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { AppDispatch } from "../store.ts";
import {
  getRequest,
  postRequest,
  patchRequest,
  deleteRequest,
} from "../../utils/fetch.ts";
import {
  CartType,
  ProductType,
} from "../../utils/type.ts";

interface CartState {
  cart: CartType | null;
  totalQuantity: number,
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  cart: null,
  totalQuantity: 0,
  loading: false,
  error: null,
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    fetchCartStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchCartSuccess(state, action: PayloadAction<CartType>) {
      state.cart = action.payload;
      state.totalQuantity = action.payload.items.reduce((total, item) => total + item.quantity, 0); 
      state.cart.totalPrice = action.payload.items.reduce((total, item) => total + item.product.price * item.quantity, 0); 
      state.loading = false;
    },
    fetchCartFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    updateCart(state, action: PayloadAction<CartType>) {
      state.cart = action.payload;
      state.totalQuantity = action.payload.items.reduce((total, item) => total + item.quantity, 0); 
      state.cart.totalPrice = action.payload.items.reduce((total, item) => total + item.product.price * item.quantity, 0); 
    },
  },
});

export const {
  fetchCartStart,
  fetchCartSuccess,
  fetchCartFailure,
  updateCart,
} = cartSlice.actions;

export const fetchCart = () => async (dispatch: AppDispatch) => {
  dispatch(fetchCartStart());
  try {
    const res: CartType = await getRequest<CartType>("/api/carts");
    dispatch(fetchCartSuccess(res));
    return res;
  } catch (e) {
    const msg: string = e as string;
    dispatch(fetchCartFailure(msg));
  }
};

export const addOneToCart =
  (product: ProductType) =>
  async (dispatch: AppDispatch, getState: () => { cart: CartState }) => {
    try {
      const state = getState();
      const Cart = state.cart.cart;

      const data = {
        product: product,
        quantity: 1,
      };
      if (Cart) {
        const cartAddUrl = `/api/carts/${product._id}`;
        const newCartData: CartType = await postRequest(cartAddUrl, data);
        dispatch(updateCart(newCartData));

      }
    } catch (e) {
      const msg: string = e as string;
      throw new Error(msg);
    }
  };

export const updateOneToCart =
  (productId: string, quantity: number) =>
  async (dispatch: AppDispatch, getState: () => { cart: CartState }) => {
    try {
      const state = getState();
      const Cart = state.cart.cart;

      const data = {
        quantity: quantity,
      };
      if (Cart) {
        const cartUpdateUrl = `/api/carts/${productId}`;
        const newCartData: CartType = await patchRequest(cartUpdateUrl, data);
        dispatch(updateCart(newCartData));
      }
    } catch (e) {
      const msg: string = e as string;
      throw new Error(msg);
    }
  };

export const deleteOneFromCart =
  (productId: string) =>
  async (dispatch: AppDispatch, getState: () => { cart: CartState }) => {
    try {
      const state = getState();
      const Cart = state.cart.cart;

      if (Cart) {
        const cartDelUrl = `/api/carts/${productId}`;
        const newCartData: CartType = await deleteRequest(cartDelUrl);
        dispatch(updateCart(newCartData));
      }
    } catch (e) {
      const msg: string = e as string;
      throw new Error(msg);
    }
  };

export default cartSlice.reducer;