import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  XCircle,
  CalendarDays,
  Clock,
  Home,
} from "lucide-react";

const notifications = [
  {
    id: 1,
    title: "Visit Request Update",
    date: "2027-02-24",
    time: "07:20",
    status: "Rejected",
    property: "2 BHK Family Flat Near Patia",
  },
  {
    id: 2,
    title: "Visit Request Update",
    date: "2026-08-24",
    time: "01:40",
    status: "Accepted",
    property: "1 BHK Room Near KIIT",
  },
];

export default function NotificationsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4 py-6">
      <div className="mx-auto w-full max-w-3xl">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 font-bold text-blue-600"
        >
          <ArrowLeft size={20} />
          Back to Home
        </Link>

        <div className="mb-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-50 shadow-sm">
            <Bell size={32} className="text-blue-600" />
          </div>

          <h1 className="mt-4 text-[34px] font-black text-[#0f172a]">
            Notifications
          </h1>

          <p className="mt-2 text-slate-500">
            Track your visit requests and property updates.
          </p>
        </div>

        <div className="space-y-5">
          {notifications.map((item) => {
            const isAccepted = item.status === "Accepted";

            return (
              <div
                key={item.id}
                className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                        isAccepted ? "bg-green-50" : "bg-red-50"
                      }`}
                    >
                      {isAccepted ? (
                        <CheckCircle2 size={26} className="text-green-600" />
                      ) : (
                        <XCircle size={26} className="text-red-600" />
                      )}
                    </div>

                    <div>
                      <h2 className="text-xl font-black text-[#0f172a]">
                        {item.title}
                      </h2>

                      <p className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-500">
                        <Home size={16} />
                        {item.property}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      isAccepted
                        ? "bg-green-50 text-green-600"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                    <CalendarDays size={20} className="text-blue-600" />
                    <div>
                      <p className="text-xs font-bold uppercase text-slate-400">
                        Date
                      </p>
                      <p className="font-bold text-slate-800">{item.date}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                    <Clock size={20} className="text-blue-600" />
                    <div>
                      <p className="text-xs font-bold uppercase text-slate-400">
                        Time
                      </p>
                      <p className="font-bold text-slate-800">{item.time}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/"
                    className="flex h-12 flex-1 items-center justify-center rounded-2xl bg-blue-600 font-bold text-white shadow-lg hover:bg-blue-700"
                  >
                    View Property
                  </Link>

                  <button className="h-12 flex-1 rounded-2xl border border-slate-200 bg-white font-bold text-slate-700 hover:text-blue-600">
                    Mark as Read
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}