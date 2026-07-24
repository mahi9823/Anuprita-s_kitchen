import React from 'react';
import { Utensils, Calculator, ShoppingBag, MessageSquare } from 'lucide-react';

export default function BottomNav({ activeTab, setActiveTab, cartCount, lang, isOwnerMode }) {
  const handleChatWithOwner = () => {
    const text = encodeURIComponent(
      lang === 'en' 
        ? "Hello Anuprita's Kitchen! I would like to inquire about a custom veg dish that is not listed in the menu." 
        : "नमस्कार अनुप्रिताज किचन! मला मेनूमध्ये नसलेल्या दुसऱ्या खास शाकाहारी पदार्थाबाबत चौकशी करायची आहे."
    );
    window.open(`https://wa.me/919403276767?text=${text}`, '_blank');
  };

  return (
    <nav className="bottom-nav">
      <button 
        className={`nav-item ${activeTab === 'menu' && !isOwnerMode ? 'active' : ''}`}
        onClick={() => setActiveTab('menu')}
      >
        <Utensils size={20} />
        <span>{lang === 'mr' ? 'घरगुती मेनू' : 'Home Menu'}</span>
      </button>

      <button 
        className={`nav-item ${activeTab === 'catering' && !isOwnerMode ? 'active' : ''}`}
        onClick={() => setActiveTab('catering')}
      >
        <Calculator size={20} />
        <span>{lang === 'mr' ? 'कॅटरिंग मोजणी' : 'Catering Calc'}</span>
      </button>

      <button 
        className={`nav-item ${activeTab === 'cart' && !isOwnerMode ? 'active' : ''}`}
        onClick={() => setActiveTab('cart')}
      >
        <div style={{ position: 'relative' }}>
          <ShoppingBag size={20} />
          {cartCount > 0 && <span className="cart-count-badge">{cartCount}</span>}
        </div>
        <span>{lang === 'mr' ? 'माझी बास्केट' : 'Basket'}</span>
      </button>

      {/* REPLACED OWNER TAB WITH CHAT WITH OWNER WHATSAPP INQUIRY */}
      <button 
        className="nav-item"
        onClick={handleChatWithOwner}
        style={{ color: '#25D366' }}
      >
        <MessageSquare size={20} />
        <span style={{ fontWeight: 800 }}>{lang === 'mr' ? 'मालकाशी चॅट' : 'Chat Owner'}</span>
      </button>
    </nav>
  );
}
