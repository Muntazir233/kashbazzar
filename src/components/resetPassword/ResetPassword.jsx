import React, { useState } from 'react'
import "./resetPassword.css"
import { useTranslation } from 'react-i18next';
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { toast } from 'react-toastify';
import * as newApi from "../../api/apiCollection"

const ResetPassword = () => {
    const { t } = useTranslation()
    const [password, setPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)


    const handlePasswordChange = async (e) => {
        e.preventDefault();
        try {
            if (newPassword != confirmPassword) {
                toast.error(t("confirm_password_message"))
                return;
            }
            const res = await newApi.resetPassword({ password, newPassword, confirmPassword })
            if (res.status == 1) {
                toast.success(res.message)
                setPassword("")
                setNewPassword("")
                setConfirmPassword("")
            } else {
                toast.error(t("invalid_otp"))
                setPassword("")
                setNewPassword("")
                setConfirmPassword("")
            }
        } catch (error) {
            console.log("error", error)
        }
    }

    return (
        <form className='reset-password-container' onSubmit={handlePasswordChange}>
            <div className='reset-password-heading col-6'>
                Reset Password
            </div>
            <div className='reset-password-input-wrapper'>
                <div className='password'>
                    <input type={showPassword ? "text" : "password"} className='password' placeholder={t("please_enter_password")} onChange={(e) => setPassword(e.target.value)} value={password} />
                    <div className='reset-password-eye-icon' onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                    </div>
                </div>
                <div className='new-password'>
                    <input type={showNewPassword ? "text" : "password"} className='new-password' placeholder={t("please_enter_new_password")} onChange={(e) => setNewPassword(e.target.value)} value={newPassword} />
                    <div className='reset-password-eye-icon' onClick={() => setShowNewPassword(!showNewPassword)}>
                        {showNewPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                    </div>
                </div>
                <div className='confirm-new-password'>
                    <input type={showConfirmPassword ? "text" : "password"} className='confirm-new-password' placeholder={t("please_enter_new_password")} onChange={(e) => setConfirmPassword(e.target.value)} value={confirmPassword} />
                    <div className='reset-password-eye-icon' onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                    </div>
                </div>
            </div>
            <button className='forget-password-button'>{t("reset_password")}</button>
        </form>
    )
}

export default ResetPassword