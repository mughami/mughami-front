import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  EyeOutlined,
  EyeInvisibleOutlined,
  UserOutlined,
  MailOutlined,
  LockOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../../store/authStore';
import { notification } from 'antd';
import type { Gender } from '../../services/api/authService';

// Format the local part of a Georgian phone number as "555 555 555".
// The leading "+995" is shown as a fixed prefix, so the stored value stays
// the raw 9 digits the backend expects.
const formatGeorgianPhone = (raw: string): string => {
  const digits = (raw || '').replace(/\D/g, '').slice(0, 9);
  return [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 9)].filter(Boolean).join(' ');
};

type RegisterFormInputs = {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  age: string;
  gender: Gender;
};

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: registerUser } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  // Carry the intended post-auth destination (e.g. a quiz play page) through
  // the verification flow so the user lands back where they started.
  const from = (location.state as { from?: string } | null)?.from;
  const [api, contextHolder] = notification.useNotification();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setError,
    control,
  } = useForm<RegisterFormInputs>();
  const password = watch('password', '');

  // Extract the backend message (e.g. from a 409 ALREADY_EXISTS response).
  const getBackendMessage = (error: unknown): string => {
    if (typeof error === 'object' && error !== null && 'response' in error) {
      const response = (error as { response?: { data?: { message?: string } } }).response;
      return response?.data?.message ?? '';
    }
    return '';
  };

  const onSubmit: SubmitHandler<RegisterFormInputs> = async (data) => {
    try {
      await registerUser(
        data.firstName,
        data.lastName,
        data.username,
        data.email,
        data.password,
        Number(data.age),
        data.gender,
        data.phoneNumber,
      );

      // Navigate to email verification page with email
      navigate('/verify-email', {
        state: { email: data.email, from },
        replace: true,
      });
    } catch (error) {
      console.error('Registration error:', error);

      // Map backend "already exists" (409) responses to the specific field so
      // its input turns red and shows a Georgian message.
      const backendMessage = getBackendMessage(error).toLowerCase();
      let handled = false;

      if (backendMessage.includes('email')) {
        setError(
          'email',
          { type: 'server', message: 'ამ ელ-ფოსტით მომხმარებელი უკვე არსებობს' },
          { shouldFocus: !handled },
        );
        handled = true;
      }
      if (backendMessage.includes('username')) {
        setError(
          'username',
          { type: 'server', message: 'ეს მომხმარებლის სახელი უკვე გამოყენებულია' },
          { shouldFocus: !handled },
        );
        handled = true;
      }
      if (backendMessage.includes('phone')) {
        setError(
          'phoneNumber',
          { type: 'server', message: 'ეს ტელეფონის ნომერი უკვე გამოყენებულია' },
          { shouldFocus: !handled },
        );
        handled = true;
      }

      // Fall back to a generic notification for anything we can't pinpoint.
      if (!handled) {
        api['error']({
          message: 'რეგისტრაცია ვერ მოხერხდა',
          description: 'დაფიქსირდა შეცდომა. გთხოვთ სცადოთ ხელახლა.',
        });
      }
    }
  };

  return (
    <>
      {contextHolder}
      <div className="auth-container">
        <div className="auth-form-container max-w-2xl">
          <div className="logo-container">
            <Link to="/">
              <img src="/favicon.jpeg" alt="ლოგო" className="auth-logo" />
            </Link>
          </div>

          <h2 className="auth-heading">ანგარიშის შექმნა</h2>
          <p className="auth-subheading mb-8">შეავსეთ ფორმა რეგისტრაციის დასასრულებლად</p>

          <form
            className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2"
            onSubmit={handleSubmit(onSubmit)}
          >
            {/* Account */}
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

            {/* Password */}
            <div className="input-group">
              <label htmlFor="password" className="input-label">
                პაროლი
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockOutlined className="text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
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
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="გაიმეორეთ პაროლი"
                  className={`form-input ${
                    errors.confirmPassword
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                      : ''
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
              {errors.confirmPassword && (
                <p className="input-error">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Personal info */}
            <div className="sm:col-span-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
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

            <div className="input-group sm:col-span-2">
              <label htmlFor="phoneNumber" className="input-label">
                ტელეფონის ნომერი
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 z-20 pl-3 flex items-center pointer-events-none text-gray-500 sm:text-sm">
                  (+995)
                </div>
                <Controller
                  name="phoneNumber"
                  control={control}
                  rules={{
                    required: 'ტელეფონის ნომერი აუცილებელია',
                    validate: (value) =>
                      (value || '').replace(/\D/g, '').length === 9 ||
                      'არასწორი ტელეფონის ნომრის ფორმატი',
                  }}
                  render={({ field }) => (
                    <input
                      id="phoneNumber"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      placeholder="555 555 555"
                      value={formatGeorgianPhone(field.value || '')}
                      onChange={(e) =>
                        field.onChange(e.target.value.replace(/\D/g, '').slice(0, 9))
                      }
                      onBlur={field.onBlur}
                      className={`form-input pl-[68px] ${
                        errors.phoneNumber ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
                      }`}
                    />
                  )}
                />
              </div>
              {errors.phoneNumber && <p className="input-error">{errors.phoneNumber.message}</p>}
            </div>

            <div className="sm:col-span-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="input-group">
                <label htmlFor="age" className="input-label">
                  ასაკი
                </label>
                <div className="relative">
                  <input
                    id="age"
                    type="number"
                    placeholder="ასაკი"
                    min="1"
                    max="150"
                    className={`form-input ${
                      errors.age ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
                    }`}
                    {...register('age', {
                      required: 'ასაკი აუცილებელია',
                      min: {
                        value: 1,
                        message: 'ასაკი უნდა იყოს მინიმუმ 1',
                      },
                      max: {
                        value: 150,
                        message: 'ასაკი უნდა იყოს მაქსიმუმ 150',
                      },
                    })}
                  />
                </div>
                {errors.age && <p className="input-error">{errors.age.message}</p>}
              </div>

              <div className="input-group">
                <label htmlFor="gender" className="input-label">
                  სქესი
                </label>
                <select
                  id="gender"
                  className={`form-input ${
                    errors.gender ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
                  }`}
                  defaultValue=""
                  {...register('gender', {
                    required: 'სქესი აუცილებელია',
                  })}
                >
                  <option value="" disabled>
                    აირჩიეთ სქესი
                  </option>
                  <option value="MALE">მამრობითი</option>
                  <option value="FEMALE">მდედრობითი</option>
                </select>
                {errors.gender && <p className="input-error">{errors.gender.message}</p>}
              </div>
            </div>

            <div className="text-sm text-center p-4 bg-gray-50 rounded-lg sm:col-span-2">
              ანგარიშის შექმნით თქვენ ეთანხმებით ჩვენს{' '}
              <Link to="/terms" className="form-link">
                მომსახურების პირობებს
              </Link>{' '}
              და{' '}
              <Link to="/privacy" className="form-link">
                კონფიდენციალურობის პოლიტიკას
              </Link>
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all duration-300 hover:shadow-lg sm:col-span-2"
            >
              ანგარიშის შექმნა
              <CheckOutlined className="ml-2" />
            </button>
          </form>

          <div className="text-center mt-8">
            <p className="text-gray-600">
              უკვე გაქვთ ანგარიში?{' '}
              <Link to="/login" state={{ from }} className="form-link">
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
