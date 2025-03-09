let damage = 0;

function updateValueDisplay() {
    document.getElementById('damage-display').innerHTML = `Damage: ${damage}`;
}

const overpowerName = "Overpower";
let rendAbility = {name: "Rend", gcd: 1, cooldown: null, debuff: "rend"};
let overpowerAbility = {name: overpowerName, gcd: 0.5, cooldown: null, debuff: null, available: false, damage: 55269.98};
const abilities = [
    overpowerAbility,
    {name: "Mortal Strike", gcd: 1.0, cooldown: 5, debuff: null, damage: 114769.09},
    {name: "Whirlwind", gcd: 1, cooldown: 4, debuff: null, damage: 51873.84},
    {name: "Slam", gcd: 1, cooldown: null, debuff: null, damage: 18102.01},
    rendAbility,
    {name: "Idle 0.5s", gcd: 0.5, cooldown: null, debuff: null},
];

abilities.forEach(function (ability) {
    ability.count = 0;
    ability.pressed = Number.MIN_SAFE_INTEGER;
});

let debuffs = []; // Actually only one element tracked (REND)
let timeline = [{time: 0, ability: null}];
let currentTime = 0;

renderTimeline();

// Render ability buttons
const abilitiesContainer = document.getElementById("abilities");
renderAbilities()

function renderAbilities() {
    abilitiesContainer.innerHTML = ""; // Clear existing buttons

    abilities.forEach((ability) => {
        const button = document.createElement("button");
        button.className = "ability-button";
        button.textContent = `${ability.name} (CD: ${ability.cooldown}s) Count: ${ability.count}`;
        button.addEventListener("click", () => applyAbility(ability));
        abilitiesContainer.appendChild(button);
    });
}

abilityAvailability();

function abilityAvailability() {
    for (let iterated of abilities) {
        let available = false;

        if (iterated.name === overpowerName) {
            if (debuffs.length !== 0) {
                let difference = currentTime - rendAbility.pressed;
                if (difference >= 3) { // Rend ticks
                    rendAbility.pressed += 3;
                    iterated.available = true;
                }
            }
        }

        if (iterated.cooldown != null) {
            if (iterated.pressed + iterated.cooldown <= currentTime) {
                available = true;
            }
        } else {
            available = true;
        }

        if (iterated.name === overpowerName && !iterated.available) {
            available = false
        }

        const button = abilitiesContainer.children[abilities.indexOf(iterated)];
        button.disabled = !available;
    }
}

function applyAbility(ability) {
    if (ability.name === overpowerName) {
        ability.available = false;
    }

    if (ability.debuff) {
        timeline[timeline.length - 1] = {time: currentTime, ability: ability.name, rend: 36};
        debuffs.push({name: ability.debuff, duration: 36, ticks: [0, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33]});
    } else if (debuffs.length !== 0) {
        timeline[timeline.length - 1] = {time: currentTime, ability: ability.name, rend: debuffs[0].duration};
    } else {
        timeline[timeline.length - 1] = {time: currentTime, ability: ability.name};
    }

    if (ability.damage) {
        damage += ability.damage;
    }
    ability.count++;
    ability.pressed = currentTime;
    // Update current time based on GCD
    currentTime += ability.gcd;
    if (debuffs.length !== 0) {
        let debuff = debuffs[0];
        debuff.duration -= ability.gcd;
        if (debuff.duration <= 0) {
            overpowerAbility.available = true;
            debuffs = [];
        }
    }

    if (debuffs.length !== 0) {
        timeline.push({time: currentTime, ability: null, rend: debuffs[0].duration});
    } else {
        timeline.push({time: currentTime, ability: null});
    }
    renderTimeline();
    updateValueDisplay()

    renderAbilities()
    abilityAvailability();
}

// Renders the timeline
function renderTimeline() {
    const timelineContent = document.getElementById("timeline-content");
    timelineContent.innerHTML = "";
    timeline.forEach((entry) => {
        const item = document.createElement("div");
        item.className = "timeline-item";
        if (entry.ability == null) {
            item.textContent = `${entry.time}s`;
            item.style.backgroundColor = "green";
        } else {
            item.textContent = `${entry.time}s:\t\t${entry.ability}`;
            let colour;
            if (entry.ability === overpowerName) {
                colour = "cyan";
            } else if (entry.ability === "Mortal Strike") {
                colour = "silver"
            } else if (entry.ability === "Whirlwind") {
                colour = "#2ba0e3"
            } else {
                colour = "transparent";
            }
            item.style.backgroundColor = colour;
        }

        if (entry.rend) {
            item.textContent += `\t\t\t\t\t\t${entry.rend}`
        }
        timelineContent.appendChild(item);
    });
}