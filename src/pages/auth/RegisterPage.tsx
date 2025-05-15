import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { Link } from 'react-router-dom';
import {
  EyeOutlined,
  EyeInvisibleOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
} from '@ant-design/icons';

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

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormInputs>();
  const password = watch('password', '');

  const onSubmit: SubmitHandler<RegisterFormInputs> = (data) => {
    console.log(data);
    // Handle registration logic here
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <div className="logo-container">
          <img src="/favicon.jpeg" alt="ლოგო" className="auth-logo" />
        </div>
        <h2 className="auth-heading">შექმენით თქვენი ანგარიში</h2>
        <p className="auth-subheading">
          ან{' '}
          <Link to="/login" className="form-link">
            შედით თქვენს ანგარიშზე
          </Link>
        </p>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md space-y-5">
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
                    pattern: {
                      value: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
                      message: 'არასწორი ტელეფონის ნომრის ფორმატი',
                    },
                  })}
                />
              </div>
              {errors.phoneNumber && <p className="input-error">{errors.phoneNumber.message}</p>}
            </div>

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
          </div>

          <div>
            <button type="submit" className="form-button">
              ანგარიშის შექმნა
            </button>
          </div>

          <div className="text-sm text-center">
            ანგარიშის შექმნით თქვენ ეთანხმებით ჩვენს{' '}
            <Link to="/terms" className="form-link">
              მომსახურების პირობებს
            </Link>{' '}
            და{' '}
            <Link to="/privacy" className="form-link">
              კონფიდენციალურობის პოლიტიკას
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
