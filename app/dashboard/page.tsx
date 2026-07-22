"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ComponentType,
} from "react";
import {
  onAuthStateChanged,
  signOut,
  type User,
} from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import {
  ArrowRight,
  Bell,
  Building2,
  CalendarCheck2,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Eye,
  Heart,
  Home,
  IndianRupee,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Mail,
  MapPin,
  MessageCircle,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  UserRound,
  X,
  XCircle,
} from "lucide-react";

import { auth, db } from "@/lib/firebase";

type Property = {
  id: string;
  title: string;
  location: string;
  rent: string | number;
  type: string;
  contact: string;
  ownerId?: string;
  ownerEmail?: string;
  imageUrl?: string;
  imageUrls?: string[];
  status?: string;
  views?: number;
};

type VisitRequest = {
  id: string;
  propertyId: string;
  propertyTitle: string;
  name: string;
  phone: string;
  visitDate: string;
  visitTime: string;
  message: string;
  status: "Pending" | "Accepted" | "Rejected";
  userId: string;
  userEmail: string;
};

type StatCardProps = {
  title: string;
  value: number;
  helper: string;
  icon: ComponentType<{
    size?: number;
    className?: string;
  }>;
  iconClassName: string;
  iconBackground: string;
};

type QuickAction = {
  title: string;
  description: string;
  href: string;
  icon: ComponentType<{
    size?: number;
    className?: string;
  }>;
  iconBackground: string;
  iconColor: string;
};

function normalizeStatus(
  value: unknown
): "Pending" | "Accepted" | "Rejected" {
  const status = String(value || "").trim().toLowerCase();

  if (status === "accepted") {
    return "Accepted";
  }

  if (status === "rejected") {
    return "Rejected";
  }

  return "Pending";
}

function getPropertyImage(property: Property) {
  if (Array.isArray(property.imageUrls)) {
    const firstImage = property.imageUrls.find(
      (image) => typeof image === "string" && image.trim().length > 0
    );

    if (firstImage) {
      return firstImage;
    }
  }

  if (
    typeof property.imageUrl === "string" &&
    property.imageUrl.trim().length > 0
  ) {
    return property.imageUrl;
  }

  return "";
}

function formatRent(value: string | number) {
  const numericValue = Number(
    String(value || "")
      .replace(/,/g, "")
      .replace(/[^\d.]/g, "")
  );

  if (!Number.isFinite(numericValue)) {
    return String(value || "0");
  }

  return new Intl.NumberFormat("en-IN").format(numericValue);
}

function StatCard({
  title,
  value,
  helper,
  icon: Icon,
  iconClassName,
  iconBackground,
}: StatCardProps) {
  return (
    <article className="rounded-[24px] border border-slate-200/80 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-bold text-slate-500 sm:text-sm">
            {title}
          </p>

          <p className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            {value}
          </p>

          <p className="mt-1 line-clamp-1 text-[11px] font-medium text-slate-400 sm:text-xs">
            {helper}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl sm:h-12 sm:w-12 ${iconBackground}`}
        >
          <Icon size={22} className={iconClassName} />
        </div>
      </div>
    </article>
  );
}

export default function DashboardPage() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [visitRequests, setVisitRequests] = useState<VisitRequest[]>([]);

  const [totalFavorites, setTotalFavorites] = useState(0);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const [totalMessages, setTotalMessages] = useState(0);

  const [authLoading, setAuthLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [deletingPropertyId, setDeletingPropertyId] = useState<string | null>(
    null
  );

  const [updatingRequestId, setUpdatingRequestId] = useState<string | null>(
    null
  );

  const [error, setError] = useState("");

  const fetchVisitRequests = useCallback(
    async (propertyList: Property[]) => {
      if (propertyList.length === 0) {
        setVisitRequests([]);
        return;
      }

      try {
        const visitSnapshot = await getDocs(
          collection(db, "visitRequests")
        );

        const propertyMap = new Map(
          propertyList.map((property) => [property.id, property])
        );

        const requests = visitSnapshot.docs
          .map((requestDocument) => {
            const data = requestDocument.data();
            const propertyId = String(data.propertyId || "");
            const matchingProperty = propertyMap.get(propertyId);

            return {
              id: requestDocument.id,
              propertyId,
              propertyTitle:
                String(data.propertyTitle || "") ||
                matchingProperty?.title ||
                "Property",
              name: String(
                data.name ||
                  data.userName ||
                  data.tenantName ||
                  "Visitor"
              ),
              phone: String(
                data.phone ||
                  data.userPhone ||
                  data.tenantPhone ||
                  ""
              ),
              visitDate: String(data.visitDate || data.date || ""),
              visitTime: String(data.visitTime || data.time || ""),
              message: String(data.message || ""),
              status: normalizeStatus(data.status),
              userId: String(
                data.userId ||
                  data.tenantId ||
                  data.requestedBy ||
                  ""
              ),
              userEmail: String(
                data.userEmail ||
                  data.tenantEmail ||
                  data.requesterEmail ||
                  ""
              ).toLowerCase(),
            } satisfies VisitRequest;
          })
          .filter((request) => propertyMap.has(request.propertyId));

        setVisitRequests(requests);
      } catch (visitError) {
        console.error(
          "Unable to load visit requests:",
          visitError
        );

        setVisitRequests([]);
      }
    },
    []
  );

  const fetchExtraCounts = useCallback(async (user: User) => {
    const results = await Promise.allSettled([
      getDocs(collection(db, "favorites")),
      getDocs(collection(db, "notifications")),
      getDocs(collection(db, "chats")),
    ]);

    const userEmail = user.email?.trim().toLowerCase() || "";

    if (results[0].status === "fulfilled") {
      const favoriteCount = results[0].value.docs.filter(
        (favoriteDocument) => {
          const data = favoriteDocument.data();

          const matchesId =
            String(
              data.userId ||
                data.savedBy ||
                data.ownerId ||
                ""
            ) === user.uid;

          const matchesEmail =
            userEmail.length > 0 &&
            String(
              data.userEmail ||
                data.savedByEmail ||
                data.ownerEmail ||
                ""
            )
              .trim()
              .toLowerCase() === userEmail;

          return matchesId || matchesEmail;
        }
      ).length;

      setTotalFavorites(favoriteCount);
    } else {
      setTotalFavorites(0);
    }

    if (results[1].status === "fulfilled") {
      const notificationCount = results[1].value.docs.filter(
        (notificationDocument) => {
          const data = notificationDocument.data();

          const matchesId =
            String(
              data.userId ||
                data.recipientId ||
                data.ownerId ||
                ""
            ) === user.uid;

          const matchesEmail =
            userEmail.length > 0 &&
            String(
              data.userEmail ||
                data.recipientEmail ||
                data.ownerEmail ||
                ""
            )
              .trim()
              .toLowerCase() === userEmail;

          return matchesId || matchesEmail;
        }
      ).length;

      setTotalNotifications(notificationCount);
    } else {
      setTotalNotifications(0);
    }

    if (results[2].status === "fulfilled") {
      const messageCount = results[2].value.docs.filter(
        (chatDocument) => {
          const data = chatDocument.data();

          const participantIds = Array.isArray(data.participantIds)
            ? data.participantIds.map((id: unknown) => String(id))
            : [];

          const participantEmails = Array.isArray(
            data.participantEmails
          )
            ? data.participantEmails.map((email: unknown) =>
                String(email).trim().toLowerCase()
              )
            : [];

          const matchesId =
            participantIds.includes(user.uid) ||
            String(
              data.userId ||
                data.ownerId ||
                data.tenantId ||
                ""
            ) === user.uid;

          const matchesEmail =
            userEmail.length > 0 &&
            (participantEmails.includes(userEmail) ||
              String(
                data.userEmail ||
                  data.ownerEmail ||
                  data.tenantEmail ||
                  ""
              )
                .trim()
                .toLowerCase() === userEmail);

          return matchesId || matchesEmail;
        }
      ).length;

      setTotalMessages(messageCount);
    } else {
      setTotalMessages(0);
    }
  }, []);

  const fetchDashboardData = useCallback(
    async (user: User, manualRefresh = false) => {
      if (manualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        /*
          We fetch the collection and filter locally so that old properties
          saved with ownerEmail still appear even when ownerId is missing.
        */
        const propertySnapshot = await getDocs(
          collection(db, "properties")
        );

        const loggedInEmail =
          user.email?.trim().toLowerCase() || "";

        const propertyList = propertySnapshot.docs
          .map((propertyDocument) => {
            const data = propertyDocument.data();

            return {
              id: propertyDocument.id,
              title: String(data.title || ""),
              location: String(data.location || ""),
              rent: data.rent ?? 0,
              type: String(data.type || ""),
              contact: String(data.contact || ""),
              ownerId: String(data.ownerId || ""),
              ownerEmail: String(data.ownerEmail || ""),
              imageUrl: String(data.imageUrl || ""),
              imageUrls: Array.isArray(data.imageUrls)
                ? data.imageUrls.filter(
                    (image: unknown): image is string =>
                      typeof image === "string"
                  )
                : [],
              status: String(data.status || "Available"),
              views: Number(data.views || 0),
            } satisfies Property;
          })
          .filter((property) => {
            const matchesOwnerId =
              property.ownerId === user.uid;

            const matchesOwnerEmail =
              loggedInEmail.length > 0 &&
              property.ownerEmail
                ?.trim()
                .toLowerCase() === loggedInEmail;

            return matchesOwnerId || matchesOwnerEmail;
          });

        setProperties(propertyList);

        await Promise.all([
          fetchVisitRequests(propertyList),
          fetchExtraCounts(user),
        ]);
      } catch (fetchError) {
        console.error(
          "Unable to load dashboard:",
          fetchError
        );

        setProperties([]);
        setVisitRequests([]);

        setError(
          "Dashboard data could not be loaded. Check your internet connection and Firebase rules."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [fetchExtraCounts, fetchVisitRequests]
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setAuthLoading(false);

        if (!user) {
          setCurrentUser(null);
          router.replace("/login");
          router.refresh();
          return;
        }

        setCurrentUser(user);
        void fetchDashboardData(user);
      }
    );

    return unsubscribe;
  }, [fetchDashboardData, router]);

  const handleDelete = async (propertyId: string) => {
    const shouldDelete = window.confirm(
      "Are you sure you want to delete this property? This action cannot be undone."
    );

    if (!shouldDelete) {
      return;
    }

    setDeletingPropertyId(propertyId);
    setError("");

    try {
      await deleteDoc(doc(db, "properties", propertyId));

      setProperties((previousProperties) =>
        previousProperties.filter(
          (property) => property.id !== propertyId
        )
      );

      setVisitRequests((previousRequests) =>
        previousRequests.filter(
          (request) => request.propertyId !== propertyId
        )
      );
    } catch (deleteError) {
      console.error(
        "Unable to delete property:",
        deleteError
      );

      setError(
        "Property could not be deleted. Please try again."
      );
    } finally {
      setDeletingPropertyId(null);
    }
  };

  const updateVisitStatus = async (
    request: VisitRequest,
    status: "Accepted" | "Rejected"
  ) => {
    setUpdatingRequestId(request.id);
    setError("");

    try {
      await updateDoc(
        doc(db, "visitRequests", request.id),
        {
          status,
          updatedAt: serverTimestamp(),
        }
      );

      setVisitRequests((previousRequests) =>
        previousRequests.map((item) =>
          item.id === request.id
            ? {
                ...item,
                status,
              }
            : item
        )
      );

      await addDoc(collection(db, "notifications"), {
        title: "Visit Request Update",
        message: `Your visit request for ${request.propertyTitle} has been ${status.toLowerCase()}.`,
        propertyId: request.propertyId,
        propertyTitle: request.propertyTitle,
        status,
        date: request.visitDate,
        time: request.visitTime,
        userId: request.userId,
        userEmail: request.userEmail,
        recipientId: request.userId,
        recipientEmail: request.userEmail,
        isRead: false,
        read: false,
        createdAt: serverTimestamp(),
      });

      setTotalNotifications(
        (currentCount) => currentCount + 1
      );
    } catch (updateError) {
      console.error(
        "Unable to update visit request:",
        updateError
      );

      setError(
        "Visit request could not be updated. Check Firebase permissions and try again."
      );
    } finally {
      setUpdatingRequestId(null);
    }
  };

  const handleLogout = async () => {
    setError("");

    try {
      await signOut(auth);
      router.replace("/login");
      router.refresh();
    } catch (logoutError) {
      console.error("Unable to log out:", logoutError);

      setError(
        "Could not log out. Please try again."
      );
    }
  };

  const totalProperties = properties.length;

  const pendingVisits = useMemo(
    () =>
      visitRequests.filter(
        (request) => request.status === "Pending"
      ).length,
    [visitRequests]
  );

  const acceptedVisits = useMemo(
    () =>
      visitRequests.filter(
        (request) => request.status === "Accepted"
      ).length,
    [visitRequests]
  );

  const rejectedVisits = useMemo(
    () =>
      visitRequests.filter(
        (request) => request.status === "Rejected"
      ).length,
    [visitRequests]
  );

  const totalViews = useMemo(
    () =>
      properties.reduce(
        (total, property) =>
          total + Number(property.views || 0),
        0
      ),
    [properties]
  );

  const displayName =
    currentUser?.displayName?.trim() ||
    currentUser?.email?.split("@")[0] ||
    "Owner";

  const firstName =
    displayName.split(" ")[0] || "Owner";

  const quickActions: QuickAction[] = [
    {
      title: "Add Property",
      description: "Create a new listing",
      href: "/list-property",
      icon: Plus,
      iconBackground: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "My Bookings",
      description: "Manage your visits",
      href: "/my-bookings",
      icon: CalendarCheck2,
      iconBackground: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      title: "Favorites",
      description: "View saved homes",
      href: "/favorites",
      icon: Heart,
      iconBackground: "bg-pink-50",
      iconColor: "text-pink-600",
    },
    {
      title: "Notifications",
      description: "Check recent updates",
      href: "/notifications",
      icon: Bell,
      iconBackground: "bg-violet-50",
      iconColor: "text-violet-600",
    },
    {
      title: "Profile",
      description: "Manage your account",
      href: "/profile",
      icon: UserRound,
      iconBackground: "bg-indigo-50",
      iconColor: "text-indigo-600",
    },
  ];

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <LoaderCircle className="animate-spin text-blue-600" />

          <p className="text-sm font-bold text-slate-700 sm:text-base">
            Opening your dashboard...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f9fc] pb-10 text-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-2 px-3 py-3 sm:gap-4 sm:px-6 sm:py-4 lg:px-8">
          <Link
            href="/"
            className="flex min-w-0 items-center gap-2 sm:gap-3"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200 sm:h-11 sm:w-11">
              <Home size={22} strokeWidth={2.5} />
            </div>

            <div className="min-w-0">
              <p className="truncate text-lg font-black tracking-tight sm:text-xl">
                DirectNest
              </p>

              <p className="hidden truncate text-xs font-semibold text-slate-400 sm:block">
                Owner Dashboard
              </p>
            </div>
          </Link>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/notifications"
              aria-label="Open notifications"
              className="relative flex h-10 w-10 touch-manipulation items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition active:scale-95 sm:h-11 sm:w-11"
            >
              <Bell size={19} />

              {totalNotifications > 0 && (
                <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[10px] font-black text-white">
                  {totalNotifications > 99
                    ? "99+"
                    : totalNotifications}
                </span>
              )}
            </Link>

            <Link
              href="/profile"
              aria-label="Open profile"
              className="hidden h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 transition hover:border-blue-200 hover:bg-blue-50 sm:flex"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 font-black text-blue-600">
                {firstName.charAt(0).toUpperCase()}
              </div>

              <span className="max-w-28 truncate text-sm font-bold">
                {firstName}
              </span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              aria-label="Log out"
              className="flex h-10 touch-manipulation items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-3 font-bold text-red-600 transition active:scale-95 sm:h-11"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">
                Logout
              </span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-600 p-5 text-white shadow-xl shadow-blue-200/60 sm:rounded-[32px] sm:p-8 lg:p-10">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-cyan-300/15 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-[11px] font-bold backdrop-blur sm:px-4 sm:text-xs">
                <Sparkles size={15} />
                DirectNest Control Center
              </div>

              <h1 className="mt-4 text-3xl font-black tracking-tight sm:mt-5 sm:text-4xl lg:text-5xl">
                Welcome back, {firstName}
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100 sm:text-base sm:leading-7">
                Manage your property listings, respond to
                visit requests and track everything from one
                place.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
              <button
                type="button"
                onClick={() => {
                  if (currentUser) {
                    void fetchDashboardData(
                      currentUser,
                      true
                    );
                  }
                }}
                disabled={refreshing}
                className="inline-flex h-12 touch-manipulation items-center justify-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-4 font-bold text-white backdrop-blur transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 sm:px-5"
              >
                <RefreshCw
                  size={18}
                  className={
                    refreshing ? "animate-spin" : ""
                  }
                />
                Refresh
              </button>

              <Link
                href="/list-property"
                className="inline-flex h-12 touch-manipulation items-center justify-center gap-2 rounded-2xl bg-white px-4 font-bold text-blue-700 shadow-lg transition active:scale-95 sm:px-5"
              >
                <Plus size={19} />
                Add Property
              </Link>
            </div>
          </div>
        </section>

        {error && (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-4 text-sm font-semibold text-red-700 sm:mt-6 sm:px-5">
            <XCircle
              size={20}
              className="mt-0.5 shrink-0"
            />
            <p>{error}</p>
          </div>
        )}

        <section className="mt-7">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
            Overview
          </p>

          <h2 className="mt-1 text-2xl font-black tracking-tight">
            Dashboard summary
          </h2>

          {loading ? (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {Array.from({ length: 8 }).map(
                (_, index) => (
                  <div
                    key={index}
                    className="h-28 animate-pulse rounded-[24px] border border-slate-200 bg-white sm:h-32"
                  />
                )
              )}
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              <StatCard
                title="Properties"
                value={totalProperties}
                helper="Your listings"
                icon={Building2}
                iconBackground="bg-blue-50"
                iconClassName="text-blue-600"
              />

              <StatCard
                title="Pending visits"
                value={pendingVisits}
                helper="Awaiting response"
                icon={Clock3}
                iconBackground="bg-amber-50"
                iconClassName="text-amber-600"
              />

              <StatCard
                title="Accepted"
                value={acceptedVisits}
                helper="Confirmed visits"
                icon={CheckCircle2}
                iconBackground="bg-emerald-50"
                iconClassName="text-emerald-600"
              />

              <StatCard
                title="Rejected"
                value={rejectedVisits}
                helper="Declined requests"
                icon={XCircle}
                iconBackground="bg-red-50"
                iconClassName="text-red-600"
              />

              <StatCard
                title="Favorites"
                value={totalFavorites}
                helper="Saved properties"
                icon={Heart}
                iconBackground="bg-pink-50"
                iconClassName="text-pink-600"
              />

              <StatCard
                title="Notifications"
                value={totalNotifications}
                helper="Recent updates"
                icon={Bell}
                iconBackground="bg-violet-50"
                iconClassName="text-violet-600"
              />

              <StatCard
                title="Messages"
                value={totalMessages}
                helper="Conversations"
                icon={MessageCircle}
                iconBackground="bg-indigo-50"
                iconClassName="text-indigo-600"
              />

              <StatCard
                title="Property views"
                value={totalViews}
                helper="Total views"
                icon={Eye}
                iconBackground="bg-cyan-50"
                iconClassName="text-cyan-600"
              />
            </div>
          )}
        </section>

        <section className="mt-9">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
            Shortcuts
          </p>

          <h2 className="mt-1 text-2xl font-black tracking-tight">
            Quick actions
          </h2>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-5">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <Link
                  key={action.title}
                  href={action.href}
                  className="group flex touch-manipulation items-center gap-4 rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm transition active:scale-[0.98] sm:rounded-[24px]"
                >
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${action.iconBackground}`}
                  >
                    <Icon
                      size={22}
                      className={action.iconColor}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-black text-slate-900">
                      {action.title}
                    </p>

                    <p className="mt-0.5 truncate text-xs font-medium text-slate-400">
                      {action.description}
                    </p>
                  </div>

                  <ChevronRight
                    size={18}
                    className="shrink-0 text-slate-300"
                  />
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mt-9 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm sm:rounded-[30px]">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
                Listings
              </p>

              <h2 className="mt-1 text-2xl font-black tracking-tight">
                My properties
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Manage all properties listed by you.
              </p>
            </div>

            <Link
              href="/list-property"
              className="inline-flex h-11 touch-manipulation items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 text-sm font-bold text-white shadow-md transition active:scale-95"
            >
              <Plus size={18} />
              Add new
            </Link>
          </div>

          <div className="p-4 sm:p-7">
            {loading ? (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 3 }).map(
                  (_, index) => (
                    <div
                      key={index}
                      className="overflow-hidden rounded-[26px] border border-slate-200"
                    >
                      <div className="h-48 animate-pulse bg-slate-200" />

                      <div className="space-y-3 p-5">
                        <div className="h-6 w-2/3 animate-pulse rounded-lg bg-slate-200" />
                        <div className="h-4 w-1/2 animate-pulse rounded-lg bg-slate-100" />
                        <div className="h-12 animate-pulse rounded-2xl bg-slate-100" />
                      </div>
                    </div>
                  )
                )}
              </div>
            ) : properties.length === 0 ? (
              <div className="rounded-[26px] border border-dashed border-blue-200 bg-blue-50/60 px-5 py-10 text-center sm:rounded-[28px] sm:px-6 sm:py-12">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[26px] bg-white text-blue-600 shadow-sm">
                  <Building2 size={36} />
                </div>

                <h3 className="mt-5 text-xl font-black">
                  No properties added yet
                </h3>

                <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
                  Create your first property listing and
                  start receiving direct enquiries without
                  brokerage.
                </p>

                <Link
                  href="/list-property"
                  className="mt-6 inline-flex h-12 touch-manipulation items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 font-bold text-white shadow-lg transition active:scale-95"
                >
                  <Plus size={19} />
                  List your first property
                </Link>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {properties.map((property) => {
                  const image =
                    getPropertyImage(property);

                  return (
                    <article
                      key={property.id}
                      className="group overflow-hidden rounded-[26px] border border-slate-200 bg-white transition duration-300 hover:shadow-xl"
                    >
                      <div className="relative h-52 overflow-hidden bg-slate-100">
                        {image ? (
                          <Image
                            src={image}
                            alt={
                              property.title ||
                              "Property"
                            }
                            fill
                            unoptimized
                            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                            className="object-cover transition duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-400">
                            <Building2 size={38} />

                            <span className="text-sm font-semibold">
                              No property image
                            </span>
                          </div>
                        )}

                        <span className="absolute left-3 top-3 z-10 rounded-full bg-white/95 px-3 py-1.5 text-xs font-black text-blue-700 shadow-sm backdrop-blur sm:left-4 sm:top-4">
                          {property.type ||
                            "Property"}
                        </span>

                        <span className="absolute right-3 top-3 z-10 rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-black text-white shadow-sm sm:right-4 sm:top-4">
                          {property.status ||
                            "Available"}
                        </span>
                      </div>

                      <div className="p-5">
                        <h3 className="line-clamp-1 text-lg font-black text-slate-950">
                          {property.title ||
                            "Untitled Property"}
                        </h3>

                        <p className="mt-2 flex items-start gap-2 text-sm font-medium text-slate-500">
                          <MapPin
                            size={17}
                            className="mt-0.5 shrink-0 text-blue-600"
                          />

                          <span className="line-clamp-1">
                            {property.location ||
                              "Location not provided"}
                          </span>
                        </p>

                        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                              Monthly rent
                            </p>

                            <p className="mt-1 flex items-center text-xl font-black text-blue-600">
                              <IndianRupee
                                size={19}
                                strokeWidth={3}
                              />

                              {formatRent(
                                property.rent || 0
                              )}
                            </p>
                          </div>

                          <div className="flex h-10 min-w-0 items-center gap-2 rounded-xl bg-slate-50 px-3 text-xs font-bold text-slate-600">
                            <Phone
                              size={15}
                              className="shrink-0 text-blue-600"
                            />

                            <span className="truncate">
                              {property.contact ||
                                "N/A"}
                            </span>
                          </div>
                        </div>

                        <div className="mt-5 grid grid-cols-3 gap-2">
                          <Link
                            href={`/property/${property.id}`}
                            className="flex h-11 touch-manipulation items-center justify-center gap-1 rounded-xl bg-blue-600 text-[11px] font-bold text-white transition active:scale-95 sm:gap-1.5 sm:text-xs"
                          >
                            <Eye size={16} />
                            View
                          </Link>

                          <Link
                            href={`/edit-property/${property.id}`}
                            className="flex h-11 touch-manipulation items-center justify-center gap-1 rounded-xl bg-amber-50 text-[11px] font-bold text-amber-700 transition active:scale-95 sm:gap-1.5 sm:text-xs"
                          >
                            <Pencil size={16} />
                            Edit
                          </Link>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                property.id
                              )
                            }
                            disabled={
                              deletingPropertyId ===
                              property.id
                            }
                            className="flex h-11 touch-manipulation items-center justify-center gap-1 rounded-xl bg-red-50 text-[11px] font-bold text-red-600 transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 sm:gap-1.5 sm:text-xs"
                          >
                            {deletingPropertyId ===
                            property.id ? (
                              <LoaderCircle
                                size={16}
                                className="animate-spin"
                              />
                            ) : (
                              <Trash2 size={16} />
                            )}

                            Delete
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section className="mt-9 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm sm:rounded-[30px]">
          <div className="border-b border-slate-100 p-5 sm:p-7">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
              Visits
            </p>

            <h2 className="mt-1 text-2xl font-black tracking-tight">
              Visit requests
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Accept or reject visit requests received for
              your properties.
            </p>
          </div>

          <div className="p-4 sm:p-7">
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 2 }).map(
                  (_, index) => (
                    <div
                      key={index}
                      className="h-48 animate-pulse rounded-[24px] bg-slate-100"
                    />
                  )
                )}
              </div>
            ) : visitRequests.length === 0 ? (
              <div className="rounded-[26px] border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center sm:rounded-[28px] sm:px-6 sm:py-12">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[26px] bg-white text-slate-400 shadow-sm">
                  <CalendarClock size={36} />
                </div>

                <h3 className="mt-5 text-xl font-black">
                  No visit requests yet
                </h3>

                <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
                  New visit requests for your properties
                  will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {visitRequests.map((request) => {
                  const isAccepted =
                    request.status === "Accepted";

                  const isRejected =
                    request.status === "Rejected";

                  const isPending =
                    request.status === "Pending";

                  return (
                    <article
                      key={request.id}
                      className="rounded-[24px] border border-slate-200 bg-white p-4 transition hover:border-blue-200 hover:shadow-lg sm:rounded-[26px] sm:p-6"
                    >
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-lg font-black text-slate-950">
                              {
                                request.propertyTitle
                              }
                            </h3>

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-black ${
                                isAccepted
                                  ? "bg-emerald-50 text-emerald-700"
                                  : isRejected
                                    ? "bg-red-50 text-red-600"
                                    : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {request.status}
                            </span>
                          </div>

                          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3.5">
                              <UserRound
                                size={18}
                                className="shrink-0 text-blue-600"
                              />

                              <div className="min-w-0">
                                <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
                                  Visitor
                                </p>

                                <p className="truncate text-sm font-bold text-slate-800">
                                  {request.name}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3.5">
                              <Phone
                                size={18}
                                className="shrink-0 text-blue-600"
                              />

                              <div className="min-w-0">
                                <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
                                  Phone
                                </p>

                                <p className="truncate text-sm font-bold text-slate-800">
                                  {request.phone ||
                                    "Not provided"}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3.5">
                              <Mail
                                size={18}
                                className="shrink-0 text-blue-600"
                              />

                              <div className="min-w-0">
                                <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
                                  Email
                                </p>

                                <p className="truncate text-sm font-bold text-slate-800">
                                  {request.userEmail ||
                                    "Not provided"}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3.5">
                              <CalendarCheck2
                                size={18}
                                className="shrink-0 text-blue-600"
                              />

                              <div>
                                <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
                                  Visit date
                                </p>

                                <p className="text-sm font-bold text-slate-800">
                                  {request.visitDate ||
                                    "Not selected"}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3.5">
                              <Clock3
                                size={18}
                                className="shrink-0 text-blue-600"
                              />

                              <div>
                                <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
                                  Visit time
                                </p>

                                <p className="text-sm font-bold text-slate-800">
                                  {request.visitTime ||
                                    "Not selected"}
                                </p>
                              </div>
                            </div>
                          </div>

                          {request.message && (
                            <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                              <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                                Visitor message
                              </p>

                              <p className="mt-1 text-sm leading-6 text-slate-600">
                                {request.message}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="grid shrink-0 gap-3 sm:grid-cols-3 lg:w-40 lg:grid-cols-1">
                          <Link
                            href={`/property/${request.propertyId}`}
                            className="flex h-11 touch-manipulation items-center justify-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 text-sm font-bold text-blue-600 transition active:scale-95"
                          >
                            View
                            <ArrowRight size={16} />
                          </Link>

                          <button
                            type="button"
                            onClick={() =>
                              updateVisitStatus(
                                request,
                                "Accepted"
                              )
                            }
                            disabled={
                              updatingRequestId ===
                                request.id ||
                              isAccepted
                            }
                            className="flex h-11 touch-manipulation items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 text-sm font-bold text-white transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {updatingRequestId ===
                            request.id ? (
                              <LoaderCircle
                                size={17}
                                className="animate-spin"
                              />
                            ) : (
                              <Check size={17} />
                            )}

                            {isAccepted
                              ? "Accepted"
                              : "Accept"}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              updateVisitStatus(
                                request,
                                "Rejected"
                              )
                            }
                            disabled={
                              updatingRequestId ===
                                request.id ||
                              isRejected
                            }
                            className="flex h-11 touch-manipulation items-center justify-center gap-2 rounded-xl bg-red-50 px-3 text-sm font-bold text-red-600 transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {updatingRequestId ===
                            request.id ? (
                              <LoaderCircle
                                size={17}
                                className="animate-spin"
                              />
                            ) : (
                              <X size={17} />
                            )}

                            {isRejected
                              ? "Rejected"
                              : "Reject"}
                          </button>

                          {!isPending && (
                            <p className="text-center text-xs font-semibold text-slate-400 sm:col-span-3 lg:col-span-1">
                              Status can still be
                              changed.
                            </p>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section className="mt-9 grid gap-5 lg:grid-cols-3">
          <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <LayoutDashboard size={23} />
              </div>

              <div>
                <p className="text-sm font-black text-slate-950">
                  DirectNest performance
                </p>

                <p className="text-xs font-medium text-slate-400">
                  Your current owner activity
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              <div className="rounded-2xl bg-slate-50 p-4">
                <CircleDollarSign
                  size={20}
                  className="text-blue-600"
                />

                <p className="mt-3 text-2xl font-black">
                  {totalProperties}
                </p>

                <p className="text-xs font-semibold text-slate-400">
                  Listings
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <CalendarClock
                  size={20}
                  className="text-amber-600"
                />

                <p className="mt-3 text-2xl font-black">
                  {visitRequests.length}
                </p>

                <p className="text-xs font-semibold text-slate-400">
                  Visits
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <CheckCircle2
                  size={20}
                  className="text-emerald-600"
                />

                <p className="mt-3 text-2xl font-black">
                  {acceptedVisits}
                </p>

                <p className="text-xs font-semibold text-slate-400">
                  Confirmed
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <Eye
                  size={20}
                  className="text-indigo-600"
                />

                <p className="mt-3 text-2xl font-black">
                  {totalViews}
                </p>

                <p className="text-xs font-semibold text-slate-400">
                  Views
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-[28px] bg-slate-950 p-6 text-white shadow-xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <Building2 size={23} />
            </div>

            <h3 className="mt-5 text-xl font-black">
              Grow your property reach
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-300">
              Add complete details and clear images to
              receive more genuine enquiries.
            </p>

            <Link
              href="/list-property"
              className="mt-6 inline-flex h-11 w-full touch-manipulation items-center justify-center gap-2 rounded-xl bg-white font-bold text-slate-950 transition active:scale-95"
            >
              Add another property
              <ArrowRight size={17} />
            </Link>
          </article>
        </section>
      </div>
    </main>
  );
}