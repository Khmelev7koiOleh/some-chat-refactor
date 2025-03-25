import { persistentLocalCache } from "firebase/firestore";
import { ref } from "vue";

export function useChangeBackground() {
  const random = ref(0);

  const changeBackground = () => {
    console.log("executed");
    random.value = Math.floor(Math.random() * 300); // Generate new random number
    console.log(random.value);
  };

  return { changeBackground, random };
}
