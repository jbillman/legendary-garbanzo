let seaweed = 3000;
let soda_ash = 2801;

function calculateXp(seaweed,soda_ash){
   let sand = seaweed * 6 + soda_ash;
   let magicXp = Math.floor(sand / 18) * 78;
   let craftingXp = sand * 10 + Math.floor(sand * 1.5 * 52.5); 
   console.log(`Magic xp is: ${magicXp}. Crafting xp is: ${craftingXp}.`);

   let fireRunes = Math.ceil((sand/18) * 6);
   let airRunes = Math.ceil((sand/18) * 10);
   let astralRunes = Math.ceil((sand/18) * 2);
   console.log(`You will need ${airRunes} air Runes, ${fireRunes} fire runes and ${astralRunes} astral runes.`)
}

calculateXp(seaweed, soda_ash);


