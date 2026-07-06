"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

type Property = {
  id: string;
  title: string;
  location: string;
  rent: string;
  type: string;
  contact: string;
  imageUrl?: string;
};

type VisitRequest = {
  id: string;
  propertyId: string;
  propertyTitle?: string;
  name: string;
  phone: string;
  visitDate: string;
  visitTime: string;
  message?: string;
  status: string;
  userEmail?: string;
};

export default function DashboardPage() {
  const router = useRouter();

  const [properties, setProperties] = useState<Property[]>([]);
  const [visitRequests, setVisitRequests] = useState<VisitRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyProperties = async (userId: string) => {
    const q = query(
      collection(db, "properties"),
      where("ownerId", "==", userId)
    );

    const querySnapshot = await getDocs(q);

    const propertyList = querySnapshot.docs.map((document) => ({
      id: document.id,
      ...document.data(),
    })) as Property[];

    setProperties(propertyList);

    await fetchVisitRequests(propertyList);

    setLoading(false);
  };

  const fetchVisitRequests = async (propertyList: Property[]) => {
    if (propertyList.length === 0) {
      setVisitRequests([]);
      return;
    }

    const snapshot = await getDocs(collection(db, "visitRequests"));

    const myPropertyIds = propertyList.map((property) => property.id);

    const requests = snapshot.docs
      .map((document) => ({
        id: document.id,
        ...document.data(),
      }))
      .filter((request: any) => myPropertyIds.includes(request.propertyId))
      .map((request: any) => {
        const matchedProperty = propertyList.find(
          (property) => property.id === request.propertyId
        );

        return {
          id: request.id,
          propertyId: request.propertyId,
          propertyTitle: matchedProperty?.title || "Property",
          name: request.name || "",
          phone: request.phone || "",
          visitDate: request.visitDate || "",
          visitTime: request.visitTime || "",
          message: request.message || "",
          status: request.status || "Pending",
          userEmail: request.userEmail || "",
        };
      }) as VisitRequest[];

    setVisitRequests(requests);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchMyProperties(user.uid);
      } else {
        router.replace("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleDelete = async (id: string) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this property?"
    );

    if (!confirmDelete) return;

    await deleteDoc(doc(db, "properties", id));
    alert("Property Deleted Successfully!");

    const user = auth.currentUser;
    if (user) {
      fetchMyProperties(user.uid);
    }
  };

  const updateVisitStatus = async (requestId: string, status: string) => {
    await updateDoc(doc(db, "visitRequests", requestId), {
      status,
    });

    setVisitRequests((prev) =>
      prev.map((request) =>
        request.id === requestId ? { ...request, status } : request
      )
    );

    alert(`Visit request ${status}`);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert("Logged Out Successfully!");
      router.replace("/login");
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="bg-blue-600 text-white p-5 flex justify-between items-center">
        <h1 className="text-3xl font-bold">🏠 DirectNest Dashboard</h1>

        <button
          onClick={handleLogout}
          className="bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <div className="max-w-6xl mx-auto p-8">
        <h2 className="text-4xl font-bold">Welcome to DirectNest 👋</h2>

        <p className="text-gray-600 mt-2">
          Manage your properties and visit requests from here.
        </p>

        <Link href="/list-property">
          <button className="mt-8 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700">
            ➕ Add New Property
          </button>
        </Link>

        <div className="mt-10 bg-white rounded-xl shadow-md p-8">
          <h3 className="text-2xl font-bold mb-6">My Properties</h3>

          {loading ? (
            <p className="text-gray-500">Loading your properties...</p>
          ) : properties.length === 0 ? (
            <p className="text-gray-500">
              You haven't added any properties yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {properties.map((property) => (
                <div key={property.id} className="border rounded-xl p-5">
                  {property.imageUrl ? (
                    <img
                      src={property.imageUrl}
                      alt={property.title}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-300 rounded-lg mb-4 flex items-center justify-center text-gray-600">
                      Property Image
                    </div>
                  )}

                  <h4 className="text-xl font-bold">{property.title}</h4>

                  <p className="text-gray-600 mt-2">📍 {property.location}</p>

                  <p className="text-blue-600 font-bold mt-2">
                    ₹{property.rent} / Month
                  </p>

                  <p className="text-gray-600 mt-2">🏠 {property.type}</p>

                  <p className="text-gray-600 mt-2">📞 {property.contact}</p>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link
                      href={`/property/${property.id}`}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      View Details
                    </Link>

                    <Link
                      href={`/edit-property/${property.id}`}
                      className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
                    >
                      Edit Property
                    </Link>

                    <button
                      onClick={() => handleDelete(property.id)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                    >
                      Delete Property
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-10 bg-white rounded-xl shadow-md p-8">
          <h3 className="text-2xl font-bold mb-6">📅 Visit Requests</h3>

          {loading ? (
            <p className="text-gray-500">Loading visit requests...</p>
          ) : visitRequests.length === 0 ? (
            <p className="text-gray-500">No visit requests yet.</p>
          ) : (
            <div className="space-y-5">
              {visitRequests.map((request) => (
                <div key={request.id} className="border rounded-xl p-5">
                  <h4 className="text-xl font-bold">
                    {request.propertyTitle}
                  </h4>

                  <p className="mt-2">👤 Visitor: {request.name}</p>
                  <p className="mt-2">📞 Phone: {request.phone}</p>
                  <p className="mt-2">📧 Email: {request.userEmail}</p>
                  <p className="mt-2">📅 Date: {request.visitDate}</p>
                  <p className="mt-2">⏰ Time: {request.visitTime}</p>

                  {request.message && (
                    <p className="mt-2">📝 Message: {request.message}</p>
                  )}

                  <p className="mt-3 font-bold">
                    Status:{" "}
                    <span
                      className={
                        request.status === "Accepted"
                          ? "text-green-600"
                          : request.status === "Rejected"
                          ? "text-red-600"
                          : "text-yellow-600"
                      }
                    >
                      {request.status}
                    </span>
                  </p>

                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={() => updateVisitStatus(request.id, "Accepted")}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                      Accept
                    </button>

                    <button
                      onClick={() => updateVisitStatus(request.id, "Rejected")}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}