import { useParams } from "react-router-dom";
import { useGlobal } from "../hooks/useGlobal.tsx";
import {
  getRequest,
  putRequest,
  postRequest,
  deleteRequest,
} from "../utils/fetch.ts";
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../app/hooks.ts";
import { useEffect, useCallback, useState } from "react";
import { fetchCart, updateOneToCart, addOneToCart, deleteOneFromCart } from "../app/slice/cart.ts";
import { ProductType, CartItemType } from "../utils/type.ts";

interface ProductCartType {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  quantity: number;
  image: string;
  owner: string;
  createdAt: string;
  cartQuantity?: number;
}

interface ProductShortType {
  product: string;
  quantity: number;
  _id: string;
}

interface CartType {
  _id: string;
  items: [ProductShortType];
  total: number;
  createdAt: string;
}

const ProductDetail = () => {
  const { showLoading, showMessage } = useGlobal();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const cart = useAppSelector((state) => state.cart.cart);
  const [product, setProduct] = useState<ProductType | null>(null);
  const [cartQuantity, setCartQuantity] = useState(0);

  const id = useParams().id || "";

  const getProduct = useCallback(async () => {
    try {
      const productUrl = `/api/products/${id}`;
      const productdata = await getRequest<ProductType>(productUrl);
      if (!productdata) {
        navigate("/products");
      }
      if (user.role === "Vendor" && productdata.owner === user.id) {
        setProduct(productdata);
      } else if (user.role === "Customer") {
        // check if product is in cart
        const isInCart = cart?.items.find(
          (p: CartItemType) => p.product._id === id
        );
        setProduct(productdata);
        if (isInCart) {
          setCartQuantity(isInCart.quantity);
        }
      }
    } catch (e) {
      console.log(e);
      navigate("/products");
    }
  }, [id, user, cart]);

  useEffect(() => {
    showLoading(true);
    if (cart !== null) {
      getProduct();
    }
    showLoading(false);
  }, [cart, getProduct]);


  const editProduct = (id: string = "") => {
    navigate(`/products/edit/${id}`);
  };

  // const addToCart = async () => {
  //   try {
  //     const cartUpdateUrl = `/api/carts/${user.id}/products/${product?._id}`;
  //     const cartUrl = `/api/carts/${user.id}`;
  //     const cartdata = await getRequest<CartType>(cartUrl);
  //     const isInCart = cartdata.items.find(
  //       (p: ProductShortType) => p.product === id
  //     );
  //     if (isInCart) {
  //       const data = {
  //         quantity: isInCart.quantity + 1,
  //       };
  //       await putRequest(cartUpdateUrl, data).then(() => {
  //         getProduct();
  //       });
  //     } else {
  //       const data = {
  //         product: product?._id,
  //         quantity: 1,
  //       };
  //       await postRequest(cartUpdateUrl, data).then(() => {
  //         getProduct();
  //       });
  //     }
  //   } catch (e) {
  //     console.log(e);
  //   }
  // };

  const addToCart = async () => {
    try {
      if (!product) return;
      const isInCart = cart?.items.find(
        (p: CartItemType) => p.product._id === id
      );
      if (isInCart) {
        dispatch(updateOneToCart(id, isInCart.quantity + 1))
      } else {
        if (product) {
          dispatch(addOneToCart(product))
          setCartQuantity(1);
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  const reduceFromCart = async () => {
    try {
      const isInCart = cart?.items.find(
        (p: CartItemType) => p.product._id === id
      );
      console.log(isInCart);
      if (isInCart) {
        if (isInCart.quantity === 1) {
          dispatch(deleteOneFromCart(id))
          setCartQuantity(0);
        } else {
          dispatch(updateOneToCart(id, isInCart.quantity - 1))
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleCartQuantityInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value < 0) {
      setCartQuantity(0);
    } else {
      setCartQuantity(value);
    }
  };

  const handleInputSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (cartQuantity === 0) {
        dispatch(deleteOneFromCart(id))
      } else {
        dispatch(updateOneToCart(id, cartQuantity));
      }
    }
  };

  return (
    <div className="w-full h-full px-5 md:px-16 md:py-16 items-center flex flex-col">
      <div className="w-full md:max-w-7xl my-5 text-center md:text-left">
        <h1 className="text-2xl md:text-4xl font-bold text-black-common">
          Product detail
        </h1>
      </div>
      {/* <h1 className="text-2xl md:text-4xl font-bold text-black-common my-5 text-center md:text-left">Product detail</h1> */}
      <div className="w-full h-full md:h-[calc(100%-4rem)] bg-white rounded-lg p-5 md:p-10 flex flex-col md:flex-row md:max-w-7xl">
        <div className="w-full h-full flex justify-center items-center">
          <img
            src={product?.image}
            alt="product"
            className="w-full md:max-h-[calc(100%-4rem)] object-contain"
          />
        </div>
        <div className="w-full h-full flex flex-col justify-center md:justify-start items-left md:items-start md:mx-8 md:pt-5">
          <p className="text-sm md:text-base text-gray-details font-normal mt-2">
            Category: {product?.category}
          </p>
          <h2 className="text-xl md:text-4xl font-bold text-gray-text my-1 md:my-2">
            {product?.name}
          </h2>
          <div className="flex items-center my-1 md:my-4">
            <p className="text-xl md:text-[32px]/[44px] font-bold text-black-common align-text-top">
              ${product?.price}
            </p>
            <div className={`flex items-center mx-4 bg-${product?.quantity===0?'[#EA3D2F]/[13%]':'[#03d833]/[13%]' } rounded-md h-[30px]`}>
            {product?.quantity === 0 ? (
              <p className="text-[10px]/[13.75px] text-red-500 font-bold mx-4">
                Out of stock
              </p>
            ) : (
              <p className="text-[10px]/[13.75px] text-green-500 font-bold mx-4">
                {product?.quantity} in stock
              </p>
            )}
            </div>
          </div>
          {/* <p className="text-xl md:text-4xl font-bold text-black-common my-1 md:my-4">
            ${product?.price}
          </p> */}
          <p className="text-xs md:text-base text-gray-details font-normal mt-4 md:mt-2">
            {product?.description}
          </p>
          {user.role === "Customer" ? (
            product && cartQuantity === 0 ? (
              <button
                className="bg-blue text-white rounded-md text-sm font-semibold py-2 px-5 ml-2 md:ml-0 mt-4 md:mt-8"
                onClick={addToCart}
              >
                Add Product
              </button>
            ) : (
              // control buttons for cart quantity, subtract (remove if 0), input number, add
              <div className="flex mt-4 md:mt-8 w-full items-center justify-center md:justify-start">
                <button
                  className="bg-blue text-white rounded-s-md text-sm font-bold py-2 px-5 ml-2 md:ml-0"
                  onClick={reduceFromCart}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <input
                  type="number"
                  value={cartQuantity}
                  onChange={handleCartQuantityInput}
                  onKeyPress={(e) => {
                    handleInputSubmit(e);
                  }}
                  className="bg-blue text-white text-sm py-2 w-10 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:outline-none"
                />
                <button
                  className="bg-blue text-white rounded-e-md text-sm font-bold py-2 px-5"
                  onClick={addToCart}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            )
          ) : (
            <button
              onClick={() => {
                editProduct(product?._id);
              }}
              className="bg-white text-black-common rounded
                      text-xs font-semibold py-1.5 w-5.9/12 border border-gray-border"
            >
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
