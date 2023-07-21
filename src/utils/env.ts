export const checkEnvVariables = () => {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not defined in .env file");
    }
  
  };