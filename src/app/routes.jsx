import { lazy } from "react";
import { Navigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";

// ─── Auth Guard ───────────────────────────────────────────────────────────────
// Wraps any route element: if not logged in, redirects to /login and saves
// the intended path in location.state.redirect so Login can send them back.
function RequireAuth({ children }) {
    const location = useLocation();
    const userId = Cookies.get("userId");
    if (!userId) {
        return <Navigate to="/login" state={{ redirect: location.pathname }} replace />;
    }
    return children;
}

// Auth Feature
const Login = lazy(() => import("../features/auth/pages/Login"));
const Signup = lazy(() => import("../features/auth/pages/Signup"));
const ForgotPassword = lazy(() => import("../features/auth/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("../features/auth/pages/ResetPassword"));
const VerifyEmail = lazy(() => import("../features/auth/pages/VerifyEmail"));
const CompleteGoogleSignup = lazy(() => import("../features/auth/pages/CompleteGoogle"));

// Listings Feature
const Home = lazy(() => import("../features/listings/pages/Home"));
const Search = lazy(() => import("../features/listings/pages/Search"));
const HomeDetails = lazy(() => import("../features/listings/pages/HomeDetails"));
const CreateListing = lazy(() => import("../features/listings/pages/CreateListing"));
// New Host Onboarding (Route-based)
const HostAddressPage = lazy(() => import("../features/host/pages/HostAddressPage"));
const HostLocationPage = lazy(() => import("../features/host/pages/HostLocationPage"));
const HostDetailsPage = lazy(() => import("../features/host/pages/HostDetailsPage"));
const EditProperty = lazy(() => import("../features/listings/pages/EditProperty"));

// Travel Feature
const AiPlanner = lazy(() => import("../features/travel/pages/AiPlanner"));
const ItineraryEditorPage = lazy(() => import("../features/travel/pages/ItineraryEditorPage"));
const Trips = lazy(() => import("../features/travel/pages/Trips"));
const TripDetails = lazy(() => import("../features/travel/pages/TripDetails"));
const CreateTravelBuddy = lazy(() => import("../features/travel/pages/CreateTravelBuddy"));
const TravelBuddy = lazy(() => import("../features/travel/pages/TravelBuddy"));
const BuddySearch = lazy(() => import("../features/travel/pages/BuddySearch"));

// Host Feature
const HostDashboard = lazy(() => import("../features/host/pages/HostDashboard"));
const CrashpadAnalytics = lazy(() => import("../features/host/pages/CrashpadStats"));
const EditListingPage = lazy(() => import("../features/host/pages/EditListingPage"));
const EditCrashpad = lazy(() => import("../features/host/pages/EditCrashpad"));
const EditTravelBuddy = lazy(() => import("../features/travel/pages/EditTravelBuddy"));

// Crashpads Feature
const Crashpads = lazy(() => import("../features/crashpads/pages/Crashpads"));
const CrashpadDetails = lazy(() => import("../features/crashpads/pages/CrashpadDetails"));
const CreateCrashpad = lazy(() => import("../features/crashpads/pages/CreateCrashpad"));

// User Feature
const Profile = lazy(() => import("../features/user/pages/Profile"));
const BecomeHost = lazy(() => import("../features/user/pages/BecomeHost"));
const BecomeAHost = lazy(() => import("../features/user/pages/BecomeAHost"));
const MyBookings = lazy(() => import("../features/user/pages/MyBookings"));
const OldHostDashboard = lazy(() => import("../features/user/pages/HostDashboard"));
const Messages = lazy(() => import("../features/user/pages/Messages"));
const TravelBuddyDetail = lazy(() => import("../pages/TravelBuddyDetail"));
const PaymentPage = lazy(() => import("../pages/PaymentPage"));

// Admin Feature
const AdminRoute = lazy(() => import("../features/admin/pages/AdminRoute"));
const AdminLayout = lazy(() => import("../features/admin/pages/AdminLayout"));
const Dashboard = lazy(() => import("../features/admin/pages/Dashboard"));
const UsersTable = lazy(() => import("../features/admin/pages/UsersTable"));
const ListingsTable = lazy(() => import("../features/admin/pages/ListingsTable"));
const BookingsTable = lazy(() => import("../features/admin/pages/BookingsTable"));
const CouponsManager = lazy(() => import("../features/admin/pages/CouponsManager"));
const ActivityLogs = lazy(() => import("../features/admin/pages/ActivityLogs"));
const AdminSetup = lazy(() => import("../features/admin/pages/AdminSetup"));
const CreateAdmin = lazy(() => import("../features/admin/pages/CreateAdmin"));
const AdminAnalytics = lazy(() => import("../features/admin/pages/AdminAnalytics"));
const Reports = lazy(() => import("../features/admin/pages/Reports"));
const Payments = lazy(() => import("../features/admin/pages/Payments"));
const CrashpadsTable = lazy(() => import("../features/admin/pages/CrashpadsTable"));
const TravelBuddyTable = lazy(() => import("../features/admin/pages/TravelBuddyTable"));
const Notifications = lazy(() => import("../features/admin/pages/Notifications"));
const Support = lazy(() => import("../features/admin/pages/Support"));
const BulkUpload = lazy(() => import("../features/admin/pages/BulkUpload"));
const EmailCampaigns = lazy(() => import("../features/admin/pages/EmailCampaigns"));
const DevAdmin = lazy(() => import("../features/admin/pages/DevAdmin"));

import MainLayout from "../components/layout/MainLayout";

export const routes = [
    {
        path: "/",
        element: <MainLayout />,
        children: [
            { index: true, element: <Home /> },
            { path: "search", element: <Search /> },
            { path: "ai-planner", element: <AiPlanner /> },
            { path: "itinerary-editor", element: <ItineraryEditorPage /> },
            { path: "profile", element: <Profile /> },
            { path: "become-host", element: <BecomeHost /> },
            { path: "become-a-host", element: <RequireAuth><BecomeAHost /></RequireAuth> },
            { path: "homes/:id", element: <HomeDetails /> },
            { path: "bookings", element: <MyBookings /> },
            { path: "host-dashboard", element: <RequireAuth><HostDashboard /></RequireAuth> },
            { path: "host/dashboard", element: <RequireAuth><HostDashboard /></RequireAuth> },
            { path: "host/listings/:listingId/edit", element: <RequireAuth><EditListingPage /></RequireAuth> },
            { path: "messages", element: <Messages /> },
            { path: "checkout", element: <PaymentPage /> },
            { path: "trips", element: <Trips /> },
            { path: "trips/:id", element: <TripDetails /> },
            { path: "crashpads", element: <Crashpads /> },
            { path: "crashpads/:id", element: <CrashpadDetails /> },
            { path: "host/crashpad/:id/stats", element: <CrashpadAnalytics /> },
            { path: "host/crashpads/:id/edit", element: <RequireAuth><EditCrashpad /></RequireAuth> },
            { path: "host/travel-buddy/:id/edit", element: <RequireAuth><EditTravelBuddy /></RequireAuth> },
            { path: "travel-buddy", element: <TravelBuddy /> },
            { path: "travel-buddy/:id", element: <TravelBuddyDetail /> },
            { path: "travel-buddy/search", element: <BuddySearch /> },
        ]
    },
    { path: "/create-listing", element: <RequireAuth><CreateListing /></RequireAuth> },
    { path: "/host/address", element: <RequireAuth><HostAddressPage /></RequireAuth> },
    { path: "/host/location", element: <RequireAuth><HostLocationPage /></RequireAuth> },
    { path: "/host/details", element: <RequireAuth><HostDetailsPage /></RequireAuth> },
    { path: "/create-crashpad", element: <RequireAuth><CreateCrashpad /></RequireAuth> },
    { path: "/create-travel-buddy", element: <RequireAuth><CreateTravelBuddy /></RequireAuth> },
    { path: "/edit-property/:id", element: <RequireAuth><EditProperty /></RequireAuth> },
    { path: "/login", element: <Login /> },
    { path: "/signup", element: <Signup /> },
    { path: "/forgot-password", element: <ForgotPassword /> },
    { path: "/reset-password", element: <ResetPassword /> },
    { path: "/complete-google-signup", element: <CompleteGoogleSignup /> },
    { path: "/verify-email", element: <VerifyEmail /> },
    { path: "/dev-admin", element: <DevAdmin /> },
    {
        path: "/admin",
        element: <AdminRoute />,
        children: [
            { index: true, element: <Dashboard /> },
            { path: "users", element: <UsersTable /> },
            { path: "listings", element: <ListingsTable /> },
            { path: "bookings", element: <BookingsTable /> },
            { path: "coupons", element: <CouponsManager /> },
            { path: "logs", element: <ActivityLogs /> },
            { path: "setup", element: <AdminSetup /> },
            { path: "create-admin", element: <CreateAdmin /> },
            { path: "analytics", element: <AdminAnalytics /> },
            { path: "reports", element: <Reports /> },
            { path: "payments", element: <Payments /> },
            { path: "crashpads", element: <CrashpadsTable /> },
            { path: "travel-buddy", element: <TravelBuddyTable /> },
            { path: "bulk-upload", element: <BulkUpload /> },
            { path: "email-campaigns", element: <EmailCampaigns /> },
            { path: "notifications", element: <Notifications /> },
            { path: "support", element: <Support /> },
        ]
    }
];
