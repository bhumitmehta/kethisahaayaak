import axios from "./config";
import instance from "./config";
import Cookies from "js-cookie";

const url = "http://localhost:8000";

// Dummy data for fallback
const dummyEquipment = [
  {
    id: 1,
    title: "Dummy Equipment 1",
    description: "This is a dummy equipment description.",
    manufacturer: "Dummy Manufacturer",
    daily_rental: 100,
    hourly_rental: 15,
    // Add other properties as needed
  },
  {
    id: 2,
    title: "Dummy Equipment 2",
    description: "This is another dummy equipment description.",
    manufacturer: "Dummy Manufacturer",
    daily_rental: 150,
    hourly_rental: 20,
    // Add other properties as needed
  },
];

const dummyBrands = [
  { id: 1, name: "Dummy Brand 1" },
  { id: 2, name: "Dummy Brand 2" },
];

const dummyEquipTypes = [
  { id: 1, name: "Dummy Equipment Type 1" },
  { id: 2, name: "Dummy Equipment Type 2" },
];

export const getEquips = async () => {
  try {
    const response = await axios.get(`${url}/api/equipment`);
    return response.data || dummyEquipment; // Return data or dummy data
  } catch (error) {
    console.log("Error while calling getEquips API", error);
    return dummyEquipment; // Return dummy data on error
  }
};

export const getBrands = async () => {
  try {
    const response = await axios.get(`${url}/api/brand/`);
    return response.data || dummyBrands; // Return data or dummy data
  } catch (error) {
    console.log("Error while calling getBrands API", error);
    return dummyBrands; // Return dummy data on error
  }
};

export const getEquip = async (id) => {
  try {
    const response = await axios.get(`/api/equipment/${id}`);
    return response.data || null; // Return data or null
  } catch (error) {
    console.log("Error while calling getEquip API", error);
    return null; // Return null on error
  }
};

export const getEquipsList = async () => {
  try {
    const response = await axios.get("/api/equipment_type");
    return response.data || dummyEquipTypes; // Return data or dummy data
  } catch (error) {
    console.log("Error while calling getEquipsList API", error);
    return dummyEquipTypes; // Return dummy data on error
  }
};

export const createEquipmentReport = async ({
  equipment,
  report_reason,
  description,
}) => {
  try {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Cookies.get("access-token")}`,
    };
    const response = await instance.post(
      "/enquiry/report-equipment",
      {
        equipment,
        report_reason,
        description,
      },
      { headers }
    );
    return response.data || null; // Return data or null
  } catch (error) {
    console.log("Error while calling createEquipmentReport API", error);
    return null; // Return null on error
  }
};

export const createEquipment = async ({
  owner,
  manufacturer,
  title,
  description,
  equipment_type,
  available_start_time,
  available_end_time,
  equipment_location,
  daily_rental,
  hourly_rental,
  manufacturing_year,
  model,
  condition,
  horsepower,
  width,
  height,
}) => {
  try {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Cookies.get("access-token")}`,
    };
    const response = await instance.post(
      "/api/equipment/create/",
      {
        owner,
        manufacturer,
        title,
        description,
        equipment_type,
        available_start_time,
        available_end_time,
        equipment_location,
        daily_rental,
        hourly_rental,
        manufacturing_year,
        model,
        condition,
        horsepower,
        width,
        height,
      },
      { headers }
    );
    return response.data || null; // Return data or null
  } catch (error) {
    console.log("Error while calling createEquipment API", error);
    return null; // Return null on error
  }
};

// Booking api

// export const getBookings = async () => {
//     try {
//         const headers = {
//             "Content-Type": "application/json",
//             Authorization: `"Bearer ${Cookies.get('access-token')}`
//         };
//         return await axios.get('/api/booking' , { headers });
//     } catch(error) {
//         console.log('Error while calling getBookings API', error);
//     }
// }

// export const getBookingDetail = async (id) => {
//     try {
//         const headers = {
//             "Content-Type": "application/json",
//             Authorization: `"Bearer ${Cookies.get('access-token')}`
//         };
//         return await axios.get(`/api/booking/detail/${id}` , { headers });
//     } catch(error) {
//         console.log('Error while calling getBookingDetail API', error);
//     }
// }

// export const updateBooking = async (data, id) => {
//     try {
//         const headers = {
//             "Content-Type": "application/json",
//             Authorization: `"Bearer ${Cookies.get('access-token')}`
//         };
//         return await axios.get(`/api/booking/update/${id}` , { data }, { headers });
//     } catch(error) {
//         console.log('Error while calling getBookingDetail API', error);
//     }
// }

//  Feedback
export const submitFeedback = async ({ name, phone_number, description }) => {
  try {
    return await axios.post("/enquiry/feedback", {
      name,
      phone_number,
      description,
    });
  } catch (error) {
    console.log("Error while calling submitFeedback API", error);
  }
};
