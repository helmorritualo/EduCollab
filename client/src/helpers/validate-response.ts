export const validateResponse = (response: {
  data: { success?: boolean; error?: string };
}) => {
  const { data } = response;
  
  // If data is undefined or null, return the response without validation
  if (!data) {
    return response;
  }
  
  // If success is not a boolean but the response exists, we'll still return it
  // This handles cases where the API doesn't follow the success/error pattern
  if (typeof data.success !== "boolean" && !data.error) {
    return response;
  }
  
  // Only throw an error if success is explicitly false and there's an error message
  if (data.success === false && data.error) {
    throw new Error(data.error);
  }
  
  return response;
};