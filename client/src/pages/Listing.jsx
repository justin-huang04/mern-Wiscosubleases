import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore from "swiper";
import { useSelector } from "react-redux";
import { Navigation } from "swiper/modules";
import "swiper/css/bundle";
import {
  FaBath,
  FaDoorClosed,
  FaFemale,
  FaMale,
  FaMapMarkerAlt,
  FaParking,
  FaShare,
} from "react-icons/fa";
import { BiMaleFemale } from "react-icons/bi";
import Contact from "../components/Contact";

// Load Google Maps script
const loadScript = (url) => {
  const script = document.createElement("script");
  script.src = url;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
};

export default function Listing() {
  SwiperCore.use([Navigation]);
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [contact, setContact] = useState(false);
  const params = useParams();
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/listing/get/${params.listingId}`);
        const data = await res.json();
        if (data.success === false) {
          setError(true);
          setLoading(false);
          return;
        }
        setListing(data);
        setLoading(false);
        setError(false);
      } catch (error) {
        setError(true);
        setLoading(false);
      }
    };
    fetchListing();
  }, [params.listingId]);

  useEffect(() => {
    if (listing) {
      loadScript(
        `https://maps.googleapis.com/maps/api/js?key=AIzaSyCEbvfaPXGTFbxQHr4CbxkqnUYIqm3F5uo&callback=initMap`
      );
      window.initMap = () => {
        const map = new google.maps.Map(document.getElementById("map"), {
          zoom: 14,
          center: { lat: -34.397, lng: 150.644 }, // Default coordinates
        });

        const geocoder = new google.maps.Geocoder();
        geocodeAddress(geocoder, map, listing.address);
      };
    }
  }, [listing]);

  const geocodeAddress = (geocoder, map, address) => {
    geocoder.geocode({ address: address }, (results, status) => {
      if (status === "OK") {
        map.setCenter(results[0].geometry.location);
        new google.maps.Marker({
          map: map,
          position: results[0].geometry.location,
        });
      } else {
        console.error(
          "Geocode was not successful for the following reason: " + status
        );
      }
    });
  };

  return (
    <main>
      {loading && <p className="text-center my-7 text-2xl">Loading...</p>}
      {error && (
        <p className="text-center my-7 text-2xl">Something went wrong!</p>
      )}
      {listing && !loading && !error && (
        <div>
          <Swiper navigation>
            {listing.imageUrls.map((url) => (
              <SwiperSlide key={url}>
                <div
                  className="h-[550px]"
                  style={{
                    background: `url(${url}) center no-repeat`,
                    backgroundSize: "cover",
                  }}
                ></div>
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="fixed top-[13%] right-[3%] z-10 border rounded-full w-12 h-12 flex justify-center items-center bg-slate-100 cursor-pointer">
            <FaShare
              className="text-slate-500"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                setCopied(true);
                setTimeout(() => {
                  setCopied(false);
                }, 2000);
              }}
            />
          </div>
          {copied && (
            <p className="fixed top-[23%] right-[5%] z-10 rounded-md bg-slate-100 p-2">
              Link copied!
            </p>
          )}
          <div className="flex flex-col max-w-4xl mx-auto p-3 my-7 gap-4">
            <p className="text-2xl font-semibold">
              {listing.name} - ${""}
              {listing.priceNegotiable
                ? `${listing.discountPrice.toLocaleString("en-US")} per month`
                : `${listing.regularPrice.toLocaleString("en-US")} per month`}
            </p>
            <p className="flex items-center mt-6 gap-2 text-slate-600 text-sm address">
              <FaMapMarkerAlt className="text-green-700" />
              {listing.address}
            </p>
            <p className="flex items-center mt-2 gap-2 text-black text-sm">
              Available: {listing.leaseDates}
            </p>
            <div className="flex gap-4">
              <p className="bg-red-900 w-full max-w-[200px] text-white text-center p-1 rounded-md flex items-center justify-center h-12">
                {listing.type === "ownRoom" ? "Private Room" : "Shared Room"}
              </p>
              {listing.priceNegotiable && (
                <p className="bg-green-900 w-full max-w-[200px] text-white text-center p-1 rounded-md">
                  {+listing.regularPrice - +listing.discountPrice > 0
                    ? `Price Negotiable - $${
                        +listing.regularPrice - +listing.discountPrice
                      }/month OFF`
                    : "Price Negotiable"}
                </p>
              )}
            </div>
            <p className="text-slate-800">
              <span className="font-semibold text-black">Description - </span>
              {listing.description}
            </p>
            <ul className="text-green-900 font-semibold text-sm flex flex-wrap items-center gap-4 sm:gap-6">
              <li className="flex items-center gap-1 whitespace-nowrap">
                {listing.gender === "Female" && (
                  <FaFemale className="text-lg" />
                )}
                {listing.gender === "Male" && <FaMale className="text-lg" />}
                {listing.gender === "Any Gender" && (
                  <BiMaleFemale className="text-lg" />
                )}
                {listing.gender === "Male" && "Male preferred"}
                {listing.gender === "Female" && "Female preferred"}
                {listing.gender === "Any Gender" && "Any gender preferred"}
              </li>
              <li className="flex items-center gap-1 whitespace-nowrap ">
                <FaDoorClosed className="text-lg" />
                {listing.bedrooms > 1
                  ? `${listing.roommates} roommates`
                  : `${listing.roommates} roommate`}
              </li>
              <li className="flex items-center gap-1 whitespace-nowrap ">
                <FaBath className="text-lg" />
                {listing.bathrooms > 1
                  ? `${listing.bathrooms} baths`
                  : `${listing.bathrooms} bath`}
              </li>
              <li className="flex items-center gap-1 whitespace-nowrap ">
                <FaParking className="text-lg" />
                {listing.parking ? "Parking spot" : "No Parking"}
              </li>
            </ul>
            {currentUser && listing.userRef !== currentUser._id && !contact && (
              <button
                onClick={() => setContact(true)}
                className="bg-slate-700 text-white rounded-lg uppercase hover p-3"
              >
                Contact Subleaser
              </button>
            )}
            {contact && <Contact listing={listing} />}
            <div id="map" className="w-full h-96 mt-6"></div>
          </div>
        </div>
      )}
    </main>
  );
}
