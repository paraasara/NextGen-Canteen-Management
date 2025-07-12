
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ShoppingCart, User, LogOut, Settings, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { totalItems } = useCart();
  const { authState, signOut, profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Check if user is admin
  const isAdmin = profile?.role === 'admin' || ['admin@gmail.com', 'chinmayir30@gmail.com'].includes(authState.user?.email || '');

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/');
    }
  };

  return (
    <header className="bg-red-600 text-white shadow-md">
      <div className="container mx-auto flex justify-between items-center py-4 px-4 md:px-0">
        <Link to={authState.user ? "/home" : "/"} className="flex items-center gap-2">
          <div className="text-xl md:text-2xl font-bold flex items-center">
            <span>MVJ Canteen Management</span>
          </div>
        </Link>
        {/* Mobile menu button */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:text-white hover:bg-red-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4">
          {authState.user && (
            <>
              {!isAdmin && (
                <>
                  <Link to="/home" className="hover:underline">
                    Home
                  </Link>
                  <Link to="/menu" className="hover:underline">
                    Menu
                  </Link>
                  {/* Add My Orders link for non-admins */}
                  <Link to="/my-orders" className="hover:underline">
                    My Orders
                  </Link>
                  <Link to="/about" className="hover:underline">
                    About
                  </Link>
                  <Link to="/contact" className="hover:underline">
                    Contact
                  </Link>
                </>
              )}
              {isAdmin && (
                <>
                  <Link to="/admin/dashboard" className="hover:underline">
                    Admin Dashboard
                  </Link>
                  <Link to="/admin/menu-management" className="hover:underline">
                    Menu Management
                  </Link>
                </>
              )}
            </>
          )}
          <div className="flex items-center gap-2">
            {authState.user && !isAdmin && (
              <Link to="/cart">
                <Button
                  variant="outline"
                  className="bg-transparent text-white border-white hover:bg-red-700 hover:text-white transition-all relative"
                >
                  <ShoppingCart className="mr-1" size={18} />
                  Cart
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-yellow-400 text-black rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      {totalItems}
                    </span>
                  )}
                </Button>
              </Link>
            )}
            {authState.user ? (
              <>
                <Button
                  variant="outline"
                  className="bg-transparent text-white border-white hover:bg-red-700 hover:text-white transition-all"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-1" size={18} />
                  Logout
                </Button>
                {isAdmin && (
                  <Link to="/admin-setup">
                    <Button
                      variant="outline"
                      className="bg-transparent text-white border-white hover:bg-red-700 hover:text-white transition-all"
                    >
                      <Settings className="mr-1" size={18} />
                      Admin Setup
                    </Button>
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link to="/">
                  <Button
                    variant="outline"
                    className="bg-transparent text-white border-white hover:bg-red-700 hover:text-white transition-all"
                  >
                    <User className="mr-1" size={18} />
                    Login
                  </Button>
                </Link>
                <Link to="/admin-signup">
                  <Button
                    variant="outline"
                    className="bg-transparent text-white border-white hover:bg-red-700 hover:text-white transition-all"
                  >
                    <UserPlus className="mr-1" size={18} />
                    Admin Signup
                  </Button>
                </Link>
              </>
            )}
            {authState.user && !isAdmin && (
              <Link to="/menu">
                <Button className="bg-white text-red-600 hover:bg-gray-100 transition-all">
                  Online Order
                </Button>
              </Link>
            )}
          </div>
        </nav>
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden fixed inset-0 bg-black bg-opacity-70 z-50">
            <div className="bg-red-600 h-full w-3/4 p-4 flex flex-col">
              <div className="flex justify-between items-center mb-8">
                <Link to={authState.user ? "/home" : "/"} className="text-xl font-bold">
                  MVJ Canteen
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:text-white hover:bg-red-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <X size={24} />
                </Button>
              </div>
              <div className="flex flex-col gap-4">
                {authState.user && (
                  <>
                    {!isAdmin && (
                      <>
                        <Link to="/home" onClick={() => setIsMenuOpen(false)}>
                          Home
                        </Link>
                        <Link to="/menu" onClick={() => setIsMenuOpen(false)}>
                          Menu
                        </Link>
                        {/* Add My Orders link for non-admins on mobile */}
                        <Link to="/my-orders" onClick={() => setIsMenuOpen(false)}>
                          My Orders
                        </Link>
                        <Link to="/about" onClick={() => setIsMenuOpen(false)}>
                          About
                        </Link>
                        <Link to="/contact" onClick={() => setIsMenuOpen(false)}>
                          Contact
                        </Link>
                        <Link to="/cart" onClick={() => setIsMenuOpen(false)}>
                          Cart ({totalItems})
                        </Link>
                      </>
                    )}
                    {isAdmin && (
                      <>
                        <Link to="/admin/dashboard" onClick={() => setIsMenuOpen(false)}>
                          Admin Dashboard
                        </Link>
                        <Link to="/admin/menu-management" onClick={() => setIsMenuOpen(false)}>
                          Menu Management
                        </Link>
                      </>
                    )}
                  </>
                )}
                {authState.user ? (
                  <>
                    <Button
                      variant="ghost"
                      className="text-white justify-start p-0 hover:bg-transparent hover:underline"
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                    >
                      Logout
                    </Button>
                    {isAdmin && (
                      <Link to="/admin-setup" onClick={() => setIsMenuOpen(false)}>
                        Admin Setup
                      </Link>
                    )}
                  </>
                ) : (
                  <>
                    <Link to="/" onClick={() => setIsMenuOpen(false)}>
                      Login
                    </Link>
                    <Link to="/admin-signup" onClick={() => setIsMenuOpen(false)}>
                      Admin Signup
                    </Link>
                  </>
                )}
                {authState.user && !isAdmin && (
                  <Link to="/menu" onClick={() => setIsMenuOpen(false)}>
                    <Button className="bg-white text-red-600 hover:bg-gray-100 w-full mt-4">
                      Online Order
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
