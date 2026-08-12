import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import BrandLogo from "./BrandLogo";

export const Navbar = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Obtener iniciales para el avatar
  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-800 text-white px-6 py-3 flex items-center justify-between relative">
      {/* Brand / Logo */}
      <div className="flex items-center gap-2">
        <BrandLogo />
      </div>

      {/* Perfil & Acciones removed per branding request */}
    </nav>
  );
};
