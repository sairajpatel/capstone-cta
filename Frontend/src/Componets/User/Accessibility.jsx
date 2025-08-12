import React from 'react';
import { Link } from 'react-router-dom';
import UserNavbar from './UserNavbar';
import UserFooter from './UserFooter';
import TextSizeControls from './TextSizeControls';
import { FaUniversalAccess, FaKeyboard, FaEye, FaVolumeUp, FaHandPaper, FaBrain, FaMobile, FaDesktop } from 'react-icons/fa';

const Accessibility = () => {
  return (
    <div className="min-h-screen bg-[#1C1B29]">
      <UserNavbar />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <FaUniversalAccess className="text-6xl text-blue-500" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Accessibility Policy</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            GatherGuru is committed to ensuring digital accessibility for people with disabilities. 
            We are continually improving the user experience for everyone and applying the relevant 
            accessibility standards.
          </p>
        </div>

        {/* Accessibility Standards */}
        <section className="bg-[#2B293D] rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <FaUniversalAccess className="text-blue-500" />
            Accessibility Standards
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#1C1B29] p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-white mb-3">WCAG 2.1 AA Compliance</h3>
              <p className="text-gray-300">
                Our platform strives to meet Web Content Accessibility Guidelines (WCAG) 2.1 AA standards, 
                ensuring a high level of accessibility for users with various disabilities.
              </p>
            </div>
            <div className="bg-[#1C1B29] p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-white mb-3">Section 508 Compliance</h3>
              <p className="text-gray-300">
                We follow Section 508 standards to ensure our digital content is accessible to federal 
                employees and the public with disabilities.
              </p>
            </div>
          </div>
        </section>

        {/* Accessibility Features */}
        <section className="bg-[#2B293D] rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Accessibility Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-[#1C1B29] p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <FaKeyboard className="text-2xl text-blue-500" />
                <h3 className="text-lg font-semibold text-white">Keyboard Navigation</h3>
              </div>
              <p className="text-gray-300 text-sm">
                Full keyboard accessibility with logical tab order, focus indicators, and keyboard shortcuts.
              </p>
            </div>
            
            <div className="bg-[#1C1B29] p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <FaEye className="text-2xl text-green-500" />
                <h3 className="text-lg font-semibold text-white">Visual Accessibility</h3>
              </div>
              <p className="text-gray-300 text-sm">
                High contrast ratios, resizable text, and clear visual hierarchy for better readability.
              </p>
            </div>
            
            <div className="bg-[#1C1B29] p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <FaVolumeUp className="text-2xl text-purple-500" />
                <h3 className="text-lg font-semibold text-white">Screen Reader Support</h3>
              </div>
              <p className="text-gray-300 text-sm">
                Proper ARIA labels, semantic HTML, and descriptive alt text for screen readers.
              </p>
            </div>
            
            <div className="bg-[#1C1B29] p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <FaHandPaper className="text-2xl text-orange-500" />
                <h3 className="text-lg font-semibold text-white">Touch Accessibility</h3>
              </div>
              <p className="text-gray-300 text-sm">
                Touch-friendly interface with appropriate touch target sizes and gesture support.
              </p>
            </div>
            
            <div className="bg-[#1C1B29] p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <FaBrain className="text-2xl text-pink-500" />
                <h3 className="text-lg font-semibold text-white">Cognitive Accessibility</h3>
              </div>
              <p className="text-gray-300 text-sm">
                Clear language, consistent navigation, and predictable user interface patterns.
              </p>
            </div>
            
            <div className="bg-[#1C1B29] p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <FaMobile className="text-2xl text-cyan-500" />
                <h3 className="text-lg font-semibold text-white">Responsive Design</h3>
              </div>
              <p className="text-gray-300 text-sm">
                Mobile-first design that works seamlessly across all devices and screen sizes.
              </p>
            </div>
          </div>
        </section>

        {/* Text Size Controls */}
        <section className="bg-[#2B293D] rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Text Size Controls</h2>
          <div className="bg-[#1C1B29] p-6 rounded-lg">
            <p className="text-gray-300 mb-4">
              Users can adjust text size using browser controls or our built-in text size controls 
              available in the user dashboard. We support text scaling from 70% to 150% without 
              loss of functionality. Try the controls below:
            </p>
            <div className="flex justify-center">
              <TextSizeControls />
            </div>
            <div className="mt-4 text-center text-sm text-gray-400">
              <p>Current text size: <span className="font-semibold text-white">Adjustable from 70% to 150%</span></p>
              <p className="mt-2">These controls affect the entire platform and are saved to your preferences</p>
            </div>
          </div>
        </section>

        {/* Color and Contrast */}
        <section className="bg-[#2B293D] rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Color and Contrast</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#1C1B29] p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-white mb-3">High Contrast</h3>
              <p className="text-gray-300">
                Our platform maintains a minimum contrast ratio of 4.5:1 for normal text and 3:1 for large text, 
                ensuring readability for users with visual impairments.
              </p>
            </div>
            <div className="bg-[#1C1B29] p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-white mb-3">Color Independence</h3>
              <p className="text-gray-300">
                Information is not conveyed solely through color. We use multiple visual cues including 
                icons, text, and patterns to ensure accessibility.
              </p>
            </div>
          </div>
        </section>

        {/* Assistive Technologies */}
        <section className="bg-[#2B293D] rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Assistive Technologies</h2>
          <div className="bg-[#1C1B29] p-6 rounded-lg">
            <p className="text-gray-300 mb-4">
              GatherGuru is compatible with the following assistive technologies:
            </p>
            <ul className="grid md:grid-cols-2 gap-4 text-gray-300">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Screen readers (JAWS, NVDA, VoiceOver, TalkBack)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Voice recognition software
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Switch navigation devices
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Magnification software
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                High contrast mode
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Keyboard-only navigation
              </li>
            </ul>
          </div>
        </section>

        {/* Contact Information */}
        <section className="bg-[#2B293D] rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Contact Us for Accessibility Support</h2>
          <div className="bg-[#1C1B29] p-6 rounded-lg">
            <p className="text-gray-300 mb-4">
              If you experience any accessibility barriers or have suggestions for improvement, 
              please contact our accessibility team:
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Email</h3>
                <a 
                  href="mailto:accessibility@gatherguru.ca" 
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  accessibility@gatherguru.ca
                </a>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Phone</h3>
                <a 
                  href="tel:+1-800-GATHER" 
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  1-800-GATHER
                </a>
              </div>
            </div>
            <div className="mt-6">
              <Link 
                to="/contact" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </section>

        {/* Continuous Improvement */}
        <section className="bg-[#2B293D] rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Continuous Improvement</h2>
          <div className="bg-[#1C1B29] p-6 rounded-lg">
            <p className="text-gray-300 mb-4">
              We are committed to continuously improving the accessibility of our platform. 
              Our accessibility team regularly reviews and updates our accessibility features 
              based on user feedback and evolving standards.
            </p>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-400">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500 mb-2">Monthly</div>
                <div>Accessibility Audits</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500 mb-2">Quarterly</div>
                <div>User Testing</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-500 mb-2">Annually</div>
                <div>Standards Review</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <UserFooter />
    </div>
  );
};

export default Accessibility;
