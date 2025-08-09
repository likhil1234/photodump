// Filename: App.js
// Status: All features are working, ready for GitHub.
// Last updated: August 9, 2025, 2:41 PM

import { useState, useEffect, useRef, memo, createContext, useContext, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

// --- Supabase Client Setup ---
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- Auth Provider for Robust Session Management ---
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const inactivityTimerRef = useRef(null);

  const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes

  const handleSignOutDueToInactivity = () => {
    if (session) {
      console.log("Signing out due to inactivity.");
      supabase.auth.signOut();
    }
  };

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    inactivityTimerRef.current = setTimeout(
      handleSignOutDueToInactivity,
      INACTIVITY_TIMEOUT
    );
  }, [session]);

  useEffect(() => {
    if (!session) {
      return;
    }
    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
    resetInactivityTimer();
    activityEvents.forEach((event) => {
      window.addEventListener(event, resetInactivityTimer);
    });

    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetInactivityTimer);
      });
    };
  }, [session, resetInactivityTimer]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ session, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

// --- Helper Components ---
const PencilIcon = memo(() => (
  <svg className="w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" />
  </svg>
));

const SpinnerIcon = memo(() => (
  <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
));

const UploadIcon = memo(() => (
  <svg className="w-8 h-8 mb-4 text-[#6096B4] opacity-60" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
  </svg>
));

const WarningIcon = memo(() => (
  <svg className="w-5 h-5 inline-block mr-2 text-[#6096B4] opacity-80" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M8.257 3.099c.636-1.21 2.862-1.21 3.498 0l6.386 12.182c.636 1.21-.474 2.719-1.749 2.719H3.62c-1.275 0-2.385-1.509-1.749-2.719L8.257 3.099zM9 13a1 1 0 112 0 1 1 0 01-2 0zm1-6a1 1 0 00-1 1v3a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
));

const GoogleIcon = memo(() => (
  <svg className="w-5 h-5 inline-block mr-2" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#34A853" d="M46.98 24.55c0-1.7-.15-3.34-.43-4.92H24v9.36h12.88c-.56 2.98-2.26 5.5-4.78 7.18l7.73 6c4.51-4.16 7.15-10.3 7.15-17.62z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.97-2.9-.97-6.04 0-8.94l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.54l7.97-6.95z" />
    <path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
));

const TrashIcon = memo(() => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
));

// --- Core Components ---
const SecureImage = ({ imageUrl }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!imageUrl || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = "Anonymous";

    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);
    };

    img.onerror = () => {
      canvas.width = 300;
      canvas.height = 200;
      ctx.fillStyle = "#EEE9DA";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#6096B4";
      ctx.font = "16px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Image failed to load", canvas.width / 2, canvas.height / 2);
    };

    img.src = imageUrl;
  }, [imageUrl]);

  const handleContextMenu = (e) => e.preventDefault();

  return (
    <div onContextMenu={handleContextMenu} className="relative w-full bg-[#BDCDD6] rounded-lg overflow-hidden shadow-md group" style={{ WebkitTouchCallout: 'none', userSelect: 'none' }}>
      <canvas ref={canvasRef} className="block w-full h-auto" aria-label="Uploaded image" />
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(45deg, rgba(0,0,0,0.005) 25%, transparent 25%), linear-gradient(-45deg, rgba(0,0,0,0.005) 25%, transparent 25%)', backgroundSize: '8px 8px' }}></div>
    </div>
  );
};

const PhotoViewerModal = ({ image, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-[#6096B4] bg-opacity-80 flex items-center justify-center z-50 p-4 animate-fade-in cursor-pointer" onClick={onClose}>
      <div className="relative w-auto max-w-[95vw] max-h-[95vh] overflow-auto">
        <SecureImage imageUrl={image.publicUrl} />
      </div>
    </div>
  );
};

const Uploader = ({ onUpload, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(Array.from(e.target.files));
    }
  };

  const handleDrag = (e, isDraggingOver) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(isDraggingOver);
  };

  const handleDrop = (e) => {
    handleDrag(e, false);
    if (!disabled && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUpload(Array.from(e.dataTransfer.files));
      e.dataTransfer.clearData();
    }
  };

  const openFileDialog = () => {
    if (!disabled) fileInputRef.current.click();
  };

  return (
    <div className={`flex items-center justify-center w-full mb-8 ${disabled ? 'cursor-not-allowed' : ''}`} onDragEnter={(e) => handleDrag(e, true)} onDragLeave={(e) => handleDrag(e, false)} onDragOver={(e) => handleDrag(e, true)} onDrop={handleDrop}>
      <label onClick={openFileDialog} className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg transition-colors ${disabled ? 'bg-gray-200 border-gray-300' : isDragging ? 'border-[#6096B4] bg-[#93bfcf44]' : 'border-[#93BFCF] hover:border-[#6096B4] hover:bg-[#bdcdd633] cursor-pointer'}`}>
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
          <UploadIcon />
          <p className={`mb-2 text-sm ${disabled ? 'text-gray-400' : 'text-[#6096B4]'}`}>
            {disabled ? 'Loading...' : <><span className="font-semibold">Click to upload</span> or drag and drop</>}
          </p>
          <p className={`text-xs ${disabled ? 'text-gray-400' : 'text-[#6096B4] opacity-70'}`}>Any image format (PNG, JPG, GIF, etc.)</p>
        </div>
        <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} accept="image/*" multiple disabled={disabled} />
      </label>
    </div>
  );
};

const ProfileSection = ({ user, onUpdateProfile, onUpdateAvatar, isUploadingAvatar }) => {
  const [displayName, setDisplayName] = useState(user.display_name || '');
  const [isEditing, setIsEditing] = useState(false);
  const avatarInputRef = useRef(null);

  useEffect(() => {
    setDisplayName(user.display_name || '');
  }, [user.display_name]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onUpdateProfile({ display_name: displayName });
    setIsEditing(false);
  };

  const handleAvatarClick = () => {
    if (isEditing && !isUploadingAvatar) {
      avatarInputRef.current.click();
    }
  };

  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpdateAvatar(e.target.files[0]);
    }
  };

  return (
    <div className="p-4 mb-10 border border-[#93BFCF] bg-[#bdcdd644] rounded-lg text-[#6096B4]">
      <h3 className="font-bold text-lg mb-2">Your Profile</h3>
      <div className="flex items-center space-x-4">
        <div className="relative">
          <div
            className={`w-16 h-16 rounded-full group ${isEditing ? 'cursor-pointer' : ''}`}
            onClick={handleAvatarClick}
            title={isEditing ? 'Change photo' : ''}
          >
            {user.photo_url ? (
              <img
                src={user.photo_url}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover"
                onError={(e) => { e.target.src = 'https://placehold.co/64x64/BDCDD6/6096B4?text=??'; }}
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[#BDCDD6] flex items-center justify-center text-[#6096B4] font-bold text-xl">
                {user.display_name ? user.display_name[0].toUpperCase() : 'U'}
              </div>
            )}
            {isEditing && (
              <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <PencilIcon />
              </div>
            )}
          </div>
          {isUploadingAvatar && (
            <div className="absolute inset-0 bg-black bg-opacity-60 rounded-full flex items-center justify-center">
              <SpinnerIcon />
            </div>
          )}
          <input
            type="file"
            ref={avatarInputRef}
            className="hidden"
            onChange={handleAvatarChange}
            accept="image/png, image/jpeg, image/gif"
            disabled={isUploadingAvatar}
          />
        </div>

        <div>
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-2">
              <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Display Name" className="w-full p-2 border border-[#93BFCF] rounded text-[#6096B4] bg-[#EEE9DA]" required />
              <div className="flex space-x-2">
                <button type="submit" className="px-4 py-2 bg-[#6096B4] text-[#EEE9DA] rounded hover:bg-[#93BFCF] transition-colors">Save</button>
                <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 bg-[#BDCDD6] text-[#6096B4] rounded hover:bg-[#93BFCF] transition-colors">Cancel</button>
              </div>
            </form>
          ) : (
            <div>
              <p><strong>User Name:</strong> {user.display_name || 'Not set'}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <button onClick={() => setIsEditing(true)} className="mt-2 px-4 py-2 bg-[#6096B4] text-[#EEE9DA] rounded hover:bg-[#93BFCF] transition-colors">Edit Profile</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Main App Logic Component ---
const AppContent = () => {
  const { session } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      if (session) {
        setIsLoading(true);
        await fetchProfile(session.user);
        await fetchImages(session.user.id);
        setIsLoading(false);
      } else {
        setUserProfile(null);
        setImages([]);
        setIsLoading(false);
      }
    };
    loadUserData();
  }, [session]);

  const fetchProfile = async (user) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, email, photo_url, updated_at')
        .eq('id', user.id);
      if (error) throw error;
      const existingProfile = data && data.length > 0 ? data[0] : null;
      if (existingProfile) {
        setUserProfile(existingProfile);
      } else {
        const newProfileData = {
          id: user.id,
          display_name: user.user_metadata.full_name || user.user_metadata.name || user.email.split('@')[0] || 'User',
          email: user.email,
          photo_url: user.user_metadata.avatar_url || user.user_metadata.picture || null,
        };
        const { data: upsertedData, error: insertError } = await supabase
          .from('profiles').upsert(newProfileData).select().single();
        if (insertError) throw insertError;
        setUserProfile(upsertedData);
      }
    } catch (err) {
      console.error("Error in fetchProfile:", err);
      setError(`Profile fetch/create failed: ${err.message}`);
    }
  };

  const updateProfile = async ({ display_name }) => {
    try {
      const { error } = await supabase.from('profiles').update({ display_name, updated_at: new Date().toISOString() }).eq('id', session.user.id);
      if (error) throw error;
      setUserProfile((prev) => ({ ...prev, display_name }));
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(`Profile update failed: ${err.message}`);
    }
  };

  const updateAvatar = async (file) => {
    if (!file) return;

    try {
      setIsUploadingAvatar(true);
      setError(null);

      const fileExt = file.name.split('.').pop();
      const filePath = `${session.user.id}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const cacheBustedUrl = `${publicUrl}?t=${new Date().getTime()}`;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ photo_url: cacheBustedUrl, updated_at: new Date().toISOString() })
        .eq('id', session.user.id);

      if (updateError) {
        throw updateError;
      }

      setUserProfile((prev) => ({ ...prev, photo_url: cacheBustedUrl }));

    } catch (err) {
      console.error("A detailed error occurred during avatar update:", err);
      setError(`Upload failed. Check the console for details. Message: ${err.message}`);
    } finally {
      setIsUploadingAvatar(false);
    }
  };


  const fetchImages = async (userId) => {
    setError(null);
    try {
      const { data: fileList, error: listError } = await supabase.storage.from('photos').list(userId, { limit: 100, offset: 0, sortBy: { column: 'created_at', order: 'desc' } });
      if (listError) throw listError;
      const imageUrls = await Promise.all(
        fileList.map(async (file) => {
          const { data, error } = await supabase.storage.from('photos').createSignedUrl(`${userId}/${file.name}`, 60);
          if (error) {
            console.error(`Error creating signed URL for ${file.name}:`, error);
            return null;
          }
          return { id: file.id, name: file.name, publicUrl: data.signedUrl };
        })
      );
      setImages(imageUrls.filter(Boolean));
    } catch (err) {
      console.error("Error in fetchImages:", err);
      setError(`Image fetch failed: ${err.message}`);
    }
  };

  const deleteImage = async (imageToDelete) => {
    if (!window.confirm("Are you sure you want to permanently delete this photo?")) {
      return;
    }

    try {
      setError(null);
      const filePath = `${session.user.id}/${imageToDelete.name}`;

      const { error: deleteError } = await supabase.storage.from('photos').remove([filePath]);

      if (deleteError) {
        throw deleteError;
      }

      setImages(currentImages => currentImages.filter(img => img.id !== imageToDelete.id));

    } catch (err) {
      console.error("Error deleting image:", err);
      setError(`Failed to delete image: ${err.message}`);
    }
  };

  const handleUpload = async (newFiles) => {
    if (!session) return;
    const userId = session.user.id;
    setIsLoading(true);
    setError(null);
    try {
      await Promise.all(newFiles.map(file => {
        const filePath = `${userId}/${Date.now()}-${file.name}`;
        return supabase.storage.from('photos').upload(filePath, file, { contentType: file.type, upsert: false });
      }));
      await fetchImages(userId);
    } catch (err) {
      console.error("Error uploading file:", err);
      setError(`Upload failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true);
      setError(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
      });
      if (error) throw error;
    } catch (err) {
      console.error("Error signing in with Google:", err);
      setError(`Sign-in failed: ${err.message}`);
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Error signing out:", err);
      setError(`Sign-out failed: ${err.message}`);
    }
  };

  const handleCloseModal = () => setSelectedImage(null);

  if (!session) {
    return (
      <div className="text-center py-16">
        <button onClick={handleGoogleSignIn} disabled={isSigningIn} className={`flex items-center justify-center mx-auto px-6 py-3 rounded-lg transition-colors ${isSigningIn ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#4285F4] text-white hover:bg-[#357ae8]'}`}>
          <GoogleIcon />
          {isSigningIn ? 'Signing in...' : 'Sign in with Google'}
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <button onClick={handleSignOut} className="px-4 py-2 bg-[#6096B4] text-[#EEE9DA] rounded hover:bg-[#93BFCF] transition-colors">Sign Out</button>
      </div>
      {userProfile ? (
        <ProfileSection
          user={userProfile}
          onUpdateProfile={updateProfile}
          onUpdateAvatar={updateAvatar}
          isUploadingAvatar={isUploadingAvatar}
        />
      ) : (
        <div className="text-center p-4 mb-10 border border-[#93BFCF] bg-[#bdcdd644] rounded-lg text-[#6096B4]">Loading profile...</div>
      )}
      <Uploader onUpload={handleUpload} disabled={isLoading} />
      {error && (
        <div className="p-4 mb-10 border border-red-400 bg-red-100 rounded-lg text-red-600">
          <h3 className="font-bold flex items-center"><WarningIcon />Error</h3>
          <p className="text-sm mt-1 pl-7">{error}</p>
        </div>
      )}
      <div className="p-4 mb-10 border border-[#93BFCF] bg-[#bdcdd644] rounded-lg text-[#6096B4]">
        <h3 className="font-bold flex items-center"><WarningIcon />Security Notice</h3>
        <p className="text-sm mt-1 pl-7">This tool uses several methods to make it difficult to download images. However, <b>no browser-based protection is foolproof.</b> This tool provides a deterrent, not absolute security.</p>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-[#93BFCF] opacity-70">Loading images...</div>
      ) : images.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {images.map(image => (
            <div key={image.id} className="group relative transform hover:scale-105 transition-transform duration-300">
              <div className="cursor-pointer" onClick={() => setSelectedImage(image)}>
                <SecureImage imageUrl={image.publicUrl} />
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteImage(image);
                }}
                className="absolute top-2 right-2 z-10 p-2 bg-red-600 bg-opacity-75 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                title="Delete Photo"
              >
                <TrashIcon />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-[#93BFCF] opacity-70">You haven't uploaded any photos yet. Drag and drop to get started!</p>
        </div>
      )}
      {selectedImage && (
        <PhotoViewerModal image={selectedImage} onClose={handleCloseModal} />
      )}
    </>
  );
};

// --- Main App Component (Wrapper) ---
export default function App() {
  return (
    <AuthProvider>
      <div className="bg-[#EEE9DA] text-[#6096B4] min-h-screen font-sans">
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
          <header className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl font-bold text-[#6096B4]">PhotoDump</h1>
            <p className="text-[#93BFCF] opacity-80 mt-2">Securely preview your photos.</p>
          </header>
          <main>
            <AppContent />
          </main>
          <footer className="text-center mt-16 py-6 border-t border-[#BDCDD6]">
            <p className="text-sm text-[#6096B4] opacity-70">© 2025 PhotoDump.</p>
          </footer>
        </div>
      </div>
    </AuthProvider>
  );
}