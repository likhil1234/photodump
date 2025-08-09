# PhotoDump 📸

A secure client-side photo gallery application built with React and Supabase. This project allows users to securely log in, upload photos to a private gallery, manage their profile, and delete their images. A key feature is the rendering of all images onto HTML `<canvas>` elements to deter simple right-click downloading.

## ✨ Features

-   **Secure Authentication:** Google OAuth login handled by Supabase Auth.
-   **Profile Management:** Users can update their display name and profile picture (avatar).
-   **Photo Gallery:**
    -   Drag-and-drop or click to upload multiple images.
    -   Images are stored securely in a user-specific folder in Supabase Storage.
    -   Hover over an image to reveal a button to permanently delete it.
-   **Enhanced Security:**
    -   All gallery and avatar images are rendered on `<canvas>` elements to make direct downloading more difficult.
    -   Users are automatically logged out after 15 minutes of inactivity.
    -   Robust Row-Level Security (RLS) policies on the Supabase backend ensure users can only access and manage their own data.
-   **Responsive Design:** A clean, mobile-first interface styled with Tailwind CSS.

## 💻 Tech Stack

-   **Frontend:** React, Tailwind CSS
-   **Backend:** Supabase (Authentication, Postgres Database, Storage)
