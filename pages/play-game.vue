<script setup lang="ts">

const accordionItems = [
  { label: "History", description: "History of the game", icon: 'i-lucide-smile', }
];

import {usePlayers, useSubTime} from "~/states";

let players = usePlayers();
let SubTotalTime = useSubTime()

interface Player {
  id: number;
  name: string;
  timeOnField: number;
  timeOffField: number;
  totalTimeOnField: number;
  totalTimeOffField: number;
  subNow: boolean;
  position: string;
}

let totalTime = useState<number>(() => 0);

let timerStartTime = useState<number>(() => 0);
let diffTime = useState<number>(() => 0);

let lastUpdated = 0;

let onFieldPlayers = useState<Player[]>(() => []);

let offFieldPlayers = useState<Player[]>(() => []);

let pos = 1;
players.value.forEach(player => {
  offFieldPlayers.value.push({
    id: pos, name: player, timeOffField: 0, totalTimeOffField: 0, totalTimeOnField: 0, subNow: false, position: "field", timeOnField: 0
  })
  pos++;
})

let isRunning = useState<Boolean>(() => false);
let history = useState<string[]>(() => []);

let version = "v0.7";

let interval: any = null;


function substitute(player: any, status: string) {
  if (status === "off") {
    // Sub off
    history.value.push(new Date().toLocaleTimeString() + ": player " + player.name + " went off field with " + formatTime(player.timeOnField) + " time on field");
    offFieldPlayers.value.push({
      ...player,
      timeOffField: 0,
      baseTotalTimeOffField: player.totalTimeOffField,
      subOffTime: new Date().getTime(),
      lastUpdateOff: new Date().getTime()
    });
    onFieldPlayers.value = onFieldPlayers.value.filter(p => p.id !== player.id);
  } else {
    // Sub on
    history.value.push(new Date().toLocaleTimeString() + ": player " + player.name + " went on field");
    onFieldPlayers.value.push({
      ...player,
      timeOnField: 0,
      subNow: false,
      baseTotalTimeOnField: player.totalTimeOnField,
      subOnTime: new Date().getTime(),
      lastUpdateOn: new Date().getTime()
    });
    offFieldPlayers.value = offFieldPlayers.value.filter(p => p.id !== player.id);
  }
}

function swapTopPlayers() {
  if (onFieldPlayers.value.length > 0 && offFieldPlayers.value.length > 0) {
    const onFieldTop: any = onFieldPlayers.value.shift();
    const offFieldTop: any = offFieldPlayers.value.shift();

    history.value.push(new Date().toLocaleTimeString() + ": player " + onFieldTop.name + " went off field with " + formatTime(onFieldTop.timeOnField) + " time on field");
    history.value.push(new Date().toLocaleTimeString() + ": player " + offFieldTop.name + " went on field");
    
    onFieldTop.timeOffField = 0;
    onFieldTop.subNow = false;

    offFieldTop.timeOnField = 0;
    offFieldTop.subNow = false;

    onFieldPlayers.value.push(offFieldTop);
    offFieldPlayers.value.push(onFieldTop);
  }
}

function resetTimer() {
  history.value.push(new Date().toLocaleTimeString() + ": timer reset");
  totalTime.value = 0;
}

function toggleTimer() {
  console.log("toggleTimer");
  if (isRunning.value) {
    history.value.push(new Date().toLocaleTimeString() + ": timer stopped");
    clearInterval(interval);
    isRunning.value = false;

    diffTime.value = 0;

  } else {
    history.value.push(new Date().toLocaleTimeString() + ": timer started");
    isRunning.value = true;
    lastUpdated = new Date().getTime();
    timerStartTime.value = new Date().getTime();
    
    interval = setInterval(() => {
      const currentTime = new Date().getTime();
      const currentDiffTime = Math.abs(currentTime - lastUpdated);
      lastUpdated = currentTime;

      totalTime.value += currentDiffTime;

      onFieldPlayers.value.forEach(player => {
        player.timeOnField += currentDiffTime;
        player.totalTimeOnField += currentDiffTime;

        if (!player.subNow && player.timeOnField > SubTotalTime.value * 1000) {
          player.subNow = true;
        }

      });
      offFieldPlayers.value.forEach(player => {
        player.timeOffField += currentDiffTime;
        player.totalTimeOffField += currentDiffTime;
      });
    }, 200);
  }
}

function formatTime(millis: number): string {
  const diffSeconds = Math.floor(millis / 1000) % 60;
  const diffMinutes = Math.floor(millis / (1000 * 60)) % 60;
  const diffHours = Math.floor(millis / (1000 * 60 * 60)) % 24;
  const diffDays = Math.floor(millis / (1000 * 60 * 60 * 24));

  return diffMinutes.toString().padStart(2, '0') + ":" + diffSeconds.toString().padStart(2, '0');
}

</script>

<template>
  <div class="p-2">
    <div class="flex">
      <h2 class="mr-5">Total time: {{ formatTime(totalTime) }}</h2>
      <UBadge v-if="isRunning" color="neutral">Running</UBadge>
    </div>

    <div class="lists mt-2">
      <div class="list" style="width: 100%">
        <h2 class="flex items-center">
          <UIcon name="i-lucide-circle-play" class="size-5 mr-1"/>
          On Field
        </h2>
        <ul>
          <li v-for="player in onFieldPlayers" :key="player.id"
              class="border-lime-400 mb-2 border-1 border-solid p-1 rounded-b-lg"
              :style="{ borderColor: player.subNow ? 'red' : 'green'}">
            <div><b>{{ player.name }}</b> <UBadge color="error" class="ml-1" v-if="player.subNow">Sub</UBadge></div>
            <div>
              <UIcon name="i-lucide-clock" class="size-3"/>
              {{ formatTime(player.timeOnField) }} ({{ formatTime(player.totalTimeOnField) }})
            </div>
            <UButton @click="substitute(player, 'off')" trailing-icon="i-lucide-arrow-right" size="md">Sub Off</UButton>
            
          </li>
          <li v-if="onFieldPlayers.length === 0">
            <UBadge color="neutral">No players on the field</UBadge>
          </li>
        </ul>
      </div>
      <div class="list" style="width: 100%">
        <h2 class="flex items-center">
          <UIcon name="i-lucide-circle-pause" class="size-5 mr-1"/>
          Off Field
        </h2>
        <ul>
          <li v-for="player in offFieldPlayers" :key="player.id"
              class="mb-2 border-lime-400 border-1 border-solid p-1 rounded-b-lg">
            <div class="flex">
              <div class="flex-col">
                <b>{{ player.name }}</b>
                <div>
                  <UIcon name="i-lucide-clock" class="size-3"/>
                  {{ formatTime(player.timeOffField) }} ({{ formatTime(player.totalTimeOffField) }})
                </div>
              </div>
              <div class="flex-1">
              </div>
              <div class="flex items-center justify-end">
                <UButton @click="substitute(player, 'on')" trailing-icon="i-lucide-arrow-left" size="md"></UButton>
              </div>
            </div>
          </li>
          <li v-if="offFieldPlayers.length === 0">
            <UBadge color="neutral">No players off the field</UBadge>
          </li>
        </ul>
      </div>
    </div>
    <div class="mt-2">
      <UButton @click="toggleTimer" trailing-icon="i-lucide-clock">{{ isRunning ? "Stop" : "Start" }}</UButton>
      <UButton @click="resetTimer" class="ml-2" trailing-icon="i-lucide-circle-x">Reset</UButton>

      <UButton @click="swapTopPlayers" class="ml-2" trailing-icon="i-lucide-arrow-right-left">Swap</UButton>

    </div>
    
    <div class="list mt-2">
      <UAccordion :items="accordionItems">
        <template #content="{ item }">
          <ul>
            <li v-for="hist in history" :key="hist" class="mb-4">{{ hist }}</li>
          </ul>
        </template>


      </UAccordion>
    </div>
    
    <div class="list mt-2">
      2025 {{ version }}
    </div>
  </div>
</template>

<style scoped>
.lists {
  display: flex;
  gap: 5px;
}

.list {
}

</style>
