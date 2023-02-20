export function lubeChooser() {
    let lubes = ["DNA", "RNA", "Atomic", "Lunar", "Martian", "Galaxy", "Nebula", "Jack O'Lantern", "Solar", "Candy Cane", "Biocube Core", "Vortex", "Controlius", "Silk", "DNM-37", "Compound X", "Gravitas", "Dignitas", "Celeritas", "Lubicle Speedy", "Lubicle Black", "Lubicle 1", "Mystic", "Max Command", "Max Fleet", "Lubest XMT10", "Silicone Spray", "Super Bonder", "Mel", "Leite", "Cola Branca", "Brita", "Sky", "Volcano", "Shampoo", "Vaselina", "WD-40"];
    for (let i = lubes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [lubes[i], lubes[j]] = [lubes[j], lubes[i]];
    }
    return "Core: " + lubes[0] + " / Tracks: " + lubes[1] + " / Peças: " + lubes[2] + " e " + lubes[3];
}