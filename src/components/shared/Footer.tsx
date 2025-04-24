import { Link } from "react-router-dom";
import Logo from "./Logo";

const Footer = () => {
  return (
    <footer className="bg-white border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Logo />
            <p className="mt-4 text-sm text-gray-600">
              Your AI-powered healthcare companion providing personalized
              medical assistance whenever you need it.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              FEATURES
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  to="/chatbot"
                  className="text-sm text-gray-600 hover:text-primary"
                >
                  Symptom Checker
                </Link>
              </li>
              <li>
                <Link
                  to="/chatbot"
                  className="text-sm text-gray-600 hover:text-primary"
                >
                  AI Chatbot
                </Link>
              </li>
              <li>
                <Link
                  to="/medical-reports"
                  className="text-sm text-gray-600 hover:text-primary"
                >
                  Medical Analysis
                </Link>
              </li>
              <li>
                <Link
                  to="/hospitals"
                  className="text-sm text-gray-600 hover:text-primary"
                >
                  Hospital Finder
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              COMPANY
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  to="/about"
                  className="text-sm text-gray-600 hover:text-primary"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/team"
                  className="text-sm text-gray-600 hover:text-primary"
                >
                  Team
                </Link>
              </li>
              <li>
                <Link
                  to="/careers"
                  className="text-sm text-gray-600 hover:text-primary"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  to="/press"
                  className="text-sm text-gray-600 hover:text-primary"
                >
                  Press
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              CONTACT
            </h3>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start">
                <svg
                  className="h-5 w-5 text-primary mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="ml-3 text-sm text-gray-600">
                  Sector 19, road, opp. Khandoba Temple Road, Sector 3, Airoli,
                  Navi Mumbai, Maharashtra 400708
                </span>
              </li>
              <li className="flex items-start">
                <svg
                  className="h-5 w-5 text-primary mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <span className="ml-3 text-sm text-gray-600">
                  (555) 123-4567
                </span>
              </li>
              <li className="flex items-start">
                <svg
                  className="h-5 w-5 text-primary mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span className="ml-3 text-sm text-gray-600">
                  support@aidoctor.example.com
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-200 pt-8">
          <p className="text-sm text-center text-gray-500">
            © 2023 AI Doctor Assistant. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
