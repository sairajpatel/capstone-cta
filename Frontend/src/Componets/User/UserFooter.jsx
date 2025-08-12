import React from "react";
import { Link } from "react-router-dom";
import { FaGooglePlay, FaApple, FaAccessibleIcon } from "react-icons/fa";

const UserFooter = () => {
  return (
    <footer className="bg-[#1c1b29] text-white py-10 px-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 text-sm mb-8">
        {/* Column 1 - Company Info */}
        <div>
          <h3 className="font-bold mb-2">Company Info</h3>
          <ul className="space-y-1 text-gray-300">
            <li>
              <Link to="/about" className="hover:text-white transition-colors">
                About Us
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-white transition-colors">
                Contact Us
              </Link>
            </li>
            <li>
              <Link to="/careers" className="hover:text-white transition-colors">
                Careers
              </Link>
            </li>
            <li>
              <Link to="/faqs" className="hover:text-white transition-colors">
                FAQs
              </Link>
            </li>
            <li>
              <Link to="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 2 - Help */}
        <div>
          <h3 className="font-bold mb-2">Help</h3>
          <ul className="space-y-1 text-gray-300">
            <li>
              <Link to="/support" className="hover:text-white transition-colors">
                Account Support
              </Link>
            </li>
            <li>
              <Link to="/organizer/signup" className="hover:text-white transition-colors">
                Listing Events
              </Link>
            </li>
            <li>
              <Link to="/ticketing-guide" className="hover:text-white transition-colors">
                Event Ticketing
              </Link>
            </li>
            <li>
              <Link to="/ticket-terms" className="hover:text-white transition-colors">
                Ticket Purchase Terms & Conditions
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3 - Categories */}
        <div>
          <h3 className="font-bold mb-2">Categories</h3>
          <ul className="space-y-1 text-gray-300">
            <li>
              <Link to="/events?category=MUSICAL_CONCERT" className="hover:text-white transition-colors">
                Concerts & Gigs
              </Link>
            </li>
            <li>
              <Link to="/events?category=CULTURAL_FESTIVAL" className="hover:text-white transition-colors">
                Festivals & Lifestyle
              </Link>
            </li>
            <li>
              <Link to="/events?category=CORPORATE_EVENT" className="hover:text-white transition-colors">
                Business & Networking
              </Link>
            </li>
            <li>
              <Link to="/events?category=FOOD_FESTIVAL" className="hover:text-white transition-colors">
                Food & Drinks
              </Link>
            </li>
            <li>
              <Link to="/events?category=THEATER_PLAY" className="hover:text-white transition-colors">
                Performing Arts
              </Link>
            </li>
            <li>
              <Link to="/events?category=SPORTS_EVENT" className="hover:text-white transition-colors">
                Sports & Outdoors
              </Link>
            </li>
            <li>
              <Link to="/events?category=EXHIBITION" className="hover:text-white transition-colors">
                Exhibitions
              </Link>
            </li>
            <li>
              <Link to="/events?category=WORKSHOP" className="hover:text-white transition-colors">
                Workshops, Conferences & Classes
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 4 - Social */}
        <div>
          <h3 className="font-bold mb-2">Follow Us</h3>
          <ul className="space-y-1 text-gray-300">
            <li>
              <a 
                href="https://facebook.com/gatherguru" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Facebook
              </a>
            </li>
            <li>
              <a 
                href="https://instagram.com/gatherguru" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Instagram
              </a>
            </li>
            <li>
              <a 
                href="https://twitter.com/gatherguru" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Twitter
              </a>
            </li>
            <li>
              <a 
                href="https://youtube.com/gatherguru" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Youtube
              </a>
            </li>
          </ul>
        </div>

        {/* Column 5 - Download App */}
        <div>
          <h3 className="font-bold mb-2">Download The App</h3>
          <div className="space-y-2">
            <button className="w-full flex items-center gap-2 justify-center border border-white text-white py-2 rounded-md hover:bg-white hover:text-black transition">
              <FaGooglePlay /> Get it on Google Play
            </button>
            <button className="w-full flex items-center gap-2 justify-center border border-white text-white py-2 rounded-md hover:bg-white hover:text-black transition">
              <FaApple /> Download on the App Store
            </button>
          </div>
        </div>
      </div>

      {/* Essential Links Row */}
      <div className="border-t border-gray-600 pt-6 pb-4">
        <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-400">
          <Link to="/privacy" className="hover:text-white transition-colors">
            Privacy Policy
          </Link>
          <span className="text-gray-600">|</span>
          <Link to="/terms" className="hover:text-white transition-colors">
            Terms of Service
          </Link>
          <span className="text-gray-600">|</span>
          <Link to="/accessibility" className="hover:text-white transition-colors flex items-center gap-2">
            <FaAccessibleIcon className="w-4 h-4" />
            Accessibility Policy
          </Link>
          <span className="text-gray-600">|</span>
          <Link to="/contact" className="hover:text-white transition-colors">
            Contact Us
          </Link>
        </div>
      </div>

      {/* Bottom Line */}
      <div className="border-t border-gray-600 pt-4 text-center text-gray-400 text-sm">
        ©2025 GatherGuru. All rights reserved.
      </div>
    </footer>
  );
};

export default UserFooter;
