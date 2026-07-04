"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, deleteDoc, doc, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

type Property = {
  id: string;
  title: string;
  location: string;
  rent: string;
  type: string;
  contact: string;
};

export default function DashboardPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyProperties = async (userId: string) => {
    const q = query(
      collection(db, "properties"),
      where("ownerId", "==", userId)
    );

    const querySnapshot = await getDocs(q);

    const propertyList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Property[];

    setProperties(propertyList);
    setLoading(false);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchMyProperties(user.uid);
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    const confirmDelete = confirm("Are you sure you want to delete this property?");
    if (!confirmDelete) return;

    await deleteDoc(doc(db, "properties", id));
    alert("Property Deleted Successfully!");

    const user = auth.currentUser;
    if (user) {
      fetchMyProperties(user.uid);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert("Logged Out Successfully!");
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
          Manage your properties from here.
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
                  <h4 className="text-xl font-bold">{property.title}</h4>
                  <p className="text-gray-600 mt-2">📍 {property.location}</p>
                  <p className="text-blue-600 font-bold mt-2">
                    ₹{property.rent} / Month
                  </p>
                  <p className="text-gray-600 mt-2">🏠 {property.type}</p>
                  <p className="text-gray-600 mt-2">📞 {property.contact}</p>

                  <button
                    onClick={() => handleDelete(property.id)}
                    className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    Delete Property
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}