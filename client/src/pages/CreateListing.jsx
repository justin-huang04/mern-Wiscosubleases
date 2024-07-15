import { useState, useEffect, useRef } from "react";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import imageCompression from "browser-image-compression";

export default function CreateListing() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    imageUrls: [],
    name: "",
    description: "",
    address: "",
    type: "ownRoom",
    contact: "",
    roommates: 1,
    bathrooms: 1,
    regularPrice: 500,
    discountPrice: 350,
    priceNegotiable: false,
    parking: false,
    gender: "Any Gender",
    leaseDates: "",
  });
  const [imageUploadError, setImageUploadError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [addressValid, setAddressValid] = useState(true);
  const addressInputRef = useRef(null);
  const autocompleteRef = useRef(null);

  useEffect(() => {
    if (window.google) {
      const autocomplete = new window.google.maps.places.Autocomplete(
        addressInputRef.current,
        {
          fields: ["place_id", "formatted_address"],
          types: ["geocode", "establishment"],
          componentRestrictions: { country: "us" },
        }
      );

      autocompleteRef.current = autocomplete;

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place && place.formatted_address) {
          setFormData((prevData) => ({
            ...prevData,
            address: place.formatted_address,
          }));
          setAddressValid(true);
        }
      });
    }
  }, []);

  const validateAddress = async (address) => {
    if (address.trim() === "") {
      setAddressValid(false);
      return false;
    }

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address
        )}&key=AIzaSyCEbvfaPXGTFbxQHr4CbxkqnUYIqm3F5uo`
      );
      const data = await response.json();

      if (data.status === "OK" && data.results.length > 0) {
        setAddressValid(true);
        return true;
      } else {
        setAddressValid(false);
        return false;
      }
    } catch (error) {
      console.error("Error validating address:", error);
      setAddressValid(false);
      return false;
    }
  };

  const handleImageSubmit = (e) => {
    if (files.length > 0 && files.length + formData.imageUrls.length < 7) {
      setUploading(true);
      setImageUploadError(false);
      const promises = [];

      for (let i = 0; i < files.length; i++) {
        promises.push(storeImage(files[i]));
      }
      Promise.all(promises)
        .then((urls) => {
          setFormData((prevData) => ({
            ...prevData,
            imageUrls: prevData.imageUrls.concat(urls),
          }));
          setImageUploadError(false);
          setUploading(false);
        })
        .catch((err) => {
          setImageUploadError("Image upload failed (2 mb max per image)");
          setUploading(false);
        });
    } else {
      setImageUploadError("Max 6 images per listing");
      setUploading(false);
    }
  };

  const storeImage = async (file) => {
    try {
      // Compress the image
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 2,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      });

      return new Promise((resolve, reject) => {
        const storage = getStorage(app);
        const fileName = new Date().getTime() + compressedFile.name;
        const storageRef = ref(storage, fileName);
        const uploadTask = uploadBytesResumable(storageRef, compressedFile);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Upload is ${progress}% done`);
          },
          (error) => {
            reject(error);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              resolve(downloadURL);
            });
          }
        );
      });
    } catch (error) {
      console.error("Error compressing image:", error);
      throw error;
    }
  };
  const handleRemoveImage = (index) => {
    setFormData((prevData) => ({
      ...prevData,
      imageUrls: prevData.imageUrls.filter((_, i) => i !== index),
    }));
  };

  const handleChange = async (e) => {
    const { id, value, type, checked } = e.target;

    if (type === "checkbox") {
      if (id === "ownRoom" || id === "sharedRoom") {
        setFormData((prevData) => ({
          ...prevData,
          type: id === "ownRoom" ? "ownRoom" : "sharedRoom",
        }));
      } else {
        setFormData((prevData) => ({
          ...prevData,
          [id]: checked,
        }));
      }
    } else if (type === "select-one") {
      setFormData((prevData) => ({
        ...prevData,
        [id]: value,
      }));
    } else if (type === "number" || type === "text" || type === "textarea") {
      setFormData((prevData) => ({
        ...prevData,
        [id]: value,
      }));
    }

    if (id === "address") {
      setFormData((prevData) => ({
        ...prevData,
        address: value,
      }));
      const isValid = await validateAddress(value);
      setAddressValid(isValid);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.imageUrls.length < 1)
        return setError("You must upload at least one image");

      if (+formData.regularPrice < +formData.discountPrice)
        return setError("Discount price must be lower than regular price");

      // Validate address before submitting
      if (!(await validateAddress(formData.address))) {
        return setError("Please enter a valid address");
      }

      setLoading(true);
      setError(false);
      const res = await fetch("/api/listing/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          userRef: currentUser._id,
        }),
      });
      const data = await res.json();
      setLoading(false);
      if (data.success === false) {
        setError(data.message);
      }
      navigate(`/listing/${data._id}`);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <main className="p-3 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">
        Create a Listing
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
        <div className="flex flex-col gap-4 flex-1">
          <input
            type="text"
            placeholder="Name"
            className="border p-3 rounded-lg"
            id="name"
            maxLength="62"
            minLength="5"
            required
            onChange={handleChange}
            value={formData.name}
          />
          <textarea
            type="text"
            placeholder="Description. Can include ammenities: laundry, nearby places, other flexibilities"
            className="border p-3 rounded-lg"
            id="description"
            required
            onChange={handleChange}
            value={formData.description}
          />
          <input
            type="text"
            placeholder="Address"
            className={`border p-3 rounded-lg ${
              !addressValid ? "border-red-500" : ""
            }`}
            id="address"
            required
            onChange={handleChange}
            value={formData.address}
            ref={addressInputRef}
          />
          {!addressValid && (
            <p className="text-red-500 text-sm">Please enter a valid address</p>
          )}
          <input
            type="text"
            placeholder="Available Dates: (MM/DD/YYYY - MM/DD/YYYY)"
            className="border p-3 rounded-lg"
            id="leaseDates"
            required
            pattern="^([1-9]|0[1-9]|1[0-2])\/([1-9]|0[1-9]|[12]\d|3[01])\/\d{4}\s?-\s?([1-9]|0[1-9]|1[0-2])\/([1-9]|0[1-9]|[12]\d|3[01])\/\d{4}$"
            onChange={handleChange}
            value={formData.leaseDates}
            title="Please enter valid date in the format: MM/DD/YYYY - MM/DD/YYYY"
          />
          <textarea
            type="text"
            placeholder="Contact Info: Phone Number, Email, Snapchat etc."
            className="border p-3 rounded-lg"
            id="contact"
            required
            onChange={handleChange}
            value={formData.contact}
          />
          <div className="flex gap-6 flex-wrap">
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="ownRoom"
                className="w-5"
                onChange={handleChange}
                checked={formData.type === "ownRoom"}
              />
              <span>Private Room</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="sharedRoom"
                className="w-5"
                onChange={handleChange}
                checked={formData.type === "sharedRoom"}
              />
              <span>Shared Room</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="parking"
                className="w-5"
                onChange={handleChange}
                checked={formData.parking}
              />
              <span>Parking spot</span>
            </div>
            <div className="flex gap-2 items-center">
              <span>Preferred Gender:</span>
              <select
                type="select-one"
                id="gender"
                className="p-3 border border-gray-300 rounded-lg"
                onChange={handleChange}
                value={formData.gender}
                required
              >
                <option value="">Select Gender</option>
                <option value="Any Gender">Any Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="roommates"
                min="1"
                max="10"
                required
                className="p-3 border border-gray-300 rounded-lg"
                onChange={handleChange}
                value={formData.roommates}
              />
              <p>Roommates</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="bathrooms"
                min="1"
                max="10"
                required
                className="p-3 border border-gray-300 rounded-lg"
                onChange={handleChange}
                value={formData.bathrooms}
              />
              <p>Bathrooms</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="regularPrice"
                min="50"
                max="10000000"
                required
                className="p-3 border border-gray-300 rounded-lg"
                onChange={handleChange}
                value={formData.regularPrice}
              />
              <div className="flex flex-col items-center">
                <p>Regular price</p>
                {formData.type === "ownRoom" && (
                  <span className="text-xs">($ / month)</span>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="checkbox"
                  id="priceNegotiable"
                  className="w-5"
                  onChange={handleChange}
                  checked={formData.priceNegotiable}
                />
                <span>Price Negotiable (List a discounted price below)</span>
              </div>
            </div>
            {formData.priceNegotiable && (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  id="discountPrice"
                  min="0"
                  max="10000000"
                  required
                  className="p-3 border border-gray-300 rounded-lg"
                  onChange={handleChange}
                  value={formData.discountPrice}
                />
                <div className="flex flex-col items-center">
                  <p>
                    Discounted price (If negotiable but no discount listing,
                    match discount and regular price)
                  </p>

                  {formData.type === "rent" && (
                    <span className="text-xs">($ / month)</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col flex-1 gap-4">
          <p className="font-semibold">
            Images:
            <span className="font-normal text-gray-600 ml-2">
              The first image will be the cover (max 6)
            </span>
          </p>
          <div className="flex gap-4">
            <input
              onChange={(e) => setFiles(e.target.files)}
              className="p-3 border border-gray-300 rounded w-full"
              type="file"
              id="images"
              accept="image/*"
              multiple
            />
            <button
              type="button"
              disabled={uploading}
              onClick={handleImageSubmit}
              className="p-3 text-green-700 border border-green-700 rounded uppercase hover:shadow-lg disabled:opacity-80"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
          <p className="text-red-700 text-sm">
            {imageUploadError && imageUploadError}
          </p>
          {formData.imageUrls.length > 0 &&
            formData.imageUrls.map((url, index) => (
              <div
                key={url}
                className="flex justify-between p-3 border items-center"
              >
                <img
                  src={url}
                  alt="listing image"
                  className="w-20 h-20 object-contain rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="p-3 text-red-700 rounded-lg uppercase hover:opacity-75"
                >
                  Delete
                </button>
              </div>
            ))}
          <button
            disabled={loading || uploading}
            className="p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80"
          >
            {loading ? "Creating..." : "Create listing"}
          </button>
          {error && <p className="text-red-700 text-sm">{error}</p>}
        </div>
      </form>
    </main>
  );
}
