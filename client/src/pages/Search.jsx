import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ListingItem from "../components/ListingItem";

// Load Google Maps script
const loadScript = (url) => {
  const script = document.createElement("script");
  script.src = url;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
};

export default function Search() {
  const navigate = useNavigate();
  const [sidebardata, setSidebardata] = useState({
    searchTerm: "",
    type: "all",
    parking: false,
    gender: "Any Gender",
    priceNegotiable: false,
    sort: "createdAt",
    order: "desc",
    maxPrice: 1000,
  });

  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState([]);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get("searchTerm");
    const typeFromUrl = urlParams.get("type");
    const parkingFromUrl = urlParams.get("parking");
    const genderFromUrl = urlParams.get("gender");
    const priceNegotiableFromUrl = urlParams.get("priceNegotiable");
    const sortFromUrl = urlParams.get("sort");
    const orderFromUrl = urlParams.get("order");
    const maxPriceFromUrl = urlParams.get("maxPrice");

    if (
      searchTermFromUrl !== null ||
      typeFromUrl !== null ||
      parkingFromUrl !== null ||
      genderFromUrl !== null ||
      priceNegotiableFromUrl !== null ||
      sortFromUrl !== null ||
      orderFromUrl !== null ||
      maxPriceFromUrl !== null
    ) {
      setSidebardata({
        searchTerm: searchTermFromUrl || "",
        type: typeFromUrl || "all",
        parking: parkingFromUrl === "true" ? true : false,
        gender: genderFromUrl || "Any Gender",
        priceNegotiable: priceNegotiableFromUrl === "true" ? true : false,
        sort: sortFromUrl || "createdAt",
        order: orderFromUrl || "desc",
        maxPrice: maxPriceFromUrl ? parseInt(maxPriceFromUrl) : 1000,
      });
    }

    const fetchListings = async () => {
      setLoading(true);
      setShowMore(false);
      const searchQuery = urlParams.toString();
      const res = await fetch(`/api/listing/get?${searchQuery}`);
      const data = await res.json();
      if (data.length > 9) {
        setShowMore(true);
      } else {
        setShowMore(false);
      }
      setListings(data);
      setLoading(false);
    };

    fetchListings();
  }, [location.search]);

  useEffect(() => {
    if (listings.length > 0) {
      loadScript(
        `https://maps.googleapis.com/maps/api/js?key=AIzaSyCEbvfaPXGTFbxQHr4CbxkqnUYIqm3F5uo&callback=initMap`
      );
      window.initMap = () => {
        const map = new google.maps.Map(document.getElementById("map"), {
          zoom: 14,
          center: { lat: 43.0731, lng: -89.4012 }, // Madison, Wisconsin
        });

        const geocoder = new google.maps.Geocoder();

        listings.forEach((listing, index) => {
          geocodeAddress(geocoder, map, listing, index);
        });
      };
    }
  }, [listings]);

  const geocodeAddress = (geocoder, map, listing, index) => {
    geocoder.geocode({ address: listing.address }, (results, status) => {
      if (status === "OK") {
        const marker = new google.maps.Marker({
          map: map,
          position: results[0].geometry.location,
          title: listing.address,
        });

        marker.addListener("mouseover", () => {
          document
            .getElementById(`listing-${index}`)
            .classList.add("highlight");
        });

        marker.addListener("mouseout", () => {
          document
            .getElementById(`listing-${index}`)
            .classList.remove("highlight");
        });

        marker.addListener("click", () => {
          setListings(listings.filter((l) => l.address === listing.address));
        });
      } else {
        console.error(
          "Geocode was not successful for the following reason: " + status
        );
      }
    });
  };

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;

    if (id === "all" || id === "ownRoom" || id === "sharedRoom") {
      setSidebardata({ ...sidebardata, type: id });
    } else if (id === "searchTerm") {
      setSidebardata({ ...sidebardata, searchTerm: value });
    } else if (id === "parking" || id === "priceNegotiable") {
      setSidebardata({
        ...sidebardata,
        [id]: type === "checkbox" ? checked : value,
      });
    } else if (id === "maxPrice") {
      setSidebardata({
        ...sidebardata,
        maxPrice: value ? parseInt(value) : "",
      });
    } else if (id === "gender") {
      setSidebardata({ ...sidebardata, gender: value });
    } else if (id === "sort_order") {
      const sort = value.split("_")[0] || "createdAt";
      const order = value.split("_")[1] || "desc";
      setSidebardata({ ...sidebardata, sort, order });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams();
    urlParams.set("searchTerm", sidebardata.searchTerm);
    urlParams.set("type", sidebardata.type);
    urlParams.set("parking", sidebardata.parking);
    urlParams.set("gender", sidebardata.gender);
    urlParams.set("priceNegotiable", sidebardata.priceNegotiable);
    urlParams.set("sort", sidebardata.sort);
    urlParams.set("order", sidebardata.order);
    urlParams.set("maxPrice", sidebardata.maxPrice);
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  const onShowMoreClick = async () => {
    const numberOfListings = listings.length;
    const startIndex = numberOfListings;
    const urlParams = new URLSearchParams(location.search);
    urlParams.set("startIndex", startIndex);

    const searchQuery = urlParams.toString();
    const res = await fetch(`/api/listing/get?${searchQuery}`);
    const data = await res.json();
    if (data.length < 9) {
      setShowMore(false);
    }
    setListings([...listings, ...data]);
  };

  return (
    <div className="flex flex-col md:flex-row">
      <div className="p-7 border-b-2 md:border-r-2 md:min-h-screen">
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <div className="flex items-center gap-2">
            <label className="whitespace-nowrap font-semibold">
              Search Term:
            </label>
            <input
              type="text"
              id="searchTerm"
              placeholder="Search..."
              className="border rounded-lg p-3 w-full"
              value={sidebardata.searchTerm}
              onChange={handleChange}
            />
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <label className="font-semibold">Type:</label>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="all"
                className="w-5"
                onChange={handleChange}
                checked={sidebardata.type === "all"}
              />
              <span>Private and Shared Room</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="ownRoom"
                className="w-5"
                onChange={handleChange}
                checked={sidebardata.type === "ownRoom"}
              />
              <span>Private Room</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="sharedRoom"
                className="w-5"
                onChange={handleChange}
                checked={sidebardata.type === "sharedRoom"}
              />
              <span>Shared Room</span>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap items-center">
            <label className="font-semibold">Max budget ($ / month):</label>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                id="maxPrice"
                min="0"
                max="1000000000"
                className="border p-2 rounded-lg"
                onChange={handleChange}
                value={sidebardata.maxPrice}
              />
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="priceNegotiable"
                className="w-5"
                onChange={handleChange}
                checked={sidebardata.priceNegotiable}
              />
              <span>Price Negotiable</span>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <label className="font-semibold">Amenities:</label>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="parking"
                className="w-5"
                onChange={handleChange}
                checked={sidebardata.parking}
              />
              <span>Parking</span>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <label className="font-semibold">Preferred Gender:</label>
            <select
              id="gender"
              className="border rounded-lg p-3"
              onChange={handleChange}
              value={sidebardata.gender}
            >
              <option value="Any Gender">Any Gender</option>
              <option value="Male">All Male</option>
              <option value="Female">All Female</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="font-semibold">Sort:</label>
            <select
              onChange={handleChange}
              defaultValue={"createdAt_desc"}
              id="sort_order"
              className="border rounded-lg p-3"
            >
              <option value="regularPrice_desc">Price high to low</option>
              <option value="regularPrice_asc">Price low to high</option>
              <option value="createdAt_desc">Latest</option>
              <option value="createdAt_asc">Oldest</option>
            </select>
          </div>
          <button className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95">
            Search
          </button>
        </form>
      </div>
      <div className="flex-1">
        <h1 className="text-3xl font-semibold border-b p-3 text-slate-700 mt-5">
          Listing results:
        </h1>
        <div className="p-7 flex flex-wrap gap-4">
          {!loading && listings.length === 0 && (
            <p className="text-xl text-slate-700">No listing found!</p>
          )}
          {loading && (
            <p className="text-xl text-slate-700 text-center w-full">
              Loading...
            </p>
          )}

          {!loading &&
            listings &&
            listings.map((listing) => (
              <ListingItem key={listing._id} listing={listing} />
            ))}

          {showMore && (
            <button
              onClick={onShowMoreClick}
              className="text-green-700 hover:underline p-7 text-center w-full"
            >
              Show more
            </button>
          )}
        </div>
        Location of listings - Press markers to get correspondant listing,
        refresh to show all filtered listings again
        <div id="map" style={{ height: "500px", width: "100%" }}></div>
      </div>
    </div>
  );
}
