import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { EyeOutlined, EyeInvisibleOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import Footer from '../../components/Footer';
import { useAuthStore } from '../../store/authStore';
import { notification } from 'antd';

type LoginFormInputs = {
  email: string;
  password: string;
};

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>();
  const { login: loginUser, error: authError } = useAuthStore();
  const [api, contextHolder] = notification.useNotification();
  const onSubmit: SubmitHandler<LoginFormInputs> = (data) => {
    loginUser(data.email, data.password);

    if (authError) {
      api['error']({
        message: 'შეცდომა',
        description: authError,
      });
    } else {
      navigate('/categories');
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
          <h2 className="auth-heading">შესვლა თქვენს ანგარიშზე</h2>
          <p className="auth-subheading">
            ან{' '}
            <Link to="/register" className="form-link">
              შექმენით ახალი ანგარიში
            </Link>
          </p>

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
                    // type="email"
                    autoComplete="email"
                    placeholder="თქვენი ელ-ფოსტა"
                    className={`form-input ${
                      errors.email ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
                    }`}
                    {...register('email', {
                      required: 'ელ-ფოსტა აუცილებელია',
                      // pattern: {
                      //   value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      //   message: 'არასწორი ელ-ფოსტის ფორმატი',
                      // },
                    })}
                  />
                </div>
                {errors.email && <p className="input-error">{errors.email.message}</p>}
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
                    autoComplete="current-password"
                    placeholder="თქვენი პაროლი"
                    className={`form-input ${
                      errors.password ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
                    }`}
                    {...register('password', {
                      required: 'პაროლი აუცილებელია',
                      // minLength: {
                      //   value: 6,
                      //   message: 'პაროლი უნდა შეიცავდეს მინიმუმ 6 სიმბოლოს',
                      // },
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
            </div>

            <div className="flex items-center justify-end">
              {/* <div className="checkbox-container">
                <input id="remember-me" name="remember-me" type="checkbox" className="checkbox" />
                <label htmlFor="remember-me" className="checkbox-label">
                  დამიმახსოვრე
                </label>
              </div> */}

              <div className="text-sm">
                <Link to="/forgot-password" className="form-link">
                  დაგავიწყდათ პაროლი?
                </Link>
              </div>
            </div>

            <div>
              <button type="submit" className="form-button">
                შესვლა
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default LoginPage;
