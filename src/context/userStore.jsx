import React, { createContext, useContext, useState, useCallback } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { toast } from "react-toastify";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Function to fetch user information based on UID
  const fetchUserInfo = useCallback(async (uid) => {
    if (!uid) {
      setCurrentUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setCurrentUser(docSnap.data());
      } else {
        setCurrentUser(null);
      }
    } catch (err) {
      console.error("Error fetching user info:", err);
      toast.error("Failed to fetch user information.");
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <UserContext.Provider value={{ currentUser, isLoading, fetchUserInfo }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserStore = () => useContext(UserContext);
