<template>
  <div class="background" :style="{ backgroundImage: `url(${backgroundImage})` }" @touchstart="handleTouchStart"
    @touchend="handleTouchEnd" @mousedown="handleMouseDown" @mouseup="handleMouseUp">
  </div>
</template>

<script lang="ts">
import { defineComponent, watch, ref, nextTick, Ref } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import goodAir from '../assets/GuteLuft.gif';
import moderateAir from '../assets/MaeßigeLuft.gif';
import badAir from '../assets/SchlechteLuft.gif';
import { onMounted } from 'vue';
import Shepherd from 'shepherd.js';

console.log("Startseite beginn");

export default defineComponent({
  setup() {
    console.log("Startseite setup erreicht");
    const router = useRouter();
    const store = useStore();
    const touchStartX = ref(0);
    const touchEndX = ref(0);
    const isMouseDown = ref(false);
    const mouseXStart = ref(0);
    const mouseXEnd = ref(0);
    const backgroundImage = ref(goodAir); // Initialer Wert
    const tour = ref<Shepherd.Tour | null>(null);

    onMounted(() => {
      const metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      metaDescription.content = 'Willkommen bei Air Guardian, Ihrer Anlaufstelle für Echtzeit-Luftqualitätsüberwachung. Behalten Sie die Luftqualität in Ihrer Umgebung im Blick und schützen Sie Ihre Gesundheit.';
      document.head.appendChild(metaDescription);
      if (!tour.value && store.state.currentTutorialStep === 'homepage' && !store.state.tutorialCompleted) {
        initializeHomePageTutorial();
      }
    });

    function initializeHomePageTutorial() {
      tour.value = new Shepherd.Tour({
        useModalOverlay: true,
        defaultStepOptions: {
          classes: 'shadow-md bg-purple-dark',
          scrollTo: true
        }
      });

      // Schritt 3: Background
      tour.value.addStep({
        id: 'background',
        text: `
        <div class="tutorial-background" role="dialog" aria-labelledby="backgroundLabel">
          <span>Der Hintergrund passt sich dynamisch an deine Umgebungsverhältnisse an.</span>
          <img class="background-good" src="images/GuteLuft.png" alt="Gute Luft"></img>
          <img class="background-medium" src="images/MaessigeLuft.png" alt="Mäßige Luft"></img>
          <img class="background-bad" src="images/SchlechteLuft.png" alt="Schlechte Luft"></img>
        </div>`
        ,
        attachTo: { element: '.background', on: 'bottom' },
        buttons: [
          {
            text: 'Weiter 3/5',
            action: tour.value.next
          }
        ]
      });

      // Schritt 4: Wischgesten-Navigation
      tour.value.addStep({
        id: 'swipe-navigation',
        text: `
    <div class="tutorial-swipe-right" role="dialog" aria-labelledby="swipeRightDialogLabel">
      <span>Wische nach rechts, um zu den Diagrammen zu gelangen.</span>
      <br>
      <img class="swipe-gif" src="images/swipe.gif" alt="Swipe Right"></img>
    </div>
    `,
        buttons: [
          {
            text: 'Weiter 4/5',
            action: tour.value.next
          }
        ]
      });

      // Schritt 5: Wischgesten-Navigation
      tour.value.addStep({
        id: 'swipe-navigation-left',
        text: `
              <div class="tutorial-swipe-left" role="dialog" aria-labelledby="swipeLeftDialogLabel">
                  <span>Wische nach links, um zur Karte zu gelangen.</span>
                  <br>
                  <img class="swipe-gif" src="images/swipe-left.gif" alt="Swipe Left"></img>
              </div>
            `,
        buttons: [
          {
            text: 'Fertig 5/5',
            action: () => {
              if (tour.value) {
                tour.value.next();
                store.commit('SET_CURRENT_TUTORIAL_STEP', 'dashboard');
              }
            }
          }
        ]
      });
    }

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.value = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      touchEndX.value = e.changedTouches[0].clientX;
      handleSwipeGesture();
    };

    const handleMouseDown = (e: MouseEvent) => {
      isMouseDown.value = true;
      mouseXStart.value = e.clientX;
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!isMouseDown.value) return;
      isMouseDown.value = false;
      mouseXEnd.value = e.clientX;
      handleSwipeGesture(true); // true für Maus-Event
    };

    const handleSwipeGesture = (isMouseEvent = false) => {
      const minSwipeDistance = 30; // Minimale Distanz für einen Swipe
      const start = isMouseEvent ? mouseXStart.value : touchStartX.value;
      const end = isMouseEvent ? mouseXEnd.value : touchEndX.value;
      if (end - start > minSwipeDistance) {
        // Swipe nach rechts
        router.push({ name: 'Dashboard' });
      } else if (start - end > minSwipeDistance) {
        // Swipe nach links
        router.push({ name: 'MapView' });
      }
    };

    watch(store.state.co2Values, (newValue: number | null) => {
      nextTick().then(() => {
        if (newValue !== null) {
          if (newValue < 1000) {
            backgroundImage.value = goodAir;
          } else if (newValue < 2000) {
            backgroundImage.value = moderateAir;
          } else {
            backgroundImage.value = badAir;
          }
        }
      })
    });

    watch(() => store.state.currentTutorialStep, (newStep) => {
      if (newStep === 'homepage' && !store.state.tutorialCompleted) {
        initializeHomePageTutorial();
        if (tour.value) {
          tour.value.start();
        }
      }
    });

    const goToDashboard = () => {
      router.push({ name: 'Dashboard' });
    };

    return {
      goToDashboard,
      backgroundImage,
      handleTouchStart,
      handleTouchEnd,
      handleMouseDown,
      handleMouseUp
    };
  },
})
</script>

<style scoped>
.background {
  background-size: cover;
  background-position: center;
  transition: background-image 3s ease-in-out;
  width: 100vw;
  height: 100vh;
}
</style>

