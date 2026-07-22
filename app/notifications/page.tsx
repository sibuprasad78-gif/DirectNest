"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  Home,
  LoaderCircle,
  RefreshCw,
  XCircle,
  Hourglass,
} from "lucide-react";
import {
  collection,
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import {
  onAuthStateChanged,
  type User,
} from "firebase/auth";

import { auth, db } from "@/lib/firebase";

type NotificationStatus =
  | "Accepted"
  | "Rejected"
  | "Pending";

type NotificationItem = {
  id: string;
  title: string;
  propertyId: string;
  property: string;
  date: string;
  time: string;
  status: NotificationStatus;
  isRead: boolean;
  userId: string;
  userEmail: string;
  createdAt: number;
};

function normalizeStatus(value: unknown): NotificationStatus {
  const status = String(value || "").toLowerCase();

  if (status === "accepted") {
    return "Accepted";
  }

  if (status === "rejected") {
    return "Rejected";
  }

  return "Pending";
}

function getTimestampValue(value: unknown): number {
  if (
    value &&
    typeof value === "object" &&
    "toMillis" in value &&
    typeof (value as { toMillis?: unknown }).toMillis ===
      "function"
  ) {
    return (
      value as {
        toMillis: () => number;
      }
    ).toMillis();
  }

  if (
    value &&
    typeof value === "object" &&
    "seconds" in value &&
    typeof (value as { seconds?: unknown }).seconds ===
      "number"
  ) {
    return (
      value as {
        seconds: number;
      }
    ).seconds * 1000;
  }

  return 0;
}

function formatNotificationDate(value: unknown): string {
  const timestamp = getTimestampValue(value);

  if (!timestamp) {
    return "";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(timestamp));
}

function formatNotificationTime(value: unknown): string {
  const timestamp = getTimestampValue(value);

  if (!timestamp) {
    return "";
  }

  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(timestamp));
}

export default function NotificationsPage() {
  const [currentUser, setCurrentUser] =
    useState<User | null>(null);

  const [notifications, setNotifications] =
    useState<NotificationItem[]>([]);

  const [authLoading, setAuthLoading] =
    useState(true);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [updatingId, setUpdatingId] =
    useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setCurrentUser(user);
        setAuthLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!currentUser) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    const notificationsRef = collection(
      db,
      "notifications"
    );

    const unsubscribe = onSnapshot(
      notificationsRef,
      (snapshot) => {
        const userNotifications =
          snapshot.docs
            .map((notificationDocument) => {
              const data =
                notificationDocument.data();

              const createdAtValue =
                data.createdAt ||
                data.updatedAt ||
                data.timestamp;

              const manuallySavedDate = String(
                data.date ||
                  data.visitDate ||
                  ""
              );

              const manuallySavedTime = String(
                data.time ||
                  data.visitTime ||
                  ""
              );

              return {
                id: notificationDocument.id,

                title: String(
                  data.title ||
                    data.messageTitle ||
                    "Visit Request Update"
                ),

                propertyId: String(
                  data.propertyId || ""
                ),

                property: String(
                  data.propertyTitle ||
                    data.property ||
                    "Property"
                ),

                date:
                  manuallySavedDate ||
                  formatNotificationDate(
                    createdAtValue
                  ),

                time:
                  manuallySavedTime ||
                  formatNotificationTime(
                    createdAtValue
                  ),

                status: normalizeStatus(
                  data.status
                ),

                isRead:
                  data.isRead === true ||
                  data.read === true,

                userId: String(
                  data.userId ||
                    data.recipientId ||
                    data.tenantId ||
                    ""
                ),

                userEmail: String(
                  data.userEmail ||
                    data.recipientEmail ||
                    data.tenantEmail ||
                    ""
                ).toLowerCase(),

                createdAt:
                  getTimestampValue(
                    createdAtValue
                  ),
              } satisfies NotificationItem;
            })
            .filter((notification) => {
              const loggedInEmail =
                currentUser.email
                  ?.toLowerCase()
                  .trim() || "";

              const belongsById =
                notification.userId ===
                currentUser.uid;

              const belongsByEmail =
                loggedInEmail.length > 0 &&
                notification.userEmail ===
                  loggedInEmail;

              /*
               * Notifications created without user information
               * are also shown temporarily. After your notification
               * creation code saves userId, only the correct user's
               * notifications will appear.
               */
              const hasNoRecipient =
                !notification.userId &&
                !notification.userEmail;

              return (
                belongsById ||
                belongsByEmail ||
                hasNoRecipient
              );
            })
            .sort(
              (first, second) =>
                second.createdAt -
                first.createdAt
            );

        setNotifications(userNotifications);
        setLoading(false);
      },
      (snapshotError) => {
        console.error(
          "Unable to load notifications:",
          snapshotError
        );

        setError(
          "Notifications load nahi ho paayi. Firebase permissions aur internet connection check karo."
        );

        setLoading(false);
      }
    );

    return unsubscribe;
  }, [authLoading, currentUser]);

  const unreadCount = useMemo(
    () =>
      notifications.filter(
        (notification) =>
          !notification.isRead
      ).length,
    [notifications]
  );

  const markAsRead = async (
    notificationId: string
  ) => {
    setUpdatingId(notificationId);
    setError("");

    try {
      await updateDoc(
        doc(
          db,
          "notifications",
          notificationId
        ),
        {
          isRead: true,
          read: true,
        }
      );
    } catch (updateError) {
      console.error(
        "Unable to mark notification as read:",
        updateError
      );

      setError(
        "Notification read mark nahi ho paayi. Dobara try karo."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const markAllAsRead = async () => {
    const unreadNotifications =
      notifications.filter(
        (notification) =>
          !notification.isRead
      );

    if (unreadNotifications.length === 0) {
      return;
    }

    setUpdatingId("all");
    setError("");

    try {
      await Promise.all(
        unreadNotifications.map(
          (notification) =>
            updateDoc(
              doc(
                db,
                "notifications",
                notification.id
              ),
              {
                isRead: true,
                read: true,
              }
            )
        )
      );
    } catch (updateError) {
      console.error(
        "Unable to mark all as read:",
        updateError
      );

      setError(
        "Sab notifications read mark nahi ho paayi. Dobara try karo."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 rounded-2xl bg-white px-6 py-5 shadow-sm">
          <LoaderCircle className="animate-spin text-blue-600" />

          <p className="font-bold text-slate-700">
            Checking your account...
          </p>
        </div>
      </main>
    );
  }

  if (!currentUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4">
        <div className="w-full max-w-md rounded-[32px] border border-slate-200 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] bg-blue-50">
            <Bell
              size={40}
              className="text-blue-600"
            />
          </div>

          <h1 className="mt-6 text-2xl font-black text-slate-950">
            Login Required
          </h1>

          <p className="mt-3 leading-7 text-slate-500">
            Apni visit requests aur property
            updates dekhne ke liye login karo.
          </p>

          <Link
            href="/login"
            className="mt-7 inline-flex h-13 items-center justify-center rounded-2xl bg-blue-600 px-7 py-4 font-bold text-white shadow-lg transition hover:bg-blue-700"
          >
            Login to DirectNest
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4 py-6">
      <div className="mx-auto w-full max-w-3xl">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 font-bold text-blue-600 transition hover:text-blue-700"
        >
          <ArrowLeft size={20} />
          Back to Home
        </Link>

        <div className="mb-8 text-center">
          <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-50 shadow-sm">
            <Bell
              size={32}
              className="text-blue-600"
            />

            {unreadCount > 0 && (
              <span className="absolute -right-2 -top-2 flex min-h-7 min-w-7 items-center justify-center rounded-full border-2 border-white bg-red-500 px-1.5 text-xs font-black text-white">
                {unreadCount > 99
                  ? "99+"
                  : unreadCount}
              </span>
            )}
          </div>

          <h1 className="mt-4 text-[34px] font-black text-[#0f172a]">
            Notifications
          </h1>

          <p className="mt-2 text-slate-500">
            Track your visit requests and property
            updates.
          </p>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              disabled={updatingId === "all"}
              className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-5 text-sm font-bold text-blue-600 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {updatingId === "all" ? (
                <LoaderCircle
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <Check size={17} />
              )}

              Mark All as Read
            </button>
          )}
        </div>

        {error && (
          <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-center text-sm font-bold text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-5">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex gap-4">
                  <div className="h-12 w-12 animate-pulse rounded-2xl bg-slate-200" />

                  <div className="flex-1 space-y-3">
                    <div className="h-6 w-2/3 animate-pulse rounded-lg bg-slate-200" />
                    <div className="h-4 w-1/2 animate-pulse rounded-lg bg-slate-200" />
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="h-20 animate-pulse rounded-2xl bg-slate-100" />
                  <div className="h-20 animate-pulse rounded-2xl bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-[32px] border border-slate-200 bg-white px-6 py-14 text-center shadow-lg">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[32px] bg-blue-50">
              <Bell
                size={46}
                className="text-blue-400"
              />
            </div>

            <h2 className="mt-6 text-2xl font-black text-slate-950">
              No notifications yet
            </h2>

            <p className="mx-auto mt-3 max-w-lg leading-7 text-slate-500">
              Property visit request bhejne ke baad
              owner ka response yahan automatically
              dikhai dega.
            </p>

            <Link
              href="/#properties"
              className="mt-7 inline-flex h-13 items-center justify-center rounded-2xl bg-blue-600 px-7 py-4 font-bold text-white shadow-lg transition hover:bg-blue-700"
            >
              Explore Properties
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {notifications.map((item) => {
              const isAccepted =
                item.status === "Accepted";

              const isRejected =
                item.status === "Rejected";

              const isPending =
                item.status === "Pending";

              return (
                <article
                  key={item.id}
                  className={`relative rounded-[28px] border p-5 shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
                    item.isRead
                      ? "border-slate-200 bg-slate-50"
                      : "border-blue-100 bg-white"
                  }`}
                >
                  {!item.isRead && (
                    <span className="absolute right-5 top-5 rounded-full bg-blue-600 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-white">
                      New
                    </span>
                  )}

                  <div className="flex items-start gap-4 pr-14">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                        isAccepted
                          ? "bg-green-50"
                          : isRejected
                            ? "bg-red-50"
                            : "bg-amber-50"
                      }`}
                    >
                      {isAccepted ? (
                        <CheckCircle2
                          size={26}
                          className="text-green-600"
                        />
                      ) : isRejected ? (
                        <XCircle
                          size={26}
                          className="text-red-600"
                        />
                      ) : (
                        <Hourglass
                          size={25}
                          className="text-amber-600"
                        />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h2 className="text-xl font-black text-[#0f172a]">
                        {item.title}
                      </h2>

                      <p className="mt-1 flex items-start gap-2 text-sm font-medium text-slate-500">
                        <Home
                          size={16}
                          className="mt-0.5 shrink-0"
                        />

                        <span className="line-clamp-2">
                          {item.property}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${
                        isAccepted
                          ? "bg-green-50 text-green-600"
                          : isRejected
                            ? "bg-red-50 text-red-600"
                            : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
                      <CalendarDays
                        size={20}
                        className="text-blue-600"
                      />

                      <div>
                        <p className="text-xs font-bold uppercase text-slate-400">
                          Date
                        </p>

                        <p className="font-bold text-slate-800">
                          {item.date ||
                            "Not provided"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
                      <Clock
                        size={20}
                        className="text-blue-600"
                      />

                      <div>
                        <p className="text-xs font-bold uppercase text-slate-400">
                          Time
                        </p>

                        <p className="font-bold text-slate-800">
                          {item.time ||
                            "Not provided"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    {item.propertyId ? (
                      <Link
                        href={`/property/${item.propertyId}`}
                        className="flex h-12 flex-1 items-center justify-center rounded-2xl bg-blue-600 font-bold text-white shadow-lg transition hover:bg-blue-700"
                      >
                        View Property
                      </Link>
                    ) : (
                      <Link
                        href="/#properties"
                        className="flex h-12 flex-1 items-center justify-center rounded-2xl bg-blue-600 font-bold text-white shadow-lg transition hover:bg-blue-700"
                      >
                        Explore Properties
                      </Link>
                    )}

                    {item.isRead ? (
                      <div className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-green-100 bg-green-50 font-bold text-green-600">
                        <Check size={19} />
                        Read
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          markAsRead(item.id)
                        }
                        disabled={
                          updatingId === item.id ||
                          updatingId === "all"
                        }
                        className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {updatingId ===
                        item.id ? (
                          <LoaderCircle
                            size={18}
                            className="animate-spin"
                          />
                        ) : (
                          <Check size={18} />
                        )}

                        Mark as Read
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}