import { nextTick } from "vue";

export function useScrollTo() {
  const scrollToLastMessage = async (id) => {
    const objDiv = document.getElementById(id);
    if (objDiv) {
      objDiv.scrollTo({
        top: objDiv.scrollHeight, // Scroll to the bottom
        behavior: "smooth", // Add smooth scrolling
      });
    } else {
      console.log(`Element with ID "${id}" not found.`);
    }
  };

  return { scrollToLastMessage };
}
