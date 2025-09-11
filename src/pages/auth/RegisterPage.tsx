import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import {
  EyeOutlined,
  EyeInvisibleOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
  RightOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../../store/authStore';
import { notification } from 'antd';

type RegisterFormInputs = {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
};

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const { register: registerUser } = useAuthStore();
  const navigate = useNavigate();
  const [api, contextHolder] = notification.useNotification();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
    getValues,
  } = useForm<RegisterFormInputs>();
  const password = watch('password', '');
  console.log(password);

  const totalSteps = 3;

  const onSubmit: SubmitHandler<RegisterFormInputs> = async (data) => {
    try {
      await registerUser(data.firstName, data.lastName, data.username, data.email, data.password);

      // Navigate to email verification page with email
      navigate('/verify-email', {
        state: { email: data.email },
        replace: true,
      });
    } catch (error) {
      console.error('Registration error:', error);
      api['error']({
        message: 'მონაცემები არასწორია',
        description:
          'შესაძლოა თქვენს მიერ შეყვანილი მომხმარებლის სახელი ან ელ-ფოსტა უკვე გამოყენებულია',
      });
      setCurrentStep(1);
      // Handle error without causing page refresh
    }
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof RegisterFormInputs)[] = [];

    switch (currentStep) {
      case 1:
        fieldsToValidate = ['username', 'email'];
        break;
      case 2:
        fieldsToValidate = ['password', 'confirmPassword'];
        break;
      case 3:
        fieldsToValidate = ['firstName', 'lastName', 'phoneNumber'];
        break;
    }

    console.log(fieldsToValidate);
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      // Save current step data
      const currentData = getValues();
      console.log('Step data:', currentData);
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return 'ანგარიშის შექმნა';
      case 2:
        return 'პაროლის დაყენება';
      case 3:
        return 'პირადი ინფორმაცია';
      default:
        return '';
    }
  };
  const getStepSubtitle = () => {
    switch (currentStep) {
      case 1:
        return 'შეიყვანეთ თქვენი მომხმარებლის სახელი და ელ-ფოსტა';
      case 2:
        return 'შექმენით ძლიერი და უსაფრთხო პაროლი';
      case 3:
        return 'დაასრულეთ რეგისტრაცია პირადი ინფორმაციით';
      default:
        return '';
    }
  };

  const renderStep1 = () => (
    <div className="space-y-5">
      <div className="input-group">
        <label htmlFor="username" className="input-label">
          მომხმარებლის სახელი
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <UserOutlined className="text-gray-400" />
          </div>
          <input
            id="username"
            type="text"
            autoComplete="username"
            placeholder="მომხმარებლის სახელი"
            className={`form-input ${
              errors.username ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
            }`}
            {...register('username', {
              required: 'მომხმარებლის სახელი აუცილებელია',
              minLength: {
                value: 3,
                message: 'მომხმარებლის სახელი უნდა შეიცავდეს მინიმუმ 3 სიმბოლოს',
              },
            })}
          />
        </div>
        {errors.username && <p className="input-error">{errors.username.message}</p>}
      </div>

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
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-5">
      <div className="input-group">
        <label htmlFor="password" className="input-label">
          პაროლი
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <LockOutlined className="text-gray-400" />
          </div>
          <input
            key={`password-${currentStep}`}
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="პაროლი"
            className={`form-input ${
              errors.password ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
            }`}
            {...register('password', {
              required: 'პაროლი აუცილებელია',
              minLength: {
                value: 6,
                message: 'პაროლი უნდა შეიცავდეს მინიმუმ 6 სიმბოლოს',
              },
            })}
          />
          <button
            type="button"
            className="password-toggle-button"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeInvisibleOutlined className="password-toggle-icon" />
            ) : (
              <EyeOutlined className="password-toggle-icon" />
            )}
          </button>
        </div>
        {errors.password && <p className="input-error">{errors.password.message}</p>}
      </div>

      <div className="input-group">
        <label htmlFor="confirmPassword" className="input-label">
          გაიმეორეთ პაროლი
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <LockOutlined className="text-gray-400" />
          </div>
          <input
            key={`confirmPassword-${currentStep}`}
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="გაიმეორეთ პაროლი"
            className={`form-input ${
              errors.confirmPassword ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
            }`}
            {...register('confirmPassword', {
              required: 'გთხოვთ დაადასტუროთ პაროლი',
              validate: (value) => value === password || 'პაროლები არ ემთხვევა',
            })}
          />
          <button
            type="button"
            className="password-toggle-button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <EyeInvisibleOutlined className="password-toggle-icon" />
            ) : (
              <EyeOutlined className="password-toggle-icon" />
            )}
          </button>
        </div>
        {errors.confirmPassword && <p className="input-error">{errors.confirmPassword.message}</p>}
      </div>

      {/* Password strength indicator */}
      {/* <div className="mt-4">
        <div className="text-sm text-gray-600 mb-2">პაროლის ძალა:</div>
        <div className="flex space-x-1">
          <div
            className={`h-2 w-1/3 rounded ${password.length >= 6 ? 'bg-red-400' : 'bg-gray-200'}`}
          ></div>
          <div
            className={`h-2 w-1/3 rounded ${
              password.length >= 8 && /[A-Z]/.test(password) ? 'bg-yellow-400' : 'bg-gray-200'
            }`}
          ></div>
          <div
            className={`h-2 w-1/3 rounded ${
              password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)
                ? 'bg-green-400'
                : 'bg-gray-200'
            }`}
          ></div>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          გამოიყენეთ მინიმუმ 8 სიმბოლო, ზედა რეგისტრის ასოები და ციფრები
        </div>
      </div> */}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="input-group">
          <label htmlFor="firstName" className="input-label">
            სახელი
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <UserOutlined className="text-gray-400" />
            </div>
            <input
              id="firstName"
              type="text"
              autoComplete="given-name"
              placeholder="სახელი"
              className={`form-input ${
                errors.firstName ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
              }`}
              {...register('firstName', { required: 'სახელი აუცილებელია' })}
            />
          </div>
          {errors.firstName && <p className="input-error">{errors.firstName.message}</p>}
        </div>

        <div className="input-group">
          <label htmlFor="lastName" className="input-label">
            გვარი
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <UserOutlined className="text-gray-400" />
            </div>
            <input
              id="lastName"
              type="text"
              autoComplete="family-name"
              placeholder="გვარი"
              className={`form-input ${
                errors.lastName ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
              }`}
              {...register('lastName', { required: 'გვარი აუცილებელია' })}
            />
          </div>
          {errors.lastName && <p className="input-error">{errors.lastName.message}</p>}
        </div>
      </div>

      <div className="input-group">
        <label htmlFor="phoneNumber" className="input-label">
          ტელეფონის ნომერი
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <PhoneOutlined className="text-gray-400" />
          </div>
          <input
            id="phoneNumber"
            type="tel"
            autoComplete="tel"
            placeholder="ტელეფონის ნომერი"
            className={`form-input ${
              errors.phoneNumber ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
            }`}
            {...register('phoneNumber', {
              required: 'ტელეფონის ნომერი აუცილებელია',
              minLength: {
                value: 9,
                message: 'არასწორი ტელეფონის ნომრის ფორმატი',
              },
              maxLength: {
                value: 9,
                message: 'არასწორი ტელეფონის ნომრის ფორმატი',
              },
            })}
          />
        </div>
        {errors.phoneNumber && <p className="input-error">{errors.phoneNumber.message}</p>}
      </div>

      <div className="text-sm text-center mt-6 p-4 bg-gray-50 rounded-lg">
        ანგარიშის შექმნით თქვენ ეთანხმებით ჩვენს{' '}
        <Link to="/terms" className="form-link">
          მომსახურების პირობებს
        </Link>{' '}
        და{' '}
        <Link to="/privacy" className="form-link">
          კონფიდენციალურობის პოლიტიკას
        </Link>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      default:
        return null;
    }
  };

  return (
    <>
      {contextHolder}
      <div className="auth-container">
        <div className="auth-form-container">
          <div className="logo-container">
            <Link to="/">
              <img src="/favicon.jpeg" alt="ლოგო" className="auth-logo" />
            </Link>
          </div>

          {/* Step Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center mb-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                      step < currentStep
                        ? 'bg-green-500 border-green-500 text-white'
                        : step === currentStep
                        ? 'bg-primary border-primary text-white'
                        : 'bg-gray-200 border-gray-300 text-gray-500'
                    }`}
                  >
                    {step < currentStep ? (
                      <CheckOutlined className="text-sm" />
                    ) : (
                      <span className="text-sm font-semibold">{step}</span>
                    )}
                  </div>
                  {step < totalSteps && (
                    <div
                      className={`w-16 h-1 mx-2 transition-all duration-300 ${
                        step < currentStep ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center">
              <span className="text-sm text-gray-500">
                ნაბიჯი {currentStep} / {totalSteps}
              </span>
            </div>
          </div>

          <h2 className="auth-heading">{getStepTitle()}</h2>
          <p className="auth-subheading mb-8">{getStepSubtitle()}</p>

          <form
            className="space-y-6"
            // onSubmit={(e) => {
            //   e.preventDefault();
            //   handleSubmit(onSubmit)(e);
            // }}
          >
            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-all duration-300 hover:shadow-lg"
                >
                  {currentStep < totalSteps ? 'შემდეგი' : 'ანგარიშის შექმნა'}
                  <RightOutlined className="ml-2" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSubmit(onSubmit)(e);
                  }}
                  className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all duration-300 hover:shadow-lg"
                >
                  ანგარიშის შექმნა
                  <CheckOutlined className="ml-2" />
                </button>
              )}
            </div>
          </form>

          <div className="text-center mt-8">
            <p className="text-gray-600">
              უკვე გაქვთ ანგარიში?{' '}
              <Link to="/login" className="form-link">
                შედით ანგარიშზე
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;
