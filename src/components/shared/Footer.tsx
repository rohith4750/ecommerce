import Link from "next/link";
import { Mail, Phone, MapPin, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-[#1A1A2E] text-gray-300 mt-auto border-t-2 border-brand-secondary">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand & Mission Statement */}
          <div className="flex flex-col space-y-4">
            <Link href="/" className="font-serif text-2xl font-bold tracking-wider text-white">
              SilkRoute
            </Link>
            <p className="text-xs text-gray-400 leading-relaxed font-sans">
              Dedicated to celebrating and preserving India's rich handloom weaving heritage. 
              We bring premium ethnic wear directly to your doorstep.
            </p>
            <div className="flex gap-2 text-xs text-gray-400">
              Made with <Heart className="w-3.5 h-3.5 text-brand-secondary fill-brand-secondary" /> for Indian Artisans
            </div>
          </div>

          {/* Quick Shopping Collections */}
          <div className="flex flex-col space-y-3">
            <h4 className="font-serif text-sm font-semibold tracking-wider text-brand-secondary">Shop Collections</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/products?category=Silk" className="hover:text-white transition-colors">
                  Pure Banarasi Silks
                </Link>
              </li>
              <li>
                <Link href="/products?category=Silk" className="hover:text-white transition-colors">
                  Kanjeevaram Wedding Wear
                </Link>
              </li>
              <li>
                <Link href="/products?category=Cotton" className="hover:text-white transition-colors">
                  Chanderi & Linen Cottons
                </Link>
              </li>
              <li>
                <Link href="/products?category=Georgette" className="hover:text-white transition-colors">
                  Artistic Georgette & Chiffon
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care / Support */}
          <div className="flex flex-col space-y-3">
            <h4 className="font-serif text-sm font-semibold tracking-wider text-brand-secondary">Customer Services</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/orders" className="hover:text-white transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-white transition-colors">
                  Checkout Cart
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-white transition-colors">
                  My Profile Settings
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Shipping & Return Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Contacts info & Newsletter sign-up */}
          <div className="flex flex-col space-y-3">
            <h4 className="font-serif text-sm font-semibold tracking-wider text-brand-secondary">Contact Us</h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-secondary" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-secondary" />
                <span>support@silkroute.in</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-secondary" />
                <span>Craft Loom Block, Hyderabad, India</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-12 border-t border-gray-800 pt-6 text-center text-xs text-gray-500">
          <p>SilkRoute © 2026 — All Rights Reserved. Empowering regional Indian artisans globally.</p>
        </div>
      </div>
    </footer>
  );
}
