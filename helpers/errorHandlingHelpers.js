// Error handling function
export const handleError = (error, context = "An error occurred") => {
  console.error(`${context}:`, error.message);
  return { success: false, error: error.message };
};
