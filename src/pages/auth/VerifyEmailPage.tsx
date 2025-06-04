import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { MailOutlined, SafetyOutlined, CheckOutlined } from '@ant-design/icons';
import { notification } from 'antd';
import { authService } from '../../services';

type VerifyEmailFormInputs = {
  email: string;
  otp: string;
};

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [api, contextHolder] = notification.useNotification();

  // Get email from navigation state if available
  const emailFromRegistration = location.state?.email || '';

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<VerifyEmailFormInputs>({
    defaultValues: {
      email: emailFromRegistration,
    },
  });

  const onSubmit: SubmitHandler<VerifyEmailFormInputs> = async (data) => {
    try {
      setIsLoading(true);
      await authService.verifyAccount(data.email, data.otp);

      api['success']({
        message: 'ანგარიში წარმატებით გააქტიურდა',
        description: 'თქვენი ელ-ფოსტა დადასტურდა. ახლა შეგიძლიათ შეხვიდეთ ანგარიშზე.',
      });

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error('Verification error:', error);
      api['error']({
        message: 'დადასტურების შეცდომა',
        description: 'არასწორი ელ-ფოსტა ან კოდი. გთხოვთ შეამოწმოთ და სცადოთ ხელახლა.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resendOTP = async () => {
    try {
      setIsLoading(true);
      // Add resend OTP API call here if needed
      await authService.resendOTP(watch('email'));

      api['success']({
        message: 'კოდი გაიგზავნა',
        description: 'ახალი დადასტურების კოდი გაიგზავნა თქვენს ელ-ფოსტაზე.',
      });
    } catch {
      api['error']({
        message: 'შეცდომა',
        description: 'კოდის გაგზავნისას დაფიქსირდა შეცდომა.',
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

          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <MailOutlined className="text-green-600 text-2xl" />
            </div>
            <h2 className="auth-heading">ელ-ფოსტის დადასტურება</h2>
            <p className="auth-subheading">
              შეიყვანეთ თქვენს ელ-ფოსტაზე გამოგზავნილი დადასტურების კოდი
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
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

            <div className="input-group">
              <label htmlFor="otp" className="input-label">
                დადასტურების კოდი
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SafetyOutlined className="text-gray-400" />
                </div>
                <input
                  id="otp"
                  type="text"
                  placeholder="6-ნიშნა კოდი"
                  maxLength={6}
                  className={`form-input ${
                    errors.otp ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
                  }`}
                  {...register('otp', {
                    required: 'დადასტურების კოდი აუცილებელია',
                    minLength: {
                      value: 6,
                      message: 'კოდი უნდა შეიცავდეს 6 ციფრს',
                    },
                    maxLength: {
                      value: 6,
                      message: 'კოდი უნდა შეიცავდეს 6 ციფრს',
                    },
                    pattern: {
                      value: /^[0-9]{6}$/,
                      message: 'კოდი უნდა შეიცავდეს მხოლოდ ციფრებს',
                    },
                  })}
                />
              </div>
              {errors.otp && <p className="input-error">{errors.otp.message}</p>}
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="form-button disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  'დადასტურება...'
                ) : (
                  <>
                    <CheckOutlined className="mr-2" />
                    ანგარიშის დადასტურება
                  </>
                )}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                არ მოგიღიათ კოდი?{' '}
                <button
                  type="button"
                  onClick={resendOTP}
                  disabled={isLoading}
                  className="form-link disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ხელახლა გაგზავნა
                </button>
              </p>
            </div>
          </form>

          <div className="text-center mt-8">
            <p className="text-gray-600">
              <Link to="/login" className="form-link">
                ← დაბრუნება შესვლის გვერდზე
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default VerifyEmailPage;
