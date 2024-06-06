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
      <div className="flex flex-col gap-6 p-28 px-3 max-w-6xl mx-auto">
        <h1 className="text-slate-700 font-bold text-3xl lg:text-6xl">
          Find Your Perfect Fit:{" "}
          <span className="text-slate-500">Subleases</span>
          <br />
          Made Simple
        </h1>
        <div className="text-gray-400 text-xs sm:text-sm">
          UWSubleaseHub is the best way to find subleases on campus
          <br />
          Explore a diverse selection of student sublease listings
        </div>
        <Link
          to={"/search"}
          className="text-xs sm:text-sm text-blue-800 font-bold hover:underline"
        >
          Let's get started...
        </Link>
      </div>

      {/* swiper */}
      <Swiper navigation>
        {ownRoomListings &&
          ownRoomListings.length > 0 &&
          ownRoomListings.map((listing) => (
            <SwiperSlide>
              <div
                style={{
                  background: `url(${listing.imageUrls[0]}) center no-repeat`,
                  backgroundSize: "cover",
                }}
                className="h-[500px]"
                key={listing._id}
              ></div>
            </SwiperSlide>
          ))}
      </Swiper>

      {/* listing results for price negotiable properies, shared and own rooms */}

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
                Recent Places for Your Own Room
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
