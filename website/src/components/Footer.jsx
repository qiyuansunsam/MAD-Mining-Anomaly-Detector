import React from 'react';
import { Mail, Github } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center">
          <div className="flex items-center space-x-6">
            <a
              href="mailto:qiyuansunsam@gmail.com"
              className="flex items-center space-x-2 text-gray-600 hover:text-accent transition-colors"
            >
              <Mail className="w-5 h-5" />
              <span>Contact</span>
            </a>
            <a
              href="https://github.com/qiyuansunsam/mad.io"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-gray-600 hover:text-accent transition-colors"
            >
              <Github className="w-5 h-5" />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
