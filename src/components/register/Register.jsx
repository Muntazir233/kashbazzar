import React, { useState } from 'react'
import "./register.css"
import { Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { IoCloseSharp } from "react-icons/io5";
import GoogleLogo from "../../utils/google-color-icon.svg"
import { Link } from 'react-router-dom';
import PhoneInput from 'react-phone-input-2';
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import * as newApi from "../../api/apiCollection";
import api from '../../api/api';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { setAuthType, setCurrentUser } from '../../model/reducer/authReducer';
import { setSetting } from '../../model/reducer/settingReducer';
import { setFavouriteLength, setFavouriteProductIds } from '../../model/reducer/favouriteReducer';
import { addtoGuestCart, setCart, setCartProducts, setCartSubTotal, setGuestCartTotal, setIsGuest } from '../../model/reducer/cartReducer';
import { setTokenThunk } from '../../model/thunk/loginThunk';

const Register = ({ showRegister, setShowRegister, handleGoogleAuthentication, props, setIsOTP, setTimer, setUserEmail }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch()
    const setting = useSelector((state) => state.setting);
    const cart = useSelector((state) => state.cart);
    const fcm_token = useSelector((state) => state.user.fcm_token)
    const auth_id = useSelector((state) => state.user.authId)
    const city = useSelector(state => state.city);

    const defaultCountryCode = process.env.REACT_APP_DEFAULT_COUNTRY_CODE

    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [phoneNumber, setPhoneNumber] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [phoneNumberWithoutCountryCode, setPhoneNumberWithoutCountryCode] = useState(null)
    const [countryCode, setCountryCode] = useState("")
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("")
    const [errorType, setErrorType] = useState("")

    const handleTerms = () => {
        props.setShow(false)
        setShowRegister(false);
    };
    const handlePolicy = () => {
        props.setShow(false)
        setShowRegister(false);
    };


    const handleUserRegistration = async (e) => {
        const emailRegexPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        e.preventDefault();
        try {
            if (!name) {
                setError(t("please_enter_name"))
                setErrorType("name")
                return;
            }
            else if (!emailRegexPattern.test(email)) {
                setError(t("please_enter_email"))
                setErrorType("email")
                return;
            }
            else if (password.length < 6) {
                setError(t("please_enter_password"))
                setErrorType("password")
                return;
            } else if (!confirmPassword) {
                setError(t("please_enter_confirm_password"))
                setErrorType("confirmpassword")
                return;
            } else if (confirmPassword !== password) {
                setError(t("confirm_password_message"))
                setErrorType("confirmpassword")
                return;
            }
            else {
                setIsLoading(true)
                const res = await newApi.registerUser({ id: email, name: name, email: email, mobile: phoneNumberWithoutCountryCode, type: 'email', fcm: fcm_token, country_code: countryCode, password: password })
                if (res.status == 1) {
                    setIsLoading(false)
                    dispatch(setAuthType({ data: "email" }))
                    setShowRegister(false);
                    toast.success(t("verification_mail_sent_successfully"));
                    setIsOTP(true);
                    setTimer(90)
                    setPassword("")
                    setEmail("")
                    setName("")
                    setConfirmPassword("")
                    setPhoneNumberWithoutCountryCode("")
                    setPhoneNumber("")
                } else {
                    setIsLoading(false)
                    if (res.message == "user_exist_with_phone") {
                        toast.error(t("user_exist_with_phone"))
                    } else if (res.message == "user_exist_with_email") {
                        toast.error(t("user_exist_with_email"))
                    } else if (res.message == "user_exist_with_google") {
                        toast.error(t("user_exist_with_google"))
                    } else if (res.message == "user_exist_with_apple") {
                        toast.error(t("user_exist_with_apple"))
                    } else {
                        toast.error(res.message)
                    }
                    setShowRegister(false);
                    setPassword("")
                    setEmail("")
                    setName("")
                    setConfirmPassword("")
                    setPhoneNumberWithoutCountryCode("")
                    setPhoneNumber("")
                }

            }
        } catch (error) {
            console.log("error", error)
        }
    }




    const handleInputChange = (value, data) => {
        const phoneWithoutDialCode = value.startsWith(data?.dialCode)
            ? value.slice(data.dialCode.length)
            : value;
        setPhoneNumber(`${value}`);
        setPhoneNumberWithoutCountryCode(phoneWithoutDialCode);
        setCountryCode("+" + (data?.dialCode || ""));
    }

    const togglePasswordVisibility = () => {
        setShowPassword(prevState => !prevState);
    };
    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(prevState => !prevState);
    };


    const handleRegisterModal = () => {
        setName("")
        setEmail("")
        setPhoneNumber("")
        setPassword("")
        setError("")
        setErrorType("")
        setConfirmPassword("")
        setShowRegister(false)
    }

    const handleEmailChange = (e) => {
        setUserEmail(e.target.value)
        setEmail(e.target.value)
    }


    return (
        <div>
            <div className='register-container'>
                <Modal
                    size='md'
                    className='register'
                    show={showRegister}
                    centered
                    backdrop="static"
                >
                    <Modal.Header className='d-flex flex-row justify-content-between align-items-center header'>
                        <div>
                            <h5 className='register-heading'>{t("register")}</h5>
                        </div>
                        <IoCloseSharp type='button' className='closeBtn' size={30} onClick={() => {
                            handleRegisterModal();
                        }} />
                    </Modal.Header>
                    <Modal.Body className='d-flex flex-column gap-3  body'>
                        <div className=''>
                            <div>
                                <h5>{t("Welcome")}</h5>
                                <span>{t("signupMessage")}</span>
                            </div>
                            <form onSubmit={handleUserRegistration} className='register-input-container'>
                                <div className='input-container'>
                                    <label>{t("name")}<sup>*</sup></label>
                                    <input className='register-name-box' value={name} placeholder={t("namePlaceholder")} onChange={(e) => setName(e.target.value)} />
                                    <span className='error-msg'>{errorType == "name" && error}</span>
                                </div>

                                <div className='input-container'>
                                    <label>{t("email")}<sup>*</sup></label>
                                    <input type='email' className='register-name-box' value={email} placeholder={t("emailPlaceholder")} onChange={(e) => handleEmailChange(e)} />
                                    <span className='error-msg'>{errorType == "email" && error}</span>
                                </div>

                                <div className='input-container'>
                                    <label>{t("mobileNumber")}<sup>*</sup></label>
                                    <>
                                        <PhoneInput
                                            country={defaultCountryCode}
                                            value={phoneNumber}
                                            onChange={(phone, data) => handleInputChange(phone, data)}
                                            onCountryChange={(code) => setCountryCode(code)}
                                            inputProps={{
                                                name: "phone",
                                                autoFocus: true,
                                            }}
                                        />
                                    </>
                                    <span className='error-msg'>{errorType == "phonenumber" && error}</span>
                                </div>

                                <div className='input-container'>
                                    <label>{t("password")}</label>
                                    <div className='password-input-wrapper'>
                                        <input
                                            className='register-name-box'
                                            placeholder={t("passwordPlaceholder")} type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)} />
                                        <div className='eye-icon' onClick={togglePasswordVisibility}>
                                            {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                                        </div>
                                        <span className='error-msg'>{errorType == "password" && error}</span>
                                    </div>
                                </div>
                                <div className='input-container'>
                                    <label>{t("confirmPassword")}</label>
                                    <div className='password-input-wrapper'>
                                        <input
                                            className='register-name-box'
                                            placeholder={t("confirmPasswordPlaceholder")} type={showConfirmPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)} />
                                        <div className='eye-icon' onClick={toggleConfirmPasswordVisibility}>
                                            {showConfirmPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                                        </div>
                                        <span className='error-msg'>{errorType == "confirmpassword" && error}</span>
                                    </div>
                                </div>
                                <button type='submit' disabled={isLoading ? true : false}>{isLoading ? "Loading" : t("register")}</button>
                            </form>

                            {setting?.setting?.phone_login == 1 && setting?.setting?.google_login == 1 ? <p className='text-center login-or'>OR</p> : <></>}
                            {setting?.setting?.google_login == 1 ? <div className='google-auth-container'>
                                <button className='login-google-btn' onClick={handleGoogleAuthentication}><img src={GoogleLogo} className='google-log-img' />{t("continue_with_google")}</button>
                            </div> : <></>}
                            <span style={{ alignSelf: "baseline", marginTop: "20px", fontSize: "12px" }}>
                                {t("agreement_updated_message")} &nbsp;<Link to={"/terms"} onClick={handleTerms}>{t("terms_of_service")}</Link> &nbsp;{t("and")}
                                <Link to={"/policy/Privacy_Policy"} onClick={handlePolicy}>&nbsp; {t("privacy_policy")} &nbsp;</Link>
                            </span>
                        </div>
                    </Modal.Body>
                </Modal>
            </div>
        </div>
    )
}

export default Register;