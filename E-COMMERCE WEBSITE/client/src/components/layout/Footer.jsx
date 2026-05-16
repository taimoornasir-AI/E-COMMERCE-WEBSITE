import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Youtube, ArrowRight } from 'lucide-react';

const footerLinks = {
  Shop: [
    { label: 'New Arrivals', href: '/products?sort=newest' },
    { label: 'Bestsellers', href: '/products?sort=bestSelling' },
    { label: 'Sale', href: '/products?sale=true' },
    { label: 'All Products', href: '/products' },
  ],
  Account: [
    { label: 'My Account', href: '/account' },
    { label: 'Order History', href: '/account/orders' },
    { label: 'Wishlist', href: '/wishlist' },
    { label: 'Cart', href: '/cart' },
  ],
  Support: [
    { label: 'Shipping & Returns', href: '#' },
    { label: 'Size Guide', href: '#' },
    { label: 'FAQ', href: '#' },
    { label: 'Contact Us', href: '#' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-base-surface border-t border-base-border mt-auto">
      {/* Newsletter */}
      <div className="border-b border-base-border">
        <div className="container-page py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="section-label mb-2">Stay in the loop</p>
              <h3 className="font-serif text-2xl text-text">Subscribe to our newsletter</h3>
              <p className="text-text-muted text-sm mt-1">Early access to new collections and exclusive offers.</p>
            </div>
            <form className="flex gap-2 w-full md:w-auto" onSubmit={e => e.preventDefault()}>
              <input
                type="email"
                placeholder="your@email.com"
                className="input flex-1 md:w-72"
              />
              <button type="submit" className="btn-primary flex-shrink-0">
                <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="container-page py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="font-serif text-xl text-text hover:text-accent transition-colors">
              Luxe<span className="text-accent">Shop</span>
            </Link>
            <p className="text-text-muted text-sm mt-3 leading-relaxed max-w-xs">
              Curated luxury fashion for the modern wardrobe. Quality over quantity, always.
            </p>
            <div className="flex items-center gap-3 mt-5">
              {[
                { icon: Instagram, href: '#', label: 'Instagram' },
                { icon: Twitter, href: '#', label: 'Twitter' },
                { icon: Youtube, href: '#', label: 'YouTube' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded border border-base-border flex items-center justify-center text-text-muted hover:text-accent hover:border-accent transition-all duration-200"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-xs font-semibold text-text uppercase tracking-widest mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {links.map(link => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-text-muted hover:text-text transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-base-border">
        <div className="container-page py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-text-subtle text-xs">
            © {new Date().getFullYear()} LuxeShop. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-text-subtle">
            <a href="#" className="hover:text-text-muted transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-text-muted transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
