import React, { useState, useRef, useEffect } from 'react';
import './login.css';
import api from '../../api/api';
import * as newApi from "../../api/apiCollection"
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Loader from '../loader/Loader';
import 'react-phone-input-2/lib/style.css';
import OTPInput from 'otp-input-react';
import { signInWithPhoneNumber, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import FirebaseData from '../../utils/firebase/FirebaseData';
import PhoneInput from 'react-phone-input-2';
import { setAuthId, setCurrentUser, setFcmToken, setAuthType } from '../../model/reducer/authReducer';
import { setTokenThunk } from '../../model/thunk/loginThunk';
import { Modal } from 'react-bootstrap';
import { setSetting } from '../../model/reducer/settingReducer';
import { setFavouriteLength, setFavouriteProductIds } from '../../model/reducer/favouriteReducer';
import { addtoGuestCart, setCart, setCartProducts, setCartSubTotal, setGuestCartTotal, setIsGuest } from '../../model/reducer/cartReducer';
import NewUserModal from '../newusermodal/NewUserModal';
import { IoCloseSharp } from "react-icons/io5";
import GoogleLogo from "../../utils/google-color-icon.svg"
import Register from '../register/Register';
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import ForgetPasswordModal from '../forgetPassword/ForgetPasswordModal';

const Login = React.memo((props) => {
    const Navigate = useNavigate();
    const closeModalRef = useRef();
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const inputRef = useRef(null);

    const isDemoMode = process.env.REACT_APP_DEMO_MODE
    const countryDialCode = process.env.REACT_APP_COUNTRY_DIAL_CODE
    const phoneNumber = process.env.REACT_APP_DEMO_LOGIN_NO
    const demoOTP = process.env.REACT_APP_DEMO_OTP
    const defaultCountryCode = process.env.REACT_APP_DEFAULT_COUNTRY_CODE || "in"

    const { auth, firebase, messaging } = FirebaseData();
    const setting = useSelector(state => (state.setting));
    const city = useSelector(state => state.city);
    const user = useSelector(state => state.user);
    const cart = useSelector(state => state.cart);

    const [fcm, setFcm] = useState('');
    const [registerModalShow, setRegisterModalShow] = useState(false);
    const [userEmail, setUserEmail] = useState("")
    const [userName, setUserName] = useState("")
    const [userAuthType, setUserAuthType] = useState("")
    const [phoneNumberWithoutCountryCode, setPhoneNumberWithoutCountryCode] = useState(isDemoMode === "true" ? `${phoneNumber.trim()}` : "")
    const [phonenum, setPhonenum] = useState(""
    );
    const [email, setEmail] = useState("");
    const [countryCode, setCountryCode] = useState("");
    const [checkboxSelected, setcheckboxSelected] = useState(false);
    const [error, setError] = useState("");
    const [isOTP, setIsOTP] = useState(false);
    const [Uid, setUid] = useState("");
    const [OTP, setOTP] = useState(isDemoMode == "true" ? demoOTP : "");
    const [isLoading, setisLoading] = useState(false);
    const [timer, setTimer] = useState(null);
    const [disabled, setDisabled] = useState(true);
    const [inputType, setInputType] = useState("number")
    const [inputValue, setInputValue] = useState("")
    const [password, setPassword] = useState("")
    const [showRegister, setShowRegister] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showForgetPassword, setShowForgetPassword] = useState(false)


    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [inputType]);


    useEffect(() => {
        if (error !== "") {
            const timer = setTimeout(() => {
                setError("");
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);
    useEffect(() => {
        const initializeFirebaseMessaging = async () => {
            if (setting?.setting && messaging) {
                try {
                    const permission = await Notification.requestPermission();
                    if (permission === "granted") {
                        const currentToken = await messaging.getToken();
                        if (currentToken) {
                            setFcm(currentToken);
                            if (user?.fcm_token === null || currentToken != user?.fcm_token) {
                                dispatch(setFcmToken({ data: currentToken }));
                            }
                        } else {
                            // console.log("No registration token available");
                        }
                    } else {
                        setFcm("");
                        // console.log("Notification permission denied");
                    }
                } catch (error) {
                    console.log("An error occurred:", error);
                }
            }
        };

        if (setting.setting?.firebase) {

            initializeFirebaseMessaging();
        }
    }, [setting]);
    useEffect(() => {
        if (props.show == true) {
            setPhonenum(isDemoMode == "true" ? `${countryDialCode} ${phoneNumber}` : "");
            if (isDemoMode == "true") {
                setInputType("number");
                setInputValue("+919876543210");
                setPhonenum("+919876543210");
                setPhoneNumberWithoutCountryCode("9876543210")
                setCountryCode(defaultCountryCode);
                dispatch(setAuthType("email"))
            } else {
                setInputType("")
            }
            setOTP(isDemoMode == "true" ? demoOTP : "");
            setUserAuthType("")
            setEmail("")
            setPassword("")
            setInputValue("")

        }
    }, [props.show]);
    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prevTimer) => prevTimer - 1);
            }, 1000);
        } else if (timer === 0) {
            setDisabled(false);
        }

        return () => clearInterval(interval);

    }, [timer]);
    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };
    useEffect(() => {
        const recaptchaContainer = document.getElementById('recaptcha-container');
        firebase && auth && !(window.recaptchaVerifier) && (window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(recaptchaContainer, {
            size: "invisible",
        }));
        return () => {
            if (window?.recaptchaVerifier && setting.setting.firebase) {
                try {
                    window?.recaptchaVerifier?.clear();
                } catch (err) {
                    console.log(err?.message);
                }
            }
        };
    }, [firebase, auth]);


    const handlePasswordShow = () => {
        setShowPassword(!showPassword)
    }
    const handleLogin = async (e) => {
        setDisabled(true);
        setisLoading(true);
        e.preventDefault();
        if (phonenum?.length < countryCode.length || phonenum?.slice(1) === countryCode) {
            setError("Please enter phone number!");
            setisLoading(false);
        }
        else {
            const phoneNumberWithoutSpaces = `${phonenum}`.replace(/\s+/g, "");
            if (setting?.setting?.firebase_authentication == 1) {
                let appVerifier = window?.recaptchaVerifier;
                try {
                    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumberWithoutSpaces, appVerifier)
                    window.confirmationResult = confirmationResult;
                    setTimer(90)
                    setIsOTP(true)
                    setisLoading(false)
                } catch (error) {
                    setPhonenum();
                    setError(error.message);
                    setisLoading(false);
                }
            } else if (setting?.setting?.custom_sms_gateway_otp_based == 1) {
                try {
                    const res = await newApi.sendSms({ mobile: phoneNumberWithoutSpaces })
                    if (res?.status == 1) {
                        setTimer(90)
                        setIsOTP(true)
                        setisLoading(false)
                    } else {
                        setError(t("custom_send_sms_error_message"));
                        setisLoading(false)
                    }

                } catch (error) {
                    setPhonenum();
                    setError(t("custom_send_sms_error_message"));
                    setisLoading(false)
                }
            } else {
                toast.error(t("Something went wrong"))
            }

        }
    };
    const getCurrentUser = async () => {
        try {
            const response = await newApi.getUser()
            dispatch(setCurrentUser({ data: response.user }));
            toast.success("You're successfully Logged In");
        } catch (error) {
            console.log("error", error)
        }
    };
    const fetchCart = async (latitude, longitude) => {
        try {
            const response = await newApi.getCart({ latitude: latitude, longitude: longitude })
            if (response.status === 1) {
                dispatch(setCart({ data: response.data }))
                const productsData = getProductData(response.data)
                dispatch(setCartProducts({ data: productsData }));
                dispatch(setCartSubTotal({ data: response?.data?.sub_total }))
            } else {
                dispatch(setCart({ data: null }));
            }
        } catch (error) {
            console.log("error", error)
        }
    }
    const getProductData = (cartData) => {
        const cartProducts = cartData?.cart?.map((product) => {
            return {
                product_id: product?.product_id,
                product_variant_id: product?.product_variant_id,
                qty: product?.qty
            }
        })
        return cartProducts;
    }
    const verifyOTP = async (e) => {
        let latitude;
        let longitude;
        e.preventDefault();
        const phoneNumberWithoutSpaces = `${phonenum}`.replace(/\s+/g, "");

        if (setting?.setting?.firebase_authentication == 1) {
            try {
                setisLoading(true);
                let confirmationResult = window.confirmationResult;
                const OTPResult = await confirmationResult.confirm(OTP)
                setUid(OTPResult.user.id)
                dispatch(setAuthId({ data: OTPResult.user.id }));
                const loginResponse = await loginApiCall(OTPResult.user, phoneNumberWithoutCountryCode, fcm, "phone")
            } catch (error) {
                setisLoading(false);
                setOTP("");
                setError("Invalid Code");
            }
        } else if (setting?.setting?.custom_sms_gateway_otp_based == 1) {
            const mobileNo = phonenum?.split(" ")?.[1]
            try {
                setisLoading(true);
                const res = await newApi.verifyOTP({ mobile: phoneNumberWithoutCountryCode, otp: OTP, country_code: `+${countryCode}` })
                if (res.status === 1 && res?.message == "OTP is valid, but no user found with this phone number.") {
                    dispatch(setAuthType({ data: "phone" }))
                    setRegisterModalShow(true)
                    props.setShow(false);
                    setPhonenum(mobileNo)
                    setUserAuthType("phone")
                    setUserEmail("")
                    setUserName("")
                } else if (res.status === 1) {
                    const tokenSet = await dispatch(setTokenThunk(res?.data?.access_token))
                    await getCurrentUser()
                    dispatch(setAuthType({ data: "phone" }))
                    if (res?.data?.user?.status == 1) {
                        dispatch(setIsGuest({ data: false }));
                        dispatch(setGuestCartTotal({ data: 0 }));
                        dispatch(addtoGuestCart({ data: [] }))
                    }
                    await handleFetchSetting();
                    latitude = city?.city?.latitude || setting?.setting?.default_city?.latitude
                    longitude = city?.city?.longitude || setting?.setting?.default_city?.longitude
                    if (cart?.isGuest === true && cart?.guestCart?.length !== 0 && res?.data?.user?.status == 1) {
                        await AddtoCartBulk(res?.data.access_token);
                    }
                    await fetchCart(latitude, longitude);
                    setError("");
                    setOTP("");
                    setPhonenum("");
                    setisLoading(false);
                    setIsOTP(false);
                    props.setShow(false);
                } else {
                    setisLoading(false);
                    setOTP("");
                    setError("Invalid Code");

                }
            } catch (error) {
                setisLoading(false);
                setOTP("");
                setError("Invalid Code");
            }
        }

    }
    const AddtoCartBulk = async (token) => {
        try {
            const variantIds = cart?.guestCart?.map((p) => p.product_variant_id);
            const quantities = cart?.guestCart?.map((p) => p.qty);
            const response = await api.bulkAddToCart(token, variantIds.join(","), quantities.join(","));
            const result = await response.json();
            if (result.status == 1) {
                dispatch(setGuestCartTotal({ data: 0 }));
                dispatch(addtoGuestCart({ data: [] }))
            } else {
                console.log("Add to Bulk Cart Error Occurred");
            }
        } catch (e) {
            console.log(e?.message);
        }
    };
    const handleFetchSetting = async () => {
        const setting = await newApi.getSetting()
        dispatch(setSetting({ data: setting?.data }));
        dispatch(setFavouriteLength({ data: setting?.data?.favorite_product_ids?.length }));
        dispatch(setFavouriteProductIds({ data: setting?.data?.favorite_product_ids }));
    }
    const loginApiCall = async (user, id, fcm, type) => {
        let latitude;
        let longitude;
        try {
            const mobileNumber = phonenum?.split(" ")[1]
            await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE);
            await firebase.auth().currentUser?.getIdToken(true);
            dispatch(setAuthId({ data: Uid, type }))
            const res = await newApi.login({ id: id, fcm, type })
            if (res.status === 1) {
                const tokenSet = await dispatch(setTokenThunk(res?.data?.access_token))
                await getCurrentUser()
                dispatch(setAuthType({ data: type }))
                if (res?.data?.user?.status == 1) {
                    dispatch(setIsGuest({ data: false }));
                }
                await handleFetchSetting();
                latitude = city?.city?.latitude || setting?.setting?.default_city?.latitude
                longitude = city?.city?.longitude || setting?.setting?.default_city?.longitude
                if (cart?.isGuest === true && cart?.guestCart?.length !== 0 && res?.data?.user?.status == 1) {
                    await AddtoCartBulk(res?.data.access_token);
                }
                await fetchCart(latitude, longitude);
                setError("");
                setOTP("");
                setPhonenum("");
                setisLoading(false);
                setIsOTP(false);
                props.setShow(false);
                setShowRegister(false)
            } else {
                setUserAuthType(type)
                setUserEmail(user?.providerData?.[0]?.email)
                setUserName(user?.providerData?.[0]?.displayName)
                setPhonenum(user?.providerData?.[0]?.phoneNumber)
                setRegisterModalShow(true)
                props.setShow(false);
            }
            setisLoading(false)
        } catch (error) {
            console.error("error", error)
            setisLoading(false)
        }

    }
    const handleEmailLogin = async (e) => {
        let latitude;
        let longitude;
        if (e != undefined) {
            e.preventDefault();
        }
        try {
            dispatch(setAuthType({ data: "email" }))
            const res = await newApi.login({ id: email, fcm, type: "email", password: password })
            if (res.status === 1) {
                const tokenSet = await dispatch(setTokenThunk(res?.data?.access_token))
                await getCurrentUser()
                dispatch(setAuthType({ data: "email" }))
                if (res?.data?.user?.status == 1) {
                    dispatch(setIsGuest({ data: false }));
                }
                await handleFetchSetting();
                latitude = city?.city?.latitude || setting?.setting?.default_city?.latitude
                longitude = city?.city?.longitude || setting?.setting?.default_city?.longitude
                if (cart?.isGuest === true && cart?.guestCart?.length !== 0 && res?.data?.user?.status == 1) {
                    await AddtoCartBulk(res?.data.access_token);
                }
                await fetchCart(latitude, longitude);
                setError("");
                setOTP("");
                setPhonenum("");
                setisLoading(false);
                setIsOTP(false);
                props.setShow(false);
                setShowRegister(false);
            } else {
                if (res.message == "email_not_verified") {
                    setIsOTP(true);
                    toast.error(t("email_not_verified"))
                } else if (res.message == "user_does_not_exist") {
                    setError(t("user_does_not_exist"))
                    // setInputValue("")
                    setPassword("")
                }
                else {
                    setError(t("password_not_valid"))
                    // setInputValue("")
                    setPassword("")
                }
            }
        } catch (error) {
            console.log("error", error)
        }
    }
    const handleGoogleAuthentication = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider)
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            const user = result.user;
            dispatch(setAuthType({ data: "google" }))
            await loginApiCall(user, user?.providerData?.[0]?.email, fcm, "google")
        } catch (error) {
            console.log("error", error)
        }
    }
    const handleTerms = () => {
        props.setShow(false);
    };
    const handlePolicy = () => {
        props.setShow(false);
    };


    const handleInputChange = (value, data) => {
        const emailRegexPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const containsOnlyDigits = /^\d+$/.test(value);

        // Always update the input value
        setInputValue(value);

        if (emailRegexPattern.test(value)) {
            setInputType("email");
            setEmail(value);
            setPhoneNumberWithoutCountryCode("");
            setCountryCode("");
            setOTP("")
            setUserEmail(value)
            dispatch(setAuthType({ data: "email" }))
        } else if (containsOnlyDigits) {
            setInputType("number");
            dispatch(setAuthType({ data: "phone" }))
            const phoneWithoutDialCode = value.startsWith(data?.dialCode)
                ? value.slice(data.dialCode.length)
                : value;
            setPhonenum(`+${value}`);
            setPhoneNumberWithoutCountryCode(phoneWithoutDialCode);
            setCountryCode("+" + (data?.dialCode || ""));
            setOTP("")
        } else {
            setInputType("");
        }
    };
    const handleShowRegister = () => {
        setShowRegister(true);
        setOTP("")
        // props.setShow(false);
    }

    const handleEmailVerify = async (e) => {
        let latitude;
        let longitude;
        e.preventDefault();
        try {
            const res = await newApi.verifyEmail({ email: userEmail, code: OTP })
            if (res.status == 1) {
                const tokenSet = await dispatch(setTokenThunk(res?.data?.access_token))
                await getCurrentUser()
                dispatch(setAuthType({ data: "email" }))
                if (res?.data?.user?.status == 1) {
                    dispatch(setIsGuest({ data: false }));
                }
                await handleFetchSetting();
                latitude = city?.city?.latitude || setting?.setting?.default_city?.latitude
                longitude = city?.city?.longitude || setting?.setting?.default_city?.longitude
                if (cart?.isGuest === true && cart?.guestCart?.length !== 0 && res?.data?.user?.status == 1) {
                    await AddtoCartBulk(res?.data?.access_token);
                }
                await fetchCart(latitude, longitude);
                props.setShow(false)
                setIsOTP(false)
            } else {
                setError(res.message)
            }
        } catch (error) {
            console.log("error", error)
        }
    }

    const handleForgetPasswordModal = () => {
        setShowForgetPassword(true)
        props.setShow(false)
    }

    const newReturn = (
        <>
            <Modal
                size='md'
                className='login'
                show={props.show}
                centered
                backdrop="static"
            >
                <Modal.Header className='d-flex flex-row justify-content-between align-items-center header'>
                    <div>
                        {isOTP ? <h5 className='login-heading'>{t("otp_verify")}</h5> :
                            <h5 className='login-heading'>{t("Login")}</h5>
                        }
                    </div>
                    <IoCloseSharp type='button' className='closeBtn' size={30} onClick={() => {
                        setError("");
                        setOTP("");
                        setPhonenum("");
                        setcheckboxSelected(false);
                        setisLoading(false);
                        setIsOTP(false);
                        props.setShow(false);
                    }} />
                </Modal.Header>
                <Modal.Body className='d-flex flex-column gap-3  body'>
                    <div className='my-5'>
                        {isOTP
                            ? (
                                <>
                                    <h5>{t("enter_verification_code")}</h5>
                                    <span className='d-flex flex-column text-start align-items-start otp-message'>{t("otp_send_message")} <p className='font-weight-bold py-2 text-secondary'>{
                                        user.authType == "email" ? userEmail : phonenum}</p></span>
                                </>
                            )
                            : (
                                <>
                                    <h5>{t("Welcome")}</h5>
                                    <span>{t("login_message")}</span>
                                </>
                            )}
                    </div>
                    {error !== '' && <span className='error-msg'>{error}</span>}
                    {isOTP
                        ? (
                            <form className='d-flex flex-column gap-3 form w-100' onSubmit={user.authType == "email" ? handleEmailVerify : verifyOTP}>
                                {isLoading && (
                                    <Loader width='100%' height='auto' />
                                )}
                                <OTPInput className='otp-container' inputStyle="otp-container-style" value={OTP} onChange={setOTP} autoFocus OTPLength={6} otpType="number" disabled={false} />
                                {user.authType == "email" ? <></> : <>
                                    <span className='timer' >
                                        <button onClick={handleLogin} disabled={disabled}>
                                            {timer === 0 ?
                                                `Resend OTP` : <>Resend OTP in <strong> {formatTime(timer)} </strong> </>}
                                        </button>
                                    </span>

                                </>}
                                <span className='button-container d-flex gap-5'>
                                    <button type="submit" className='login-btn' >{t("verify_and_proceed")}</button>
                                </span>

                            </form>
                        )
                        : (
                            <div>
                                {setting?.setting?.phone_login == 1 && setting?.setting?.email_login == 1 ? <form className='d-flex flex-column gap-3 form' onSubmit={inputType == "email" ? handleEmailLogin : handleLogin}>
                                    {isLoading && (
                                        <Loader width='100%' height='auto' />
                                    )}
                                    <div>
                                        {inputType == "number" ?
                                            (
                                                <>
                                                    <PhoneInput
                                                        country={defaultCountryCode}
                                                        value={phonenum}
                                                        onChange={(phone, data) => handleInputChange(phone, data)}
                                                        onCountryChange={(code) => setCountryCode(code)}
                                                        inputProps={{
                                                            name: "phone",
                                                            required: true,
                                                            autoFocus: true,
                                                        }}
                                                    />

                                                </>

                                            )
                                            :
                                            inputType === "email" ?
                                                (
                                                    <div className='password-input-wrapper'>
                                                        <input value={inputValue} onChange={(e) => handleInputChange(e.target.value, {})} className=' email-login-box' placeholder={t("loginBoxMessage")} ref={inputRef} />

                                                        <input type={showPassword ? "text" : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className='password-login-box' placeholder={t("passwordMessage")} />
                                                        <div className='login-eye-icon' onClick={handlePasswordShow}>
                                                            {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                                                        </div>
                                                        <div className='login-forget-password' onClick={handleForgetPasswordModal}>
                                                            <p>{t("forget_password_?")}</p>
                                                        </div>
                                                    </div>
                                                )
                                                :

                                                (
                                                    <>
                                                        <input value={inputValue} onChange={(e) => handleInputChange(e.target.value, {})} className=' email-login-box' placeholder={t("loginBoxMessage")} required />
                                                    </>
                                                )
                                        }

                                    </div>
                                    <button type='submit'> {t("login_continue")}</button>
                                    <p className='register-msg'>{t("registerMsg")}<a className='register-link' onClick={() => handleShowRegister()}> {t("registerNow")}</a></p>
                                </form> : setting?.setting?.phone_login == 1 ? <form className='d-flex flex-column gap-3 form' onSubmit={handleLogin}>

                                    <>
                                        <PhoneInput
                                            country={defaultCountryCode}
                                            value={phonenum}
                                            onChange={(phone, data) => handleInputChange(phone, data)}
                                            onCountryChange={(code) => setCountryCode(code)}
                                            inputProps={{
                                                name: "phone",
                                                required: true,
                                                autoFocus: true,
                                            }}
                                        />

                                    </>

                                    <button type='submit'> {t("login_continue")}</button>
                                </form> : setting?.setting?.email_login == 1 ?
                                    <form className='d-flex flex-column gap-3 form' onSubmit={handleEmailLogin}>
                                        <div className='password-input-wrapper'>
                                            <input value={inputValue} onChange={(e) => handleInputChange(e.target.value, {})} className=' email-login-box' placeholder={t("email_placeholder")} ref={inputRef} />

                                            <input type={showPassword ? "text" : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className='password-login-box' placeholder={t("passwordMessage")} />
                                            <div className='login-eye-icon' onClick={handlePasswordShow}>
                                                {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                                            </div>
                                            <div className='login-forget-password' onClick={handleForgetPasswordModal}>
                                                <p>{t("forget_password_?")}</p>
                                            </div>
                                        </div>
                                        <button type='submit'> {t("login_continue")}</button>
                                        <p className='register-msg'>{t("registerMsg")}<a className='register-link' onClick={() => handleShowRegister()}> {t("registerNow")}</a></p>
                                    </form>
                                    : <></>}
                                {setting?.setting?.phone_login == 1 && setting?.setting?.google_login == 1 ? <p className='text-center login-or'>OR</p> : <></>}
                                {setting?.setting?.google_login == 1 ? <div className='google-auth-container'>
                                    <button className='login-google-btn' onClick={handleGoogleAuthentication}><img src={GoogleLogo} className='google-log-img' />{t("continue_with_google")}</button>
                                </div> : <></>}
                                <span style={{ alignSelf: "baseline", marginTop: "20px", fontSize: "12px" }}>
                                    {t("agreement_updated_message")} &nbsp;<Link to={"/terms"} onClick={handleTerms}>{t("terms_of_service")}</Link> &nbsp;{t("and")}
                                    <Link to={"/policy/Privacy_Policy"} onClick={handlePolicy}>&nbsp; {t("privacy_policy")} &nbsp;</Link>
                                </span>
                            </div>
                        )}
                </Modal.Body>
            </Modal>
            <div id="recaptcha-container" style={{ display: "none" }}></div>
            <NewUserModal
                registerModalShow={registerModalShow}
                setRegisterModalShow={setRegisterModalShow}
                phoneNum={phonenum}
                setPhoneNum={setPhonenum}
                countryCode={countryCode.replace("+", "")}
                userEmail={userEmail}
                setUserEmail={setUserEmail}
                userName={userName}
                setUserName={setUserName}
                setLoginModal={props.setShow}
                setIsOTP={setIsOTP}
                userAuthType={userAuthType}
                phoneNumberWithoutCountryCode={phoneNumberWithoutCountryCode}
                setPhoneNumberWithoutCountryCode={setPhoneNumberWithoutCountryCode}
            />
            <Register showRegister={showRegister} setShowRegister={setShowRegister} handleGoogleAuthentication={handleGoogleAuthentication} props={props} setIsOTP={setIsOTP} setTimer={setTimer} setUserEmail={setUserEmail} />
            <ForgetPasswordModal showForgetPassword={showForgetPassword} setShowForgetPassword={setShowForgetPassword} />
        </>
    );
    return newReturn;
});

export default Login;