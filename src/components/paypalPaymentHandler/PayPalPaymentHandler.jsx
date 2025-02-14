import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import "./payment-handler.css";
import Lottie from 'lottie-react';
import { toast } from "react-toastify";
import animate1 from '../../utils/order_placed_back_animation.json';
import animate2 from '../../utils/order_success_tick_animation.json';
import NoOrderSVG from "../../utils/zero-state-screens/No_Orders.svg";
import api from '../../api/api';
import { setCart, setCartCheckout, setCartProducts, setCartSubTotal } from '../../model/reducer/cartReducer';
import { useDispatch, useSelector } from 'react-redux';

const PayPalPaymentHandler = () => {

    const location = useLocation();
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const user = useSelector(state => state?.user);
    const queryParams = new URLSearchParams(location.search);
    const queryParamsObj = {};
    for (const [key, value] of queryParams.entries()) {
        queryParamsObj[key] = value;
    }
    const [isOrderPayment, setIsOrderPayment] = useState(false);
    const [timer, setTimer] = useState(5);
    const interval = useRef();
    const timeout = useRef();

    useEffect(() => {
        let intervalId;
        if (queryParamsObj.type == "wallet") {
            if (queryParamsObj.status == "failed") {
                toast.error("Payment failed");
            } else if (queryParamsObj.status == "PAYMENT_SUCCESS" || queryParamsObj.status == "success" || queryParamsObj.status_code == 200) {
                intervalId = setInterval(() => {
                    window.opener.postMessage("Recharge Done", process.env.REACT_APP_BASE_URL);
                }, 1000);
            } else if (queryParamsObj.status == "") {
                toast.error("Something went wrong");
            }
        } else {
            const orderId = queryParamsObj?.payment_method == "Paytabs" ? queryParamsObj?.order_id : queryParamsObj?.order_id?.split("-")[1]
            if (queryParamsObj.status == "failed") {
                toast.error("Payment failed");
                api.deleteOrder(user?.jwtToken, orderId).then((res) => (res.json()).then((result) => {
                })).catch((err) => {
                    console.log("Error", err)
                })
            } else if (queryParamsObj.status == "") {
                api.deleteOrder(user?.jwtToken, orderId).then((res) => (res.json()).then((result) => {
                })).catch((err) => {
                    console.log("Error", err)
                })
                toast.error("Something went wrong");
            } else if (queryParamsObj.status_code = 201 && queryParamsObj.action == "back") {
                toast.error("payment cancelled");
                api.deleteOrder(user?.jwtToken, orderId).then((res) => (res.json()).then((result) => {

                })).catch((err) => {
                    console.log("Error", err)
                })
            }
            else {
                setIsOrderPayment(true);
                try {
                    api.removeCart(user?.jwtToken).then((res) => res.json()).then((result) => {
                        if (result?.status === 1) {
                            dispatch(setCart({ data: null }));
                            dispatch(setCartCheckout({ data: null }));
                            dispatch(setCartProducts({ data: [] }));
                            dispatch(setCartSubTotal({ data: 0 }));
                        }
                    });
                } catch (err) {
                    console.log(err.message);
                }
            }
        }
        interval.current = setInterval(() => {
            setTimer(prev => prev - 1);
        }, 1000);
        timeout.current = setTimeout(() => {
            setIsOrderPayment(false);
            navigate("/");
        }, 6000);
        return () => {
            clearInterval(interval.current);
            clearTimeout(timeout);
            clearInterval(intervalId);
        };

    }, []);

    if (queryParams.size === 0) {
        return (
            <div className='container d-flex flex-column align-items-center mt-5 payment-container'>
                <img src={NoOrderSVG} alt="noOrderSVG" />
            </div>
        );
    }

    const handleNavigate = () => {
        navigate("/");
    };

    return (
        <>
            {isOrderPayment ? <div className='container d-flex flex-column align-items-center mt-5 payment-container' >
                <Lottie animationData={animate2} loop={false} className='lottie-tick'></Lottie>
                <Lottie className='lottie-content' animationData={animate1} loop={true}></Lottie>
                <div className='text-center'>
                    <p className='order-success-desc'>{t("order_placed_description")}</p>
                </div>
                <button onClick={handleNavigate} className='checkout_btn'>
                    {t("go_to_home")}
                </button>
            </div>
                : null}
        </>
    );
};

export default PayPalPaymentHandler;