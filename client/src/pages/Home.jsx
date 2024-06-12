import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import SwiperCore from "swiper";
import "swiper/css/bundle";
import ListingItem from "../components/ListingItem";

export default function Home() {
  const [priceNegotiableListings, setPriceNegotiableListings] = useState([]);
  const [sharedRoomListings, setSharedRoomListings] = useState([]);
  const [ownRoomListings, setOwnRoomListings] = useState([]);
  SwiperCore.use([Navigation]);
  console.log(priceNegotiableListings);
  useEffect(() => {
    const fetchPriceNegotiableListings = async () => {
      try {
        const res = await fetch(
          "/api/listing/get?priceNegotiable=true&limit=4"
        );
        const data = await res.json();
        setPriceNegotiableListings(data);
        fetchOwnRoomListings();
      } catch (error) {
        console.log(error);
      }
    };
    const fetchOwnRoomListings = async () => {
      try {
        const res = await fetch("/api/listing/get?type=ownRoom&limit=4");
        const data = await res.json();
        setOwnRoomListings(data);
        fetchSharedRoomListings();
      } catch (error) {
        console.log(error);
      }
    };

    const fetchSharedRoomListings = async () => {
      try {
        const res = await fetch("/api/listing/get?type=sharedRoom&limit=4");
        const data = await res.json();
        setSharedRoomListings(data);
      } catch (error) {
        log(error);
      }
    };
    fetchPriceNegotiableListings();
  }, []);

  return (
    <div>
      {/* top */}
      <div className="relative w-full h-[60vh] overflow-hidden">
        <video
          autoPlay
          loop
          muted
          className="absolute top-0 left-0 w-full h-full object-cover"
        >
          <source src="/IMG_0.MOV" type="video/mp4" />
          Your browser does not support
          <source src="IMG_0.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute top-0 left-0 w-full h-2/3 flex flex-col justify-center items-center text-center z-10 p-8">
          <h1 className="text-white font-bold text-3xl lg:text-6xl">
            <span className="text-white">Subleases.</span> Made. Simple
          </h1>
          <div className="text-gray-200 text-base sm:text-lg mt-4">
            WiscoSubleases is the best place to find and post subleases
            <br />
            Need a room? Explore wide variety of student campus subleases below.
          </div>
          <Link
            to={"/search"}
            className="text-xs sm:text-sm text-white font-bold bg-red-800 py-2 px-4 mt-6 rounded-lg hover:bg-red-700"
          >
            Explore Subleases...
          </Link>
        </div>
        <div className="absolute inset-0 bg-black opacity-50 z-0"></div>
      </div>

      {/* listing results for price negotiable properties, shared and own rooms */}
      <div className="max-w-6xl mx-auto p-3 flex flex-col gap-8 my-10">
        {priceNegotiableListings && priceNegotiableListings.length > 0 && (
          <div className="">
            <div className="my-3">
              <h2 className="text-2xl font-semibold text-slate-600">
                Recent Price Negotiable Properties
              </h2>
              <Link
                className="text-sm text-blue-800 hover:underline"
                to={"/search?priceNegotiable=true"}
              >
                Show more
              </Link>
            </div>
            <div className="flex flex-wrap gap-4">
              {priceNegotiableListings.map((listing) => (
                <ListingItem listing={listing} key={listing._id} />
              ))}
            </div>
          </div>
        )}
        {ownRoomListings && ownRoomListings.length > 0 && (
          <div className="">
            <div className="my-3">
              <h2 className="text-2xl font-semibold text-slate-600">
                Recent Places for a Private Room
              </h2>
              <Link
                className="text-sm text-blue-800 hover:underline"
                to={"/search?type=ownRoom"}
              >
                Show more
              </Link>
            </div>
            <div className="flex flex-wrap gap-4">
              {ownRoomListings.map((listing) => (
                <ListingItem listing={listing} key={listing._id} />
              ))}
            </div>
          </div>
        )}
        {sharedRoomListings && sharedRoomListings.length > 0 && (
          <div className="">
            <div className="my-3">
              <h2 className="text-2xl font-semibold text-slate-600">
                Recent places for Shared Room
              </h2>
              <Link
                className="text-sm text-blue-800 hover:underline"
                to={"/search?type=sharedRoom"}
              >
                Show more
              </Link>
            </div>
            <div className="flex flex-wrap gap-4">
              {sharedRoomListings.map((listing) => (
                <ListingItem listing={listing} key={listing._id} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
