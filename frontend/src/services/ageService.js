
const API_BASE_URL =  "http://127.0.0.1:5000";


export const calculateAgeAPI = async (dob) => {
  const response = await fetch(`${API_BASE_URL}/api/calculate-age`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dob}), // send as entered by user
  });

  if (!response.ok) throw new Error("Failed to calculate age");
  return response.json();
};
