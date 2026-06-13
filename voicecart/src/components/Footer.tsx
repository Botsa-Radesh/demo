import React from 'react';

export function Footer() {
  return (
    <footer className="amazon-footer">
      <div className="amazon-footer-inner">
        <div>
          <h4>Get to Know Us</h4>
          <a href="#">About VoiceCart</a>
          <a href="#">Careers</a>
          <a href="#">Press Center</a>
        </div>
        <div>
          <h4>Make Money</h4>
          <a href="#">Sell on VoiceCart</a>
          <a href="#">Affiliate Program</a>
          <a href="#">Advertise</a>
        </div>
        <div>
          <h4>Let Us Help You</h4>
          <a href="#">Your Account</a>
          <a href="#">Your Orders</a>
          <a href="#">Shipping Rates</a>
          <a href="#">Returns</a>
        </div>
        <div>
          <h4>Connect</h4>
          <a href="#">Facebook</a>
          <a href="#">Twitter</a>
          <a href="#">Instagram</a>
        </div>
      </div>
      <div className="amazon-footer-bottom">
        <div className="header-logo-text" style={{ justifyContent: 'center', marginBottom: 8 }}>
          <span className="amazon">Voice</span>
          <span className="prime">Cart</span>
        </div>
        <div>© 2024-2025, VoiceCart by Amazon. All rights reserved.</div>
      </div>
    </footer>
  );
}
