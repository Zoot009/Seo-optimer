"use client";

import { useState, useEffect } from 'react';
import { getAuthToken, getUser, logout } from '@/lib/auth-client';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  companyName?: string | null;
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication status on mount
    const token = getAuthToken();
    const userData = getUser();
    
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(userData);
    }
    
    setLoading(false);
  }, []);

  const logoutUser = () => {
    logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  return {
    isAuthenticated,
    user,
    loading,
    logout: logoutUser,
  };
}
