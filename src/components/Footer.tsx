import { Link, useLocation } from 'react-router-dom';
import { TrophyOutlined, RightOutlined } from '@ant-design/icons';

const Footer = () => {
  const location = useLocation();

  // Check if we're on a quiz playing page
  const isQuizPlaying = location.pathname.startsWith('/quiz/play/');

  // If on quiz playing page, show simplified footer
  if (isQuizPlaying) {
    return (
      <footer className="bg-gray-100 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center text-gray-500 text-sm">© 2024 მუღამი. ყველა უფლება დაცულია.</div>
        </div>
      </footer>
    );
  }

  // Regular footer for other pages
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse delay-300"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10">
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Company Info */}
            <div className="lg:col-span-1">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-purple-500 rounded-full flex items-center justify-center mr-3">
                  <TrophyOutlined className="text-2xl text-white" />
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  მუღამი
                </h3>
              </div>
              <p className="text-gray-300 leading-relaxed mb-6">
                ქართული მუღამის ქვიზების პლატფორმა, სადაც შეგიძლიათ შეამოწმოთ ცოდნა და მოიგოთ ძვირფასი
                პრიზები.
              </p>

              {/* Social Links */}
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="w-10 h-10 bg-white/10 hover:bg-primary/20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                >
                  <span className="text-lg">📘</span>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-white/10 hover:bg-blue-500/20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                >
                  <span className="text-lg">🐦</span>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-white/10 hover:bg-pink-500/20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                >
                  <span className="text-lg">📷</span>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-white/10 hover:bg-red-500/20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                >
                  <span className="text-lg">📺</span>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">სწრაფი ლინკები</h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/"
                    className="text-gray-300 hover:text-primary transition-colors duration-300 flex items-center group"
                  >
                    <RightOutlined className="mr-2 text-xs group-hover:translate-x-1 transition-transform duration-300" />
                    მთავარი
                  </Link>
                </li>
                <li>
                  <Link
                    to="/categories"
                    className="text-gray-300 hover:text-primary transition-colors duration-300 flex items-center group"
                  >
                    <RightOutlined className="mr-2 text-xs group-hover:translate-x-1 transition-transform duration-300" />
                    კატეგორიები
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contests"
                    className="text-gray-300 hover:text-primary transition-colors duration-300 flex items-center group"
                  >
                    <RightOutlined className="mr-2 text-xs group-hover:translate-x-1 transition-transform duration-300" />
                    კონკურსები
                  </Link>
                </li>
                <li>
                  <Link
                    to="/leaderboard"
                    className="text-gray-300 hover:text-primary transition-colors duration-300 flex items-center group"
                  >
                    <RightOutlined className="mr-2 text-xs group-hover:translate-x-1 transition-transform duration-300" />
                    რეიტინგი
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">მხარდაჭერა</h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/help"
                    className="text-gray-300 hover:text-primary transition-colors duration-300 flex items-center group"
                  >
                    <RightOutlined className="mr-2 text-xs group-hover:translate-x-1 transition-transform duration-300" />
                    დახმარება
                  </Link>
                </li>
                <li>
                  <Link
                    to="/faq"
                    className="text-gray-300 hover:text-primary transition-colors duration-300 flex items-center group"
                  >
                    <RightOutlined className="mr-2 text-xs group-hover:translate-x-1 transition-transform duration-300" />
                    ხშირი კითხვები
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="text-gray-300 hover:text-primary transition-colors duration-300 flex items-center group"
                  >
                    <RightOutlined className="mr-2 text-xs group-hover:translate-x-1 transition-transform duration-300" />
                    კონტაქტი
                  </Link>
                </li>
                <li>
                  <Link
                    to="/privacy"
                    className="text-gray-300 hover:text-primary transition-colors duration-300 flex items-center group"
                  >
                    <RightOutlined className="mr-2 text-xs group-hover:translate-x-1 transition-transform duration-300" />
                    კონფიდენციალურობა
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">კონტაქტი</h4>
              <div className="space-y-4">
                <div className="flex items-center text-gray-300">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm">📧</span>
                  </div>
                  <span>info@mughami.ge</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm">📞</span>
                  </div>
                  <span>+995 32 2 123 456</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm">📍</span>
                  </div>
                  <span>თბილისი, საქართველო</span>
                </div>
              </div>

              {/* Newsletter */}
              <div className="mt-8">
                <h5 className="font-semibold mb-3 text-white">გამოწერა</h5>
                <div className="flex">
                  <input
                    type="email"
                    placeholder="თქვენი ელ. ფოსტა"
                    className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-l-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                  />
                  <button className="px-4 py-2 bg-gradient-to-r from-primary to-purple-500 rounded-r-lg hover:from-primary-dark hover:to-purple-600 transition-all duration-300">
                    <RightOutlined />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-gray-400 text-sm mb-4 md:mb-0">
                © 2024 მუღამი. ყველა უფლება დაცულია.
              </div>
              <div className="flex space-x-6">
                <Link
                  to="/terms"
                  className="text-gray-400 hover:text-white text-sm transition-colors duration-300"
                >
                  წესები და პირობები
                </Link>
                <Link
                  to="/privacy"
                  className="text-gray-400 hover:text-white text-sm transition-colors duration-300"
                >
                  კონფიდენციალურობა
                </Link>
                <Link
                  to="/cookies"
                  className="text-gray-400 hover:text-white text-sm transition-colors duration-300"
                >
                  ქუქი-ფაილები
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
