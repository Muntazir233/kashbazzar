import React, { useState } from 'react'
import "./forgetPasswordModal.css"
import { Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { IoCloseSharp } from "react-icons/io5";
import { Link } from 'react-router-dom';
import * as newApi from "../../api/apiCollection";
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa';


const ForgetPasswordModal = ({ showForgetPassword, setShowForgetPassword }) => {
    const { t } = useTranslation();

    const [otp, setOtp] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [stage, setStage] = useState(0)
    const [showPassword, setShowPassword] = useState("")
    const [showConfirmPassword, setShowConfirmPassword] = useState("")
    const [error, setError] = useState("")

    const handleForgetPasswordModal = () => {
        setStage(0)
        setShowForgetPassword(false)
    }

    const handleForgetPassword = async (e) => {
        e.preventDefault()
        try {
            const res = await newApi.forgotPasswordOTP({ email: email });
            if (res.status == 1) {
                setStage(1);
                toast.success(t("verification_mail_sent_successfully"))
            } else {
                if (res.message == "email_is_not_registered") {
                    toast.error(t("email_is_not_registered"))
                } else {
                    toast.error(res.message)
                }
            }
        } catch (error) {
            console.log("error", error)
        }
    }

    const handleResetPassword = async (e) => {
        e.preventDefault();
        try {
            if (password !== confirmPassword) {
                toast.error(t("confirm_password_message"))
                return
            }
            const res = await newApi.forgotPassword({ email: email, otp: otp, password: password, confirmPassword: confirmPassword })
            if (res.status == 1) {
                setConfirmPassword("")
                setOtp("")
                setPassword("")
                setEmail("")
                setShowForgetPassword(false)
                toast.success(res.message)
                setStage(0);
            } else {
                setStage(1);
                toast.error(res.message)
            }

        } catch (error) {
            console.log("error", error)
        }
    }

    const togglePasswordVisibility = () => {
        setShowPassword(prevState => !prevState);
    };
    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(prevState => !prevState);
    };

    return (
        <div>
            <div className='forget-password-container'>
                <Modal
                    size='md'
                    className='forget-password'
                    show={showForgetPassword}
                    centered
                    backdrop="static"
                >
                    <Modal.Header className='d-flex flex-row justify-content-between align-items-center header'>
                        <div>
                            <h5 className='forget-password-heading'>{t("forget_password")}</h5>
                        </div>
                        <IoCloseSharp type='button' className='closeBtn' size={30} onClick={() => {
                            handleForgetPasswordModal();
                        }} />
                    </Modal.Header>
                    <Modal.Body className='d-flex flex-column gap-3 body'>
                        <div className=''>
                            {stage == 0 ?
                                <form onSubmit={handleForgetPassword}>
                                    <div className='input-container'>
                                        <label>{t("email")}<sup>*</sup></label>
                                        <input type='email' className='forget-password-box' value={email} placeholder={t("emailPlaceholder")} onChange={(e) => setEmail(e.target.value)} />
                                    </div>
                                    <button type='submit'> {t("get_mail")}</button>
                                </form> :
                                <form onSubmit={handleResetPassword}>
                                    <div className='input-container'>
                                        <label>{t("otp")}<sup>*</sup></label>
                                        <input type='text' className='forget-password-box' value={otp} placeholder={t("otpPlaceholder")} onChange={(e) => setOtp(e.target.value)} />
                                    </div>
                                    <div className='input-container'>
                                        <label>{t("password")}</label>
                                        <div className='password-input-wrapper'>
                                            <input
                                                className='forget-password-box'
                                                placeholder={t("passwordPlaceholder")} type={showPassword ? 'text' : 'password'}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)} />
                                            <div className='forget-eye-icon' onClick={togglePasswordVisibility}>
                                                {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                                            </div>
                                        </div>
                                    </div>
                                    <div className='input-container'>
                                        <label>{t("confirmPassword")}</label>
                                        <div className='password-input-wrapper'>
                                            <input
                                                className='forget-password-box'
                                                placeholder={t("confirmPasswordPlaceholder")} type={showConfirmPassword ? 'text' : 'password'}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)} />
                                            <div className='forget-eye-icon' onClick={toggleConfirmPasswordVisibility}>
                                                {showConfirmPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                                            </div>
                                        </div>
                                    </div>
                                    <button type='submit' > {t("changePassword")}</button>
                                </form>
                            }

                        </div>
                    </Modal.Body>
                </Modal>
            </div>
        </div>

    )
}

export default ForgetPasswordModal