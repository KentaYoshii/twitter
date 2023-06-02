module.exports = {
  preset: "ts-jest",
  roots: ["<rootDir>/"],
  testMatch: ["**/?(*.)+(spec|test).+(ts|tsx|js)"],
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", "tsconfig.json"],
  },
  moduleNameMapper: {
    "src(.*)$": "<rootDir>/src/$1",
  },
};
