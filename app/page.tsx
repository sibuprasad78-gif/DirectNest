"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
collection,
getDocs,
addDoc,
query,
where,
} from "firebase/firestore";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { auth, db } from "@/lib/firebase";

type Property = {
id: string;
title?: string;
location?: string;
rent?: string;
type?: string;
description?: string;
contact?: string;
imageUrl?: string;
};

export default function Home() {
const [properties, setProperties] = useState<Property[]>([]);
const [search, setSearch] = useState("");
const [propertyType, setPropertyType] = useState("");
const [minRent, setMinRent] = useState("");
const [maxRent, setMaxRent] = useState("");
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

const filteredProperties = properties.filter((property) => {
const propertyRent = Number(property.rent || 0);

const matchesSearch = `${property.title || ""} ${property.location || ""} ${  
  property.type || ""  
}`  
  .toLowerCase()  
  .includes(search.toLowerCase().trim());  

const matchesType = propertyType ? property.type === propertyType : true;  
const matchesMinRent = minRent ? propertyRent >= Number(minRent) : true;  
const matchesMaxRent = maxRent ? propertyRent <= Number(maxRent) : true;  

return matchesSearch && matchesType && matchesMinRent && matchesMaxRent;

});

const clearFilters = () => {
setSearch("");
setPropertyType("");
setMinRent("");
setMaxRent("");
};

const saveFavorite = async (property: Property) => {
if (!auth.currentUser) {
alert("Please login first.");
return;
}

try {  
  const favoriteQuery = query(  
    collection(db, "favorites"),  
    where("userId", "==", auth.currentUser.uid),  
    where("propertyId", "==", property.id)  
  );  

  const existingFavorite = await getDocs(favoriteQuery);  

  if (!existingFavorite.empty) {  
    alert("This property is already saved.");  
    return;  
  }  

  await addDoc(collection(db, "favorites"), {  
    propertyId: property.id,  
    title: property.title || "",  
    location: property.location || "",  
    rent: property.rent || "",  
    type: property.type || "",  
    description: property.description || "",  
    contact: property.contact || "",  
    imageUrl: property.imageUrl || "",  
    userId: auth.currentUser.uid,  
    createdAt: new Date(),  
  });  

  alert("❤️ Property Saved Successfully!");  
} catch (error: any) {  
  alert(error.message || "Failed to save property.");  
}

};

useEffect(() => {
const fetchProperties = async () => {
try {
setLoading(true);
setError("");

const querySnapshot = await getDocs(collection(db, "properties"));  

    const propertyList = querySnapshot.docs.map((document) => ({  
      id: document.id,  
      ...document.data(),  
    })) as Property[];  

    setProperties(propertyList);  
  } catch (error: any) {  
    setError(error.message || "Failed to load properties");  
  } finally {  
    setLoading(false);  
  }  
};  

fetchProperties();

}, []);

return (
<main className="min-h-screen bg-gray-100">
<Navbar />

<section className="bg-white py-20 px-4 text-center">  
    <h2 className="text-5xl font-bold text-gray-900">  
      Find Rooms Without Brokerage  
    </h2>  

    <p className="mt-4 text-gray-600 text-lg">  
      Connect directly with property owners.  
    </p>  

    <div className="mt-10 max-w-6xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 p-6">  
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">  
        <input  
          type="text"  
          placeholder="🔍 Search city, area, room..."  
          value={search}  
          onChange={(e) => setSearch(e.target.value)}  
          className="border-2 border-gray-300 bg-white text-black placeholder:text-gray-500 px-4 py-3 rounded-lg w-full focus:outline-none focus:border-blue-600"  
        />  

        <select  
          value={propertyType}  
          onChange={(e) => setPropertyType(e.target.value)}  
          className="border-2 border-gray-300 bg-white text-black px-4 py-3 rounded-lg w-full focus:outline-none focus:border-blue-600"  
        >  
          <option value="">All Types</option>  
          <option value="Single Room">Single Room</option>  
          <option value="1 BHK">1 BHK</option>  
          <option value="2 BHK">2 BHK</option>  
          <option value="3 BHK">3 BHK</option>  
          <option value="PG">PG</option>  
        </select>  

        <input  
          type="number"  
          placeholder="Min Rent"  
          value={minRent}  
          onChange={(e) => setMinRent(e.target.value)}  
          className="border-2 border-gray-300 bg-white text-black placeholder:text-gray-500 px-4 py-3 rounded-lg w-full focus:outline-none focus:border-blue-600"  
        />  

        <input  
          type="number"  
          placeholder="Max Rent"  
          value={maxRent}  
          onChange={(e) => setMaxRent(e.target.value)}  
          className="border-2 border-gray-300 bg-white text-black placeholder:text-gray-500 px-4 py-3 rounded-lg w-full focus:outline-none focus:border-blue-600"  
        />  

        <button  
          type="button"  
          onClick={clearFilters}  
          className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-black"  
        >  
          Clear  
        </button>  
      </div>  
    </div>  
  </section>  

  <section className="py-16 px-6">  
    <h2 className="text-4xl font-bold text-center mb-3">  
      Available Properties  
    </h2>  

    <p className="text-center text-gray-500 mb-10">  
      Showing {filteredProperties.length} property result  
      {filteredProperties.length === 1 ? "" : "s"}  
    </p>  

    {loading ? (  
      <p className="text-center text-gray-500">Loading properties...</p>  
    ) : error ? (  
      <p className="text-center text-red-600">{error}</p>  
    ) : filteredProperties.length === 0 ? (  
      <p className="text-center text-gray-500">  
        No matching properties found.  
      </p>  
    ) : (  
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">  
        {filteredProperties.map((property) => (  
          <div  
            key={property.id}  
            className="bg-white rounded-xl shadow-lg p-5 hover:shadow-2xl transition"  
          >  
            {property.imageUrl ? (  
              <img  
                src={property.imageUrl}  
                alt={property.title || "Property Image"}  
                className="w-full h-48 object-cover rounded-lg"  
              />  
            ) : (  
              <div className="bg-gray-300 h-48 rounded-lg flex items-center justify-center text-gray-600">  
                Property Image  
              </div>  
            )}  

            <h3 className="text-2xl font-semibold mt-4">  
              {property.title || "Untitled Property"}  
            </h3>  

            <p className="text-gray-600 mt-2">  
              📍 {property.location || "Location not added"}  
            </p>  

            <p className="text-blue-600 font-bold mt-2">  
              ₹{property.rent || "0"} / Month  
            </p>  

            <p className="text-gray-600 mt-2">  
              🏠 {property.type || "Property"}  
            </p>  

            <p className="text-gray-600 mt-2">  
              📞 {property.contact || "Contact not added"}  
            </p>  

            <div className="mt-4 flex flex-wrap gap-2">  
              <Link  
                href={`/property/${property.id}`}  
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"  
              >  
                View Details  
              </Link>  

              <button  
                onClick={() => saveFavorite(property)}  
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"  
              >  
                ❤️ Save  
              </button>  
            </div>  
          </div>  
        ))}  
      </div>  
    )}  
  </section>  

  <Footer />  
</main>

);
}