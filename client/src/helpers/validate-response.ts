export const validateResponse = (response: {
  data: { success: boolean; error?: string };
}) => {
  const { data } = response;
  if (!data || typeof data.success !== "boolean") {
    throw new Error("Invalid API response format");
  }
  if (!data.success && data.error) {
    throw new Error(data.error);
  }
  return response;
};
