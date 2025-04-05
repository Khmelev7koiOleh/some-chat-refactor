// composables/useDeleteMessage.js
import { doc, getDoc, updateDoc, arrayRemove } from "firebase/firestore";
import { db } from "../firebase-init";

export function useDeleteMessage() {
  const deleteMessage = async (chatId, messageId) => {
    try {
      // Get reference to the chat document
      const chatRef = doc(db, "chats", chatId);

      // We need to find the exact message object to remove
      // First get the current chat data to find the message
      const chatDoc = await getDoc(chatRef);
      if (!chatDoc.exists()) {
        throw new Error("Chat document not found");
      }

      const messages = chatDoc.data().messages || [];
      const messageToDelete = messages.find((msg) => msg.id === messageId);

      if (!messageToDelete) {
        throw new Error("Message not found");
      }

      // Remove the specific message object from the array
      await updateDoc(chatRef, {
        messages: arrayRemove(messageToDelete),
      });

      console.log("Message successfully deleted");
      return true;
    } catch (error) {
      console.error("Error deleting message:", error);
      throw error;
    }
  };

  return { deleteMessage };
}
