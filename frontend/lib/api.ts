import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;

export const aiApi = {
  askQuestion: async (
    question: string,
    history: { role: string; content: string }[] = []
  ) => {
    const response = await api.post("/query", {
      question,
      history,
    });

    return response.data;
  },
};