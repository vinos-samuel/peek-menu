require('dotenv').config();

module.exports = ({ config }) => ({
  ...config,
  extra: {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY ?? '',
    PLACES_API_KEY: process.env.PLACES_API_KEY ?? '',
    eas: {
      projectId: '1144f744-a619-4f9d-ada4-d3be6a38d4bc',
    },
  },
});
