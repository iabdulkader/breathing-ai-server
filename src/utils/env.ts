export const checkEnvVariables = () => {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not defined in .env file");
    } else if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in .env file");
    }
  
  };