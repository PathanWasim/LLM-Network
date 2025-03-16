import axios from 'axios';

const API_BASE_URL = '/app';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function sendMessageToLLM(message: string): Promise<string> {
  try {
    const response = await axios.post(`${API_BASE_URL}/chat`, {
      message,
    });
    return response.data.content;
  } catch (error) {
    console.error('Error sending message to LLM:', error);
    throw new Error('Failed to get response from LLM');
  }
}