import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { MailOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons';
import { notification } from 'antd';
import { authService } from '../../services';

type ForgotPasswordFormInputs = {
  email: string;
  otp: string;
  newPass: string;
};

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [otpRequested, setOtpRequested] = useState(false);
  const [api, contextHolder] = notification.useNotification();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setError,
  } = useForm<ForgotPasswordFormInputs>();

  const email = watch('email');

  const handleRequestOTP = async () => {
    if (!email) {
      setError('email', { message: 'ელ-ფოსტა აუცილებელია' });
      return;
    }

    try {
      setIsLoading(true);
      await authService.resendOTP(email);
      setOtpRequested(true);
      api['success']({
        message: 'OTP კოდი გაიგზავნა',
        description: 'გთხოვთ შეამოწმოთ თქვენი ელ-ფოსტა',
      });
    } catch (error) {
      console.error('OTP request error:', error);
      api['error']({
        message: 'OTP კოდის მიღების შეცდომა',
        description: 'გთხოვთ სცადოთ ხელახლა',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit: SubmitHandler<ForgotPasswordFormInputs> = async (data) => {
    try {
      setIsLoading(true);
      await authService.forgotPassword(data);

      api['success']({
        message: 'პაროლი წარმატებით შეიცვალა',
        description: 'ახლა შეგიძლიათ შეხვიდეთ ანგარიშზე ახალი პაროლით.',
      });

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error('Password reset error:', error);
      api['error']({
        message: 'პაროლის შეცვლის შეცდომა',
        description: 'არასწორი ელ-ფოსტა ან კოდი. გთხოვთ შეამოწმოთ და სცადოთ ხელახლა.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <div className="auth-container">
        <div className="auth-form-container">
          <div className="logo-container">
            <img src="/favicon.jpeg" alt="ლოგო" className="auth-logo" />
          </div>
          <h2 className="auth-heading">პაროლის აღდგენა</h2>
          <p className="auth-subheading">შეიყვანეთ თქვენი ელ-ფოსტა და OTP კოდი პაროლის აღსადგენად</p>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="rounded-md space-y-5">
              <div className="input-group">
                <label htmlFor="email" className="input-label">
                  ელ-ფოსტის მისამართი
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MailOutlined className="text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="თქვენი ელ-ფოსტა"
                    className={`form-input ${
                      errors.email ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
                    }`}
                    {...register('email', {
                      required: 'ელ-ფოსტა აუცილებელია',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'არასწორი ელ-ფოსტის ფორმატი',
                      },
                    })}
                  />
                </div>
                {errors.email && <p className="input-error">{errors.email.message}</p>}
              </div>

              {otpRequested && (
                <>
                  <div className="input-group">
                    <label htmlFor="otp" className="input-label">
                      OTP კოდი
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SafetyOutlined className="text-gray-400" />
                      </div>
                      <input
                        id="otp"
                        type="text"
                        placeholder="OTP კოდი"
                        className={`form-input ${
                          errors.otp ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
                        }`}
                        {...register('otp', {
                          required: 'OTP კოდი აუცილებელია',
                        })}
                      />
                    </div>
                    {errors.otp && <p className="input-error">{errors.otp.message}</p>}
                  </div>

                  <div className="input-group">
                    <label htmlFor="newPass" className="input-label">
                      ახალი პაროლი
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <LockOutlined className="text-gray-400" />
                      </div>
                      <input
                        id="newPass"
                        type="password"
                        placeholder="ახალი პაროლი"
                        className={`form-input ${
                          errors.newPass
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                            : ''
                        }`}
                        {...register('newPass', {
                          required: 'ახალი პაროლი აუცილებელია',
                          minLength: {
                            value: 6,
                            message: 'პაროლი უნდა შეიცავდეს მინიმუმ 6 სიმბოლოს',
                          },
                        })}
                      />
                    </div>
                    {errors.newPass && <p className="input-error">{errors.newPass.message}</p>}
                  </div>
                </>
              )}
            </div>

            <div>
              {!otpRequested ? (
                <button
                  type="button"
                  className="form-button"
                  onClick={handleRequestOTP}
                  disabled={isLoading}
                >
                  {isLoading ? 'მიმდინარეობს...' : 'კოდის მიღება'}
                </button>
              ) : (
                <button type="submit" className="form-button" disabled={isLoading}>
                  {isLoading ? 'მიმდინარეობს...' : 'პაროლის აღდგენა'}
                </button>
              )}
            </div>

            <div className="text-center">
              <Link to="/login" className="form-link">
                დაბრუნება შესვლის გვერდზე
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ForgotPasswordPage;
